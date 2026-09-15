/**
 * Optimization Domain Types — NG-304
 * Minimal for prioritization; full recommendation types live in provider contracts.
 */

export type PrioritizationInput = {
  externalId: string;
  estimatedMonthlySavingsUsd: number;
  savingsPercentage?: number | null;
  effort: "Low" | "Medium" | "High";
  restartRequired: boolean;
  rollbackPossible: boolean;
  source?: string;
  resourceType?: string;
};

export type PrioritizedRecommendation<T extends PrioritizationInput> = T & {
  // NairaGuard prioritization score — NOT an AWS score (docs/07:5)
  nairaGuardScore: number;
  rank: number;
  reason: string;
};
