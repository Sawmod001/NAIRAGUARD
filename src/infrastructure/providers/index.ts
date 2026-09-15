/**
 * Provider barrel — NG-201
 * Re-export contracts so app layer depends on interfaces, not concrete providers.
 */
export type { CostProvider, CostQuery, CostResult, CostDailyPoint, CostServiceBreakdown, CostRegionBreakdown } from "./cost-provider";
export type {
  OptimizationProvider,
  OptimizationQuery,
  NormalizedRecommendation,
  RecommendationSource,
  RecommendationEffort,
} from "./optimization-provider";
export type { ResourceProvider, ResourceQuery, NormalizedResource, ResourceType } from "./resource-provider";
export type { FXProvider, FxQuery, FxRate } from "./fx-provider";
export type { AIProvider, AIExplainInput, AIExplanation } from "./ai-provider";
