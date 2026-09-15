import type { CostResult } from "@/infrastructure/providers/cost-provider";
import type { DomainCost } from "./types";

/**
 * Normalize CostProvider result → DomainCost — NG-301
 * - Explicit USD currency on every amount
 * - Explicit ISO timestamps
 * - Preserve account/service/region relationships
 * - No provider type leaks (CostResult → DomainCost, drop provider internals)
 */

export function normalizeCostResult(input: CostResult): DomainCost {
  return {
    organizationId: input.organizationId,
    accountId: input.accountId,
    currency: input.currency,
    periodDays: input.periodDays,
    total: Math.round(input.totalUsd * 100) / 100,
    daily: input.daily.map((d) => ({ date: d.date, amount: d.amountUsd, currency: "USD" as const })),
    services: input.serviceBreakdown.map((s) => ({ service: s.service, amount: s.amountUsd, currency: "USD" as const, percentage: s.percentage })),
    regions: (input.regionBreakdown ?? []).map((r) => ({ region: r.region, amount: r.amountUsd, currency: "USD" as const, percentage: r.percentage })),
    observedAt: input.observedAt,
    source: input.source,
  };
}
