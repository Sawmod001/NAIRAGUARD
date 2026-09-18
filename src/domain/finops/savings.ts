/**
 * Savings calculations — NG-302 Deterministic, never AI
 * Handles edge cases: zero/undefined denominators → null, not NaN/Infinity
 */

function toCents(usd: number) { return Math.round(usd * 100); }

export function savingsPercentage(costUsd: number | null | undefined, savingsUsd: number | null | undefined): number | null {
  if (costUsd === null || costUsd === undefined || savingsUsd === null || savingsUsd === undefined) return null;
  if (costUsd <= 0) return null;
  if (savingsUsd < 0) return null;
  const pct = (savingsUsd / costUsd) * 100;
  if (!isFinite(pct)) return null;
  return Math.round(pct * 100) / 100; // 2 decimals
}

export function savingsPercentageFromCents(costCents: number | null | undefined, savingsCents: number | null | undefined): number | null {
  if (costCents === null || costCents === undefined || savingsCents === null || savingsCents === undefined) return null;
  if (costCents <= 0) return null;
  if (savingsCents < 0) return null;
  const pct = (savingsCents / costCents) * 100;
  if (!isFinite(pct)) return null;
  return Math.round(pct * 100) / 100;
}

export type SavingsAggregate = {
  totalCostUsd: number;
  totalSavingsUsd: number;
  totalCostCents: number; // authoritative
  totalSavingsCents: number; // authoritative
  averageSavingsPercentage: number | null;
  count: number;
};

export function aggregateSavings(items: { estimatedMonthlyCostUsd: number; estimatedMonthlySavingsUsd: number }[]): SavingsAggregate {
  let totalCostCents = 0;
  let totalSavingsCents = 0;
  for (const i of items) {
    totalCostCents += toCents(i.estimatedMonthlyCostUsd ?? 0);
    totalSavingsCents += toCents(i.estimatedMonthlySavingsUsd ?? 0);
  }
  const pct = savingsPercentageFromCents(totalCostCents, totalSavingsCents);
  return {
    totalCostUsd: Math.round(totalCostCents) / 100,
    totalSavingsUsd: Math.round(totalSavingsCents) / 100,
    totalCostCents,
    totalSavingsCents,
    averageSavingsPercentage: pct,
    count: items.length,
  };
}

/** Potential savings for a single recommendation — explicit term per docs/07. */
export function potentialMonthlySavingsUsd(rec: { estimatedMonthlySavingsUsd: number }): number {
  return Math.round((rec.estimatedMonthlySavingsUsd ?? 0) * 100) / 100;
}

export function potentialMonthlySavingsCents(rec: { estimatedMonthlySavingsUsd: number }): number {
  return toCents(rec.estimatedMonthlySavingsUsd ?? 0);
}
