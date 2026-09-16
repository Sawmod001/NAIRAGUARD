import { describe, it, expect } from "vitest";
import { savingsPercentage, aggregateSavings } from "@/domain/finops/savings";
import { toNairaEquivalent } from "@/domain/fx/conversion";
import { prioritizeRecommendations } from "@/domain/optimizations/prioritize";
import { demoDatasetSchema } from "@/schemas/demo";

describe("finops", () => {
  it("savingsPercentage handles zero -> null", () => {
    expect(savingsPercentage(0, 10)).toBeNull();
    expect(savingsPercentage(100, 25)).toBe(25);
  });
  it("aggregateSavings deterministic", () => {
    const agg = aggregateSavings([{ estimatedMonthlyCostUsd: 100, estimatedMonthlySavingsUsd: 20 }]);
    expect(agg.totalCostUsd).toBe(100);
    expect(agg.totalSavingsUsd).toBe(20);
  });
  it("toNairaEquivalent 120*1550=186000", () => {
    const eq = toNairaEquivalent(120, { rate: 1550, observedAt: "2026-09-15T00:00:00Z", source: "demo" });
    expect(eq.naira).toBe(186000);
    expect(eq.usd).toBe(120);
  });
  it("prioritize deterministic", () => {
    const items = [
      { externalId: "A", estimatedMonthlySavingsUsd: 100, savingsPercentage: 10, effort: "Low" as const, restartRequired: false, rollbackPossible: true },
      { externalId: "B", estimatedMonthlySavingsUsd: 50, savingsPercentage: 50, effort: "High" as const, restartRequired: true, rollbackPossible: false },
    ];
    const sorted = prioritizeRecommendations(items);
    expect(sorted[0]!.externalId).toBe("A");
  });
  it("demo dataset valid", () => {
    const raw = { scenario: { id: "balanced-startup", name: "Balanced", accountId: "123456789012" }, cost: { periodDays: 1, daily: [{ dateOffset: 0, amountUsd: 10 }], serviceBreakdown: [{ service: "EC2", amountUsd: 10, percentage: 100 }] }, fx: { usdNgn: 1500, provider: "x", observedAt: "2026-09-15T00:00:00Z" }, recommendations: [] };
    expect(demoDatasetSchema.safeParse(raw).success).toBe(true);
  });
});
