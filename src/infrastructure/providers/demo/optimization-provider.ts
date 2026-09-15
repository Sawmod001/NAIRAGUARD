import { AppError } from "@/lib/errors/app-error";
import { ErrorCode } from "@/lib/errors/codes";
import type { OptimizationProvider, OptimizationQuery, NormalizedRecommendation } from "../optimization-provider";
import { getDemoDataset } from "./registry";

/**
 * DemoOptimizationProvider — NG-205
 * Returns normalized recommendations, supports scenarios, implements OptimizationProvider.
 * Evidence fields: source, resourceType, actionType, current/recommended config, cost/savings, effort, restart/rollback, region, observedAt.
 */

export class DemoOptimizationProvider implements OptimizationProvider {
  constructor(private readonly scenarioId: string = "balanced-startup") {}

  async getRecommendations(query: OptimizationQuery): Promise<NormalizedRecommendation[]> {
    const scenarioId = (query as unknown as { scenarioId?: string }).scenarioId || this.scenarioId;
    let dataset;
    try {
      dataset = getDemoDataset(scenarioId);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.startsWith("EDGE_SCENARIO:")) {
        const edge = msg.split(":")[1];
        if (edge === "no-recommendations") {
          return [];
        }
        if (edge === "provider-throttled" || edge === "aws-access-denied") {
          throw new AppError({ code: ErrorCode.PROVIDER_THROTTLED, message: `Demo edge: ${edge}`, cause: e });
        }
        throw new AppError({ code: ErrorCode.PROVIDER_UNAVAILABLE, message: `Demo edge: ${edge}`, cause: e });
      }
      throw e;
    }

    const base = dataset.recommendations.map((r) => ({
      externalId: r.externalId,
      source: r.source,
      resourceType: r.resourceType,
      resourceId: r.resourceId,
      resourceArn: null as string | null,
      region: r.region,
      actionType: r.actionType,
      currentConfiguration: r.currentConfiguration,
      recommendedConfiguration: r.recommendedConfiguration,
      estimatedMonthlyCostUsd: r.estimatedMonthlyCostUsd,
      estimatedMonthlySavingsUsd: r.estimatedMonthlySavingsUsd,
      savingsPercentage: r.savingsPercentage ?? null,
      effort: r.effort,
      restartRequired: r.restartRequired,
      rollbackPossible: r.rollbackPossible,
      status: "open",
      observedAt: dataset.fx.observedAt,
    })) as NormalizedRecommendation[];

    // Optional filters (provider-independent)
    let filtered = base;
    if (query.region) filtered = filtered.filter((r) => r.region === query.region);
    if (query.service) {
      const svc = query.service.toLowerCase();
      filtered = filtered.filter((r) => r.resourceType.toLowerCase().includes(svc) || r.source.toLowerCase().includes(svc));
    }
    return filtered;
  }

  async getRecommendationById(id: string, query: OptimizationQuery): Promise<NormalizedRecommendation | null> {
    const all = await this.getRecommendations(query);
    return all.find((r) => r.externalId === id) ?? null;
  }
}
