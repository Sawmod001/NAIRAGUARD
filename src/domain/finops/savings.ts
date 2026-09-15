/**
 * Savings calculations — NG-302 Deterministic, never AI
 * Handles edge cases: zero/undefined denominators → null, not NaN/Infinity
 */

export function savingsPercentage(costUsd: number | null | undefined, savingsUsd: number | null | undefined): number | null {
  if (costUsd === null || costUsd === undefined || savingsUsd === null || savingsUsd === undefined) return null;
  if (costUsd <= 0) return null;
  if (savingsUsd < 0) return null;
  const pct = (savingsUsd / costUsd) * 100;
  if (!isFinite(pct)) return null;
  return Math.round(pct * 100) / 100; // 2 decimals
}

export type SavingsAggregate = {
  totalCostUsd: number;
  totalSavingsUsd: number;
  averageSavingsPercentage: number | null;
  count: number;
};

export function aggregateSavings(items: { estimatedMonthlyCostUsd: number; estimatedMonthlySavingsUsd: number }[]): SavingsAggregate {
  const totalCostUsd = items.reduce((s, i) => s + (i.estimatedMonthlyCostUsd ?? 0), 0);
  const totalSavingsUsd = items.reduce((s, i) => s + (i.estimatedMonthlySavingsUsd ?? 0), 0);
  const pct = savingsPercentage(totalCostUsd, totalSavingsUsd);
  return {
    totalCostUsd: Math.round(totalCostUsd * 100) / 100,
    totalSavingsUsd: Math.round(totalSavingsUsd * 100) / 100,
    averageSavingsPercentage: pct,
    count: items.length,
  };
}

/** Potential savings for a single recommendation — explicit term per docs/07. */
export function potentialMonthlySavingsUsd(rec: { estimatedMonthlySavingsUsd: number }): number {
  return Math.round((rec.estimatedMonthlySavingsUsd ?? 0) * 100) / 100;
}
