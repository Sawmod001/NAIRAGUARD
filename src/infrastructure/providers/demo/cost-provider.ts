import { AppError } from "@/lib/errors/app-error";
import { ErrorCode } from "@/lib/errors/codes";
import type { CostProvider, CostQuery, CostResult } from "../cost-provider";
import { getDemoDataset } from "./registry";

/**
 * DemoCostProvider — NG-204
 * Returns normalized CostResult via CostProvider, supports scenario selection.
 * Scenario is constructor-injected (provider-independent via CostQuery; AWS ignores scenario).
 * Domain never sees scenario file details — only normalized result.
 */

export class DemoCostProvider implements CostProvider {
  constructor(private readonly scenarioId: string = "balanced-startup") {}

  async getCosts(query: CostQuery): Promise<CostResult> {
    // Allow per-query override via (query as any).scenarioId for flexibility
    const scenarioId = (query as unknown as { scenarioId?: string }).scenarioId || this.scenarioId;

    let dataset;
    try {
      dataset = getDemoDataset(scenarioId);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.startsWith("EDGE_SCENARIO:")) {
        const edge = msg.split(":")[1];
        if (edge === "provider-throttled" || edge === "aws-access-denied") {
          throw new AppError({ code: ErrorCode.PROVIDER_THROTTLED, message: `Demo edge: ${edge}`, cause: e });
        }
        if (edge === "provider-unavailable" || edge === "db-failure") {
          throw new AppError({ code: ErrorCode.PROVIDER_UNAVAILABLE, message: `Demo edge: ${edge}`, cause: e });
        }
        if (edge === "malformed-provider-response") {
          throw new AppError({ code: ErrorCode.PROVIDER_MALFORMED_RESPONSE, message: `Demo edge: ${edge}`, cause: e });
        }
        if (edge === "stale-data") {
          // Return stale-tagged data — caller can check observedAt
          dataset = getDemoDataset("balanced-startup");
          // Mark stale via observedAt old
          const stale = { ...dataset, fx: { ...dataset.fx, observedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString() } };
          return this.toResult(stale, query, true);
        }
        throw new AppError({ code: ErrorCode.PROVIDER_UNAVAILABLE, message: `Demo edge: ${edge}`, cause: e });
      }
      throw e;
    }

    return this.toResult(dataset, query, false);
  }

  private toResult(dataset: Awaited<ReturnType<typeof getDemoDataset>>, query: CostQuery, isStale: boolean): CostResult {
    const periodDays = query.periodDays ?? dataset.cost.periodDays;
    const daily = dataset.cost.daily.slice(-periodDays).map((d) => {
      const date = new Date();
      date.setUTCDate(date.getUTCDate() + d.dateOffset);
      return { date: date.toISOString().slice(0, 10), amountUsd: d.amountUsd };
    });

    const totalUsd = daily.reduce((s, d) => s + d.amountUsd, 0);

    // Region breakdown synthetic if not in dataset — keep provider-normalized, not UI fake
    const regionBreakdown = [
      { region: "eu-west-1", amountUsd: Math.round(totalUsd * 0.52 * 100) / 100, percentage: 52 },
      { region: "us-east-1", amountUsd: Math.round(totalUsd * 0.3 * 100) / 100, percentage: 30 },
      { region: "ap-southeast-1", amountUsd: Math.round(totalUsd * 0.18 * 100) / 100, percentage: 18 },
    ];

    return {
      organizationId: query.organizationId,
      accountId: dataset.scenario.accountId,
      currency: "USD",
      periodDays,
      totalUsd: Math.round(totalUsd * 100) / 100,
      daily,
      serviceBreakdown: dataset.cost.serviceBreakdown.map((s) => ({ service: s.service, amountUsd: s.amountUsd, percentage: s.percentage })),
      regionBreakdown,
      source: "DemoCostProvider",
      observedAt: isStale ? new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString() : dataset.fx.observedAt,
    };
  }
}
