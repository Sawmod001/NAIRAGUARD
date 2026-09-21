import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockReads } = vi.hoisted(() => ({
  mockReads: { syncRun: { findFirst: vi.fn() }, costSnapshot: { findFirst: vi.fn() }, awsConnection: { findFirst: vi.fn() } },
}));

vi.mock("@/lib/prisma/client", () => ({
  prisma: {
    syncRun: { findFirst: mockReads.syncRun.findFirst },
    costSnapshot: { findFirst: mockReads.costSnapshot.findFirst },
    awsConnection: { findFirst: mockReads.awsConnection.findFirst },
  },
}));

import { getWorkspaceFreshness } from "@/lib/dashboard/freshness";
import { formatAge, isStaleObservation } from "@/domain/sync/runs";

/** NG-DASH-06: freshness reads are honest — real timestamps, explicit never-synced. */
describe("workspace freshness (NG-DASH-06)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("formats ages for freshness lines", () => {
    const now = new Date("2026-09-16T12:00:00.000Z").getTime();
    expect(formatAge(new Date(now - 30_000).toISOString(), now)).toBe("just now");
    expect(formatAge(new Date(now - 5 * 60_000).toISOString(), now)).toBe("5 min ago");
    expect(formatAge(new Date(now - 3 * 3_600_000).toISOString(), now)).toBe("3h ago");
    expect(formatAge(new Date(now - 3 * 86_400_000).toISOString(), now)).toBe("3d ago");
  });

  it("flags stale observations past the threshold", () => {
    const now = new Date("2026-09-16T12:00:00.000Z").getTime();
    expect(isStaleObservation(new Date(now - 25 * 3_600_000).toISOString(), now)).toBe(true);
    expect(isStaleObservation(new Date(now - 1 * 3_600_000).toISOString(), now)).toBe(false);
  });

  it("composes run, snapshot, and connection state", async () => {
    mockReads.syncRun.findFirst.mockResolvedValue({
      status: "SUCCEEDED",
      finishedAt: new Date("2026-09-16T11:00:00.000Z"),
      createdAt: new Date("2026-09-16T10:59:00.000Z"),
    });
    mockReads.costSnapshot.findFirst.mockResolvedValue({ observedAt: new Date("2026-09-15T00:00:00.000Z") });
    mockReads.awsConnection.findFirst.mockResolvedValue({ status: "CONNECTED" });

    const freshness = await getWorkspaceFreshness("org-1");
    expect(freshness).toEqual({
      lastSyncAt: "2026-09-16T11:00:00.000Z",
      lastSyncStatus: "SUCCEEDED",
      snapshotObservedAt: "2026-09-15T00:00:00.000Z",
      connectionStatus: "CONNECTED",
    });
  });

  it("hides disconnected connections and tolerates emptiness", async () => {
    mockReads.syncRun.findFirst.mockResolvedValue(null);
    mockReads.costSnapshot.findFirst.mockResolvedValue(null);
    mockReads.awsConnection.findFirst.mockResolvedValue({ status: "DISCONNECTED" });

    const freshness = await getWorkspaceFreshness("org-1");
    expect(freshness).toEqual({
      lastSyncAt: null,
      lastSyncStatus: null,
      snapshotObservedAt: null,
      connectionStatus: null,
    });
  });
});
