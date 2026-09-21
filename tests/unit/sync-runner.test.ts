import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockSyncRun } = vi.hoisted(() => ({
  mockSyncRun: { findFirst: vi.fn(), create: vi.fn(), updateMany: vi.fn() },
}));

vi.mock("@/lib/prisma/client", () => ({ prisma: { syncRun: mockSyncRun } }));

import { runSync, type SyncProvider } from "@/lib/sync/runner";
import { createDemoSyncProvider } from "@/lib/sync/demo-provider";

/**
 * NG-SYNC-02: runner semantics against an in-memory Prisma stub —
 * dedupe, guarded transitions, success/partial/failure, lost races.
 */

type Row = {
  id: string;
  organizationId: string;
  status: string;
  source: string;
  awsConnectionId: string | null;
  startedAt: Date | null;
  finishedAt: Date | null;
  error: string | null;
  recordCounts: Record<string, number> | null;
  createdAt: Date;
};

let rows: Row[];
let seq: number;

function installStub() {
  mockSyncRun.findFirst.mockImplementation(async ({ where }: { where: { organizationId: string; status?: { in: string[] } } }) => {
    const hit = rows
      .filter((r) => r.organizationId === where.organizationId && (!where.status?.in || where.status.in.includes(r.status)))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
    return hit ?? null;
  });
  mockSyncRun.create.mockImplementation(async ({ data }: { data: { organizationId: string; awsConnectionId: string | null; source: string; status: string } }) => {
    seq += 1;
    const row: Row = {
      id: `run-${seq}`,
      organizationId: data.organizationId,
      awsConnectionId: data.awsConnectionId,
      source: data.source,
      status: data.status,
      startedAt: null,
      finishedAt: null,
      error: null,
      recordCounts: null,
      createdAt: new Date(Date.now() + seq),
    };
    rows.push(row);
    return row;
  });
  mockSyncRun.updateMany.mockImplementation(
    async ({ where, data }: { where: { id: string; status: string }; data: Partial<Row> }) => {
      const row = rows.find((r) => r.id === where.id && r.status === where.status);
      if (!row) return { count: 0 };
      Object.assign(row, data);
      return { count: 1 };
    }
  );
}

const okProvider: SyncProvider = {
  source: "DEMO",
  fetch: vi.fn(async () => ({ counts: { days: 30, services: 8, recommendations: 2 } })),
};

beforeEach(() => {
  rows = [];
  seq = 0;
  vi.clearAllMocks();
  installStub();
});

describe("sync runner (NG-SYNC-02)", () => {
  it("runs QUEUED → RUNNING → SUCCEEDED with counts and timestamps", async () => {
    const res = await runSync({ organizationId: "org-1", provider: okProvider });
    expect(res).toMatchObject({ status: "SUCCEEDED", deduped: false });
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      status: "SUCCEEDED",
      recordCounts: { days: 30, services: 8, recommendations: 2 },
    });
    expect(rows[0]!.startedAt).toBeInstanceOf(Date);
    expect(rows[0]!.finishedAt).toBeInstanceOf(Date);
  });

  it("dedupes onto the in-flight run without calling the provider", async () => {
    rows.push({
      id: "run-live", organizationId: "org-1", status: "RUNNING", source: "DEMO", awsConnectionId: null,
      startedAt: new Date(), finishedAt: null, error: null, recordCounts: null, createdAt: new Date(),
    });
    const fetch = vi.fn(async () => ({ counts: {} }));
    const res = await runSync({ organizationId: "org-1", provider: { source: "DEMO", fetch } });
    expect(res).toMatchObject({ runId: "run-live", status: "RUNNING", deduped: true });
    expect(fetch).not.toHaveBeenCalled();
    expect(rows).toHaveLength(1);
  });

  it("records PARTIAL when the provider reports incomplete results", async () => {
    const res = await runSync({
      organizationId: "org-1",
      provider: { source: "AWS", fetch: async () => ({ counts: { days: 12 }, partial: true }) },
    });
    expect(res).toMatchObject({ status: "PARTIAL", deduped: false });
    expect(rows[0]!.status).toBe("PARTIAL");
  });

  it("records FAILED with truncated error and keeps history", async () => {
    const res = await runSync({
      organizationId: "org-1",
      provider: {
        source: "AWS",
        fetch: async () => { throw new Error("boom ".repeat(200)); },
      },
    });
    expect(res.status).toBe("FAILED");
    expect(res.error).toBeDefined();
    expect(res.error!.length).toBeLessThanOrEqual(500);
    expect(rows[0]).toMatchObject({ status: "FAILED" });
    expect(rows[0]!.error).toBe(res.error);
  });

  it("loser of a start race returns the winner", async () => {
    mockSyncRun.updateMany.mockImplementationOnce(async () => ({ count: 0 }));
    rows.push({
      id: "run-winner", organizationId: "org-1", status: "RUNNING", source: "DEMO", awsConnectionId: null,
      startedAt: new Date(), finishedAt: null, error: null, recordCounts: null, createdAt: new Date(Date.now() + 100),
    });
    const res = await runSync({ organizationId: "org-1", provider: okProvider });
    expect(res).toMatchObject({ runId: "run-winner", deduped: true });
  });

  it("demo provider reports real seed counts", async () => {
    const out = await createDemoSyncProvider("balanced-startup").fetch({ organizationId: "org-1" });
    expect(out).toEqual({ counts: { days: 30, services: 8, recommendations: 2 } });
  });
});
