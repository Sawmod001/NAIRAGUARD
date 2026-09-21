import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockCost, mockTx } = vi.hoisted(() => ({
  mockCost: { snapshot: { findFirst: vi.fn() }, breakdown: {} },
  mockTx: { costSnapshot: { create: vi.fn() }, costBreakdown: { createMany: vi.fn() } },
}));

vi.mock("@/lib/prisma/client", () => ({
  prisma: {
    costSnapshot: {
      findFirst: mockCost.snapshot.findFirst,
      create: (...args: unknown[]) => mockTx.costSnapshot.create(...args),
    },
    costBreakdown: { createMany: (...args: unknown[]) => mockTx.costBreakdown.createMany(...args) },
    $transaction: async (fn: (tx: unknown) => Promise<unknown>) => fn(mockTx),
  },
}));

import { getLatestCostSnapshot, saveCostSnapshot } from "@/lib/costs/snapshots";
import type { DomainCost } from "@/domain/costs/types";

/** NG-COST-03: snapshots persist cents + breakdowns, dedupe per run, latest reads back. */
describe("cost snapshots (NG-COST-03)", () => {
  const cost: DomainCost = {
    organizationId: "org-1",
    accountId: "123456789012",
    currency: "USD",
    periodDays: 30,
    total: 1378.16,
    totalCents: 137816,
    daily: [],
    services: [{ service: "EC2", amount: 578.83, amountCents: 57883, currency: "USD", percentage: 42 }],
    regions: [{ region: "eu-west-1", amount: 716.64, amountCents: 71664, currency: "USD", percentage: 52 }],
    observedAt: "2026-09-15T00:00:00.000Z",
    source: "DemoCostProvider",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("saves snapshot plus service and region breakdowns in cents", async () => {
    mockCost.snapshot.findFirst.mockResolvedValue(null);
    mockTx.costSnapshot.create.mockResolvedValue({ id: "snap-1" });
    mockTx.costBreakdown.createMany.mockResolvedValue({ count: 2 });

    const res = await saveCostSnapshot({
      organizationId: "org-1",
      syncRunId: "run-1",
      periodStart: "2026-08-16T00:00:00.000Z",
      periodEnd: "2026-09-15T00:00:00.000Z",
      cost,
    });

    expect(res).toEqual({ id: "snap-1", deduped: false });
    expect(mockTx.costSnapshot.create).toHaveBeenCalledOnce();
    const created = mockTx.costSnapshot.create.mock.calls[0]![0];
    expect(created.data).toMatchObject({ totalCents: 137816, currency: "USD", source: "DemoCostProvider" });
    const rows = mockTx.costBreakdown.createMany.mock.calls[0]![0].data;
    expect(rows).toHaveLength(2);
    expect(rows).toContainEqual(
      expect.objectContaining({ kind: "service", key: "EC2", amountCents: 57883, percentage: 42 })
    );
    expect(rows).toContainEqual(
      expect.objectContaining({ kind: "region", key: "eu-west-1", amountCents: 71664 })
    );
  });

  it("dedupes when the run already stored a snapshot", async () => {
    mockCost.snapshot.findFirst.mockResolvedValue({ id: "snap-old" });
    const res = await saveCostSnapshot({
      organizationId: "org-1",
      syncRunId: "run-1",
      periodStart: "2026-08-16T00:00:00.000Z",
      periodEnd: "2026-09-15T00:00:00.000Z",
      cost,
    });
    expect(res).toEqual({ id: "snap-old", deduped: true });
    expect(mockTx.costSnapshot.create).not.toHaveBeenCalled();
  });

  it("reads the latest snapshot back with split breakdowns", async () => {
    const { prisma } = await import("@/lib/prisma/client");
    // include-breakdowns payload: cast past the no-include overload (runtime shape is what matters here).
    vi.mocked(prisma.costSnapshot.findFirst).mockResolvedValue({
      id: "snap-1",
      organizationId: "org-1",
      syncRunId: "run-1",
      accountId: "123456789012",
      periodStart: new Date("2026-08-16T00:00:00.000Z"),
      periodEnd: new Date("2026-09-15T00:00:00.000Z"),
      totalCents: 137816,
      currency: "USD",
      source: "DemoCostProvider",
      observedAt: new Date("2026-09-15T00:00:00.000Z"),
      createdAt: new Date("2026-09-15T00:00:00.000Z"),
      breakdowns: [
        { id: "b1", snapshotId: "snap-1", kind: "service", key: "EC2", amountCents: 57883, percentage: 42 },
        { id: "b2", snapshotId: "snap-1", kind: "region", key: "eu-west-1", amountCents: 71664, percentage: 52 },
      ],
    } as never);
    const dto = await getLatestCostSnapshot("org-1");
    expect(dto).toMatchObject({ id: "snap-1", totalCents: 137816 });
    expect(dto!.services).toEqual([{ service: "EC2", amountCents: 57883, percentage: 42 }]);
    expect(dto!.regions).toEqual([{ region: "eu-west-1", amountCents: 71664, percentage: 52 }]);
  });

  it("returns null when no snapshot exists", async () => {
    const { prisma } = await import("@/lib/prisma/client");
    vi.mocked(prisma.costSnapshot.findFirst).mockResolvedValue(null);
    await expect(getLatestCostSnapshot("org-1")).resolves.toBeNull();
  });
});
