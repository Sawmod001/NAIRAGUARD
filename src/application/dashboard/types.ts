/**
 * Dashboard Aggregation Types — NG-305
 * Application-level summary that answers: spend, where money goes, waste, savings, Naira.
 */

export type DashboardSummary = {
  organizationId: string;
  totalSpendUsd: number;
  totalSpendNgn: number | null; // null if FX unavailable
  estimatedNairaLabel: string; // "Estimated Naira equivalent"
  fxRate: number | null;
  fxObservedAt: string | null;
  fxSource: string | null;
  potentialSavingsUsd: number;
  potentialSavingsNgn: number | null;
  topDrivers: { service: string; amountUsd: number; percentage: number }[];
  optimizationCount: number;
  topOptimizations: { externalId: string; savingsUsd: number; savingsNgn: number | null; nairaGuardScore: number }[];
  trend: { date: string; amountUsd: number }[];
  freshness: { observedAt: string; source: string };
};
