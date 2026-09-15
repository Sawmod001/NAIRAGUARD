import { AppError } from "@/lib/errors/app-error";
import { ErrorCode } from "@/lib/errors/codes";
import type { ResourceProvider, ResourceQuery, NormalizedResource } from "../resource-provider";
import { getDemoDataset } from "./registry";

/**
 * DemoResourceProvider — NG-206
 * Returns normalized resource info, supports recommendation detail pages, implements ResourceProvider.
 * Synthetic ARN + attributes + utilization derived from demo recommendations — no AWS SDK leak.
 */

export class DemoResourceProvider implements ResourceProvider {
  constructor(private readonly scenarioId: string = "balanced-startup") {}

  async getResource(query: ResourceQuery): Promise<NormalizedResource | null> {
    const scenarioId = (query as unknown as { scenarioId?: string }).scenarioId || this.scenarioId;
    let dataset;
    try {
      dataset = getDemoDataset(scenarioId);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.startsWith("EDGE_SCENARIO:")) {
        throw new AppError({ code: ErrorCode.PROVIDER_UNAVAILABLE, message: `Demo edge: ${msg}`, cause: e });
      }
      throw e;
    }

    const rec = dataset.recommendations.find((r) => r.resourceId === query.resourceId);
    if (!rec) return null;

    const accountId = dataset.scenario.accountId;
    const arn = `arn:aws:${resourceArnService(rec.resourceType)}:${rec.region}:${accountId}:${rec.resourceType}/${rec.resourceId}`;

    return {
      resourceId: rec.resourceId,
      resourceArn: arn,
      resourceType: rec.resourceType,
      region: rec.region,
      accountId,
      configuration: rec.currentConfiguration,
      attributes: {
        source: rec.source,
        actionType: rec.actionType,
        recommendedConfiguration: rec.recommendedConfiguration,
        estimatedMonthlyCostUsd: rec.estimatedMonthlyCostUsd,
        estimatedMonthlySavingsUsd: rec.estimatedMonthlySavingsUsd,
      },
      utilization: syntheticUtilization(rec.resourceType),
      observedAt: dataset.fx.observedAt,
    };
  }

  async listResources(query: { organizationId: string; resourceType?: string }): Promise<NormalizedResource[]> {
    const scenarioId = (query as unknown as { scenarioId?: string }).scenarioId || this.scenarioId;
    const dataset = getDemoDataset(scenarioId);
    let recs = dataset.recommendations;
    if (query.resourceType) recs = recs.filter((r) => r.resourceType === query.resourceType);
    const accountId = dataset.scenario.accountId;
    return recs.map((rec) => ({
      resourceId: rec.resourceId,
      resourceArn: `arn:aws:${resourceArnService(rec.resourceType)}:${rec.region}:${accountId}:${rec.resourceType}/${rec.resourceId}`,
      resourceType: rec.resourceType,
      region: rec.region,
      accountId,
      configuration: rec.currentConfiguration,
      attributes: {
        source: rec.source,
        actionType: rec.actionType,
        recommendedConfiguration: rec.recommendedConfiguration,
      },
      utilization: syntheticUtilization(rec.resourceType),
      observedAt: dataset.fx.observedAt,
    }));
  }
}

function resourceArnService(resourceType: string): string {
  if (resourceType === "Ec2Instance") return "ec2";
  if (resourceType === "EbsVolume") return "ec2";
  if (resourceType.toLowerCase().includes("rds")) return "rds";
  return "resource";
}

function syntheticUtilization(resourceType: string): NormalizedResource["utilization"] {
  if (resourceType === "Ec2Instance") return { cpuAverage: 12.4, memoryAverage: 18.0, lookbackDays: 14 };
  if (resourceType === "EbsVolume") return { iopsAverage: 45, lookbackDays: 14 };
  return { lookbackDays: 14 };
}
