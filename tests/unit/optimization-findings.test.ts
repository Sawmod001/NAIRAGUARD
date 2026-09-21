import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockFinding, mockTx } = vi.hoisted(() => ({
  mockFinding: { findUnique: vi.fn(), findMany: vi.fn() },
  mockTx: { optimizationFinding: { findUnique: vi.fn(), update: vi.fn(), create: vi.fn() } },
}));

vi.mock("@/lib/prisma/client", () => ({
  prisma: {
    optimizationFinding: {
      findUnique: mockFinding.findUnique,
      findMany: mockFinding.findMany,
    },
    $transaction: async (fn: (tx: unknown) => Promise<unknown>) => fn(mockTx),
  },
}));

import { listOptimizationFindings, saveOptimizationFindings } from "@/lib/optimizations/findings";
import type { NormalizedRecommendation } from "@/infrastructure/providers/optimization-provider";

/** NG-OPT-03: findings persist cent-exact, upsert per run, read back ordered. */
describe("optimization findings (NG-OPT-03)", () => {
  const item: NormalizedRecommendation = {
    externalId: "rec-1",
    source: "AWS Cost Optimization Hub",
    resourceType: "Ec2Instance",
    resourceId: "i-0abc",
    resourceArn: "arn:aws:ec2:eu-west-1:123456789012:instance/i-0abc",
    region: "eu-west-1",
    actionType: "Rightsize",
    currentConfiguration: "m6i.2xlarge",
    recommendedConfiguration: "m6i.xlarge",
    estimatedMonthlyCostUsd: 286.4,
    estimatedMonthlySavingsUsd: 118.7,
    savingsPercentage: 41.45,
    effort: "Low",
    restartRequired: true,
    rollbackPossible: true,
    status: "open",
    observedAt: "2026-09-15T00:00:00.000Z",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates findings with cent-exact savings", async () => {
    mockTx.optimizationFinding.findUnique.mockResolvedValue(null);
    mockTx.optimizationFinding.create.mockResolvedValue({ id: "f-1" });

    const res = await saveOptimizationFindings({ organizationId: "org-1", syncRunId: "run-1", items: [item] });

    expect(res).toEqual({ created: 1, updated: 0 });
    const created = mockTx.optimizationFinding.create.mock.calls[0]![0];
    expect(created.data).toMatchObject({
      externalId: "rec-1",
      estimatedMonthlyCostCents: 28640,
      estimatedMonthlySavingsCents: 11870,
      savingsPercentage: 41.45,
      effort: "Low",
    });
  });

  it("updates existing findings instead of duplicating", async () => {
    mockTx.optimizationFinding.findUnique.mockResolvedValue({ id: "f-old" });
    mockTx.optimizationFinding.update.mockResolvedValue({ id: "f-old" });

    const res = await saveOptimizationFindings({ organizationId: "org-1", syncRunId: "run-2", items: [item] });

    expect(res).toEqual({ created: 0, updated: 1 });
    expect(mockTx.optimizationFinding.create).not.toHaveBeenCalled();
    const updated = mockTx.optimizationFinding.update.mock.calls[0]![0];
    expect(updated.where).toEqual({ id: "f-old" });
    expect(updated.data.syncRunId).toBe("run-2");
  });

  it("lists findings with evidence intact", async () => {
    const { prisma } = await import("@/lib/prisma/client");
    vi.mocked(prisma.optimizationFinding.findMany).mockResolvedValue([
      {
        id: "f-1",
        externalId: "rec-1",
        source: "AWS Cost Optimization Hub",
        resourceType: "Ec2Instance",
        resourceId: "i-0abc",
        resourceArn: "arn:aws:ec2:eu-west-1:123456789012:instance/i-0abc",
        region: "eu-west-1",
        accountId: null,
        actionType: "Rightsize",
        currentConfiguration: "m6i.2xlarge",
        recommendedConfiguration: "m6i.xlarge",
        estimatedMonthlyCostCents: 28640,
        estimatedMonthlySavingsCents: 11870,
        savingsPercentage: 41.45,
        effort: "Low",
        restartRequired: true,
        rollbackPossible: true,
        status: "open",
        observedAt: new Date("2026-09-15T00:00:00.000Z"),
      },
    ] as never);

    const rows = await listOptimizationFindings({ organizationId: "org-1" });
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      externalId: "rec-1",
      estimatedMonthlySavingsCents: 11870,
      observedAt: "2026-09-15T00:00:00.000Z",
    });
  });

  it("clamps list limits", async () => {
    const { prisma } = await import("@/lib/prisma/client");
    vi.mocked(prisma.optimizationFinding.findMany).mockResolvedValue([]);
    await listOptimizationFindings({ organizationId: "org-1", limit: 5000 });
    const call = vi.mocked(prisma.optimizationFinding.findMany).mock.calls[0]!;
    expect(call[0]).toMatchObject({ take: 200, orderBy: { estimatedMonthlySavingsCents: "desc" } });
  });
});
