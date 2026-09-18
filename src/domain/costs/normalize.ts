import type { CostResult } from "@/infrastructure/providers/cost-provider";
import type { DomainCost } from "./types";

/**
 * Normalize CostProvider result → DomainCost — NG-301
 * - Explicit USD currency on every amount
 * - Explicit ISO timestamps
 * - Preserve account/service/region relationships
 * - No provider type leaks (CostResult → DomainCost, drop provider internals)
 */

function toCents(usd: number) { return Math.round(usd * 100); }
function toDollars(cents: number) { return Math.round(cents) / 100; }

export function normalizeCostResult(input: CostResult): DomainCost {
  const totalCents = toCents(input.totalUsd);
  return {
    organizationId: input.organizationId,
    accountId: input.accountId,
    currency: input.currency,
    periodDays: input.periodDays,
    total: toDollars(totalCents),
    totalCents,
    daily: input.daily.map((d) => ({ date: d.date, amount: d.amountUsd, amountCents: toCents(d.amountUsd), currency: "USD" as const })),
    services: input.serviceBreakdown.map((s) => ({ service: s.service, amount: s.amountUsd, amountCents: toCents(s.amountUsd), currency: "USD" as const, percentage: s.percentage })),
    regions: (input.regionBreakdown ?? []).map((r) => ({ region: r.region, amount: r.amountUsd, amountCents: toCents(r.amountUsd), currency: "USD" as const, percentage: r.percentage })),
    observedAt: input.observedAt,
    source: input.source,
  };
}

export { toCents, toDollars };
