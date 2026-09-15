import type { DomainCost } from "@/domain/costs";
import type { NormalizedRecommendation } from "@/infrastructure/providers/optimization-provider";
import { aggregateSavings } from "@/domain/finops";
import { prioritizeRecommendations } from "@/domain/optimizations";
import { convertUsdToNgn } from "@/domain/fx";
import type { DashboardSummary } from "./types";

type FxContext = { rate: number; observedAt: string; source: string } | null;

/**
 * Dashboard aggregation — NG-305 Application layer
 * Deterministic, uses domain calcs (NG-302/303/304), no AI.
 */
export function aggregateDashboard(params: {
  organizationId: string;
  cost: DomainCost;
  recommendations: NormalizedRecommendation[];
  fx: FxContext;
}): DashboardSummary {
  const { cost, recommendations, fx, organizationId } = params;

  const savingsAgg = aggregateSavings(recommendations);
  const prioritized = prioritizeRecommendations(recommendations);

  const totalSpendNgn = fx ? convertUsdToNgn(cost.total, fx.rate) : null;
  const potentialSavingsNgn = fx ? convertUsdToNgn(savingsAgg.totalSavingsUsd, fx.rate) : null;

  const topDrivers = [...cost.services].sort((a, b) => b.amount - a.amount).slice(0, 5);
  const topOptimizations = prioritized.slice(0, 3).map((r) => ({
    externalId: r.externalId,
    savingsUsd: r.estimatedMonthlySavingsUsd,
    savingsNgn: fx ? convertUsdToNgn(r.estimatedMonthlySavingsUsd, fx.rate) : null,
    nairaGuardScore: r.nairaGuardScore,
  }));

  return {
    organizationId,
    totalSpendUsd: cost.total,
    totalSpendNgn,
    estimatedNairaLabel: "Estimated Naira equivalent",
    fxRate: fx?.rate ?? null,
    fxObservedAt: fx?.observedAt ?? null,
    fxSource: fx?.source ?? null,
    potentialSavingsUsd: savingsAgg.totalSavingsUsd,
    potentialSavingsNgn,
    topDrivers: topDrivers.map((d) => ({ service: d.service, amountUsd: d.amount, percentage: d.percentage })),
    optimizationCount: recommendations.length,
    topOptimizations,
    trend: cost.daily.map((d) => ({ date: d.date, amountUsd: d.amount })),
    freshness: { observedAt: cost.observedAt, source: cost.source },
  };
}
