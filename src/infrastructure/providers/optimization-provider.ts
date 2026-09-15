/**
 * OptimizationProvider — NG-201
 * Normalized recommendation contract. Demo + future AWS (Cost Optimization Hub / Compute Optimizer).
 * Preserves source semantics; NairaGuard never invents savings.
 */

export type RecommendationSource = string; // e.g. "AWS Cost Optimization Hub" | "AWS Compute Optimizer"

export type RecommendationEffort = "Low" | "Medium" | "High";

export type RecommendationActionType = string; // e.g. "Rightsize" | "Optimize storage" | "Idle delete"

export type NormalizedRecommendation = {
  externalId: string;
  source: RecommendationSource;
  resourceType: string; // e.g. "Ec2Instance" | "EbsVolume"
  resourceId: string;
  resourceArn?: string | null;
  region: string;
  actionType: RecommendationActionType;
  currentConfiguration: string;
  recommendedConfiguration: string;
  estimatedMonthlyCostUsd: number;
  estimatedMonthlySavingsUsd: number;
  savingsPercentage?: number | null;
  effort: RecommendationEffort;
  restartRequired: boolean;
  rollbackPossible: boolean;
  status?: string; // e.g. "open"
  observedAt: string; // ISO
};

export type OptimizationQuery = {
  organizationId: string;
  accountId?: string | null;
  region?: string | null;
  service?: string | null;
};

export interface OptimizationProvider {
  getRecommendations(query: OptimizationQuery): Promise<NormalizedRecommendation[]>;
  getRecommendationById?(id: string, query: OptimizationQuery): Promise<NormalizedRecommendation | null>;
}
