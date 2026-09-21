import {
  CostOptimizationHubClient,
  ListRecommendationsCommand,
  type ListRecommendationsResponse,
  type Recommendation,
} from "@aws-sdk/client-cost-optimization-hub";
import { AppError } from "@/lib/errors/app-error";
import { ErrorCode } from "@/lib/errors/codes";
import { isRetryableSyncError, isThrottledError, withRetry } from "@/domain/sync/retry";
import type {
  NormalizedRecommendation,
  OptimizationProvider,
  OptimizationQuery,
  RecommendationEffort,
} from "@/infrastructure/providers/optimization-provider";
import type { AwsTempCredentials } from "./credentials";

/**
 * Cost Optimization Hub adapter — NG-OPT-01
 * Satisfies the OptimizationProvider contract against live AWS.
 * - Bounded: maxResults 100/page, account+region server filters, 25s per-call timeout.
 * - Hub is read through us-east-1 like Cost Explorer (documented assumption).
 * - Never invents savings: items without an id or positive estimated monthly
 *   savings are skipped, not zero-filled.
 * - Temporary credentials are passed in per instance and never stored beyond it.
 */

const HUB_REGION = "us-east-1";
const CALL_TIMEOUT_MS = 25_000;
const PAGE_SIZE = 100;

function mapEffort(raw: string | undefined): RecommendationEffort {
  if (raw === "Low" || raw === "VeryLow") return "Low";
  if (raw === "High" || raw === "VeryHigh") return "High";
  return "Medium";
}

function resourceIdOf(item: Recommendation): string | null {
  if (item.resourceId && item.resourceId.trim().length > 0) return item.resourceId;
  const arn = item.resourceArn ?? "";
  const tail = arn.split("/").pop() ?? "";
  return tail.length > 0 ? tail : null;
}

/** Pure Hub mapping — unit-tested without network. */
export function mapHubRecommendations(
  items: Recommendation[],
  query: OptimizationQuery,
  observedAt: string
): NormalizedRecommendation[] {
  const out: NormalizedRecommendation[] = [];
  for (const item of items) {
    const savings = item.estimatedMonthlySavings;
    const resourceId = resourceIdOf(item);
    // No id or no positive savings → not a credible opportunity. Skip, never fabricate.
    if (!item.recommendationId || savings === undefined || savings === null || savings <= 0 || !resourceId) {
      continue;
    }
    out.push({
      externalId: item.recommendationId,
      source: "AWS Cost Optimization Hub",
      resourceType: item.currentResourceType ?? "Unknown",
      resourceId,
      resourceArn: item.resourceArn ?? null,
      region: item.region ?? "global",
      actionType: item.actionType ?? "Review",
      currentConfiguration: item.currentResourceSummary ?? item.currentResourceType ?? "Unknown",
      recommendedConfiguration: item.recommendedResourceSummary ?? item.recommendedResourceType ?? "Unknown",
      estimatedMonthlyCostUsd: item.estimatedMonthlyCost ?? 0,
      estimatedMonthlySavingsUsd: savings,
      savingsPercentage: item.estimatedSavingsPercentage ?? null,
      effort: mapEffort(item.implementationEffort),
      restartRequired: item.restartNeeded ?? false,
      rollbackPossible: item.rollbackPossible ?? false,
      status: "open",
      observedAt: item.lastRefreshTimestamp?.toISOString() ?? observedAt,
    });
  }

  if (query.service) {
    const svc = query.service.toLowerCase();
    return out.filter(
      (r) => r.resourceType.toLowerCase().includes(svc) || r.source.toLowerCase().includes(svc)
    );
  }
  return out;
}

function mapHubError(err: unknown): AppError {
  const name = (err as { name?: string })?.name ?? "";
  const message = err instanceof Error ? err.message : "";
  if (/AccessDenied|Unauthorized|Forbidden/i.test(name)) {
    return new AppError({ code: ErrorCode.AWS_ACCESS_DENIED, message: "Cost Optimization Hub denied access. Attach the read permissions from the setup guide.", cause: err });
  }
  if (name === "ValidationException" && /enroll|opt.?in/i.test(message)) {
    return new AppError({ code: ErrorCode.AWS_FEATURE_NOT_ENABLED, message: "Cost Optimization Hub is not enrolled for this account. Enroll in the AWS console first.", cause: err });
  }
  if (isThrottledError(err)) {
    return new AppError({ code: ErrorCode.PROVIDER_THROTTLED, message: "Cost Optimization Hub throttled the request after retries.", cause: err });
  }
  if (isRetryableSyncError(err)) {
    return new AppError({ code: ErrorCode.PROVIDER_UNAVAILABLE, message: "Cost Optimization Hub is temporarily unavailable.", cause: err });
  }
  return new AppError({ code: ErrorCode.PROVIDER_UNAVAILABLE, message: "Cost Optimization Hub returned an unexpected response.", cause: err });
}

export class AwsOptimizationHubProvider implements OptimizationProvider {
  constructor(private readonly credentials: AwsTempCredentials) {}

  private client(): CostOptimizationHubClient {
    return new CostOptimizationHubClient({
      region: HUB_REGION,
      credentials: {
        accessKeyId: this.credentials.accessKeyId,
        secretAccessKey: this.credentials.secretAccessKey,
        sessionToken: this.credentials.sessionToken,
      },
    });
  }

  private async listAll(
    query: OptimizationQuery,
    extraFilter: { recommendationIds?: string[] } = {}
  ): Promise<Recommendation[]> {
    const client = this.client();
    const items: Recommendation[] = [];
    let nextToken: string | undefined;
    try {
      do {
        const outcome = await withRetry(() =>
          client.send(
            new ListRecommendationsCommand({
              filter: {
                ...(query.accountId ? { accountIds: [query.accountId] } : {}),
                ...(query.region ? { regions: [query.region] } : {}),
                ...extraFilter,
              },
              includeAllRecommendations: true,
              maxResults: PAGE_SIZE,
              nextToken,
            }),
            { abortSignal: AbortSignal.timeout(CALL_TIMEOUT_MS) }
          )
        );
        if (!outcome.ok) throw outcome.error;
        const page: ListRecommendationsResponse = outcome.value;
        items.push(...(page.items ?? []));
        nextToken = page.nextToken ?? undefined;
      } while (nextToken);
      return items;
    } catch (e) {
      if (e instanceof AppError) throw e;
      throw mapHubError(e);
    } finally {
      client.destroy();
    }
  }

  async getRecommendations(query: OptimizationQuery): Promise<NormalizedRecommendation[]> {
    const items = await this.listAll(query);
    return mapHubRecommendations(items, query, new Date().toISOString());
  }

  async getRecommendationById(id: string, query: OptimizationQuery): Promise<NormalizedRecommendation | null> {
    const items = await this.listAll(query, { recommendationIds: [id] });
    const mapped = mapHubRecommendations(items, { ...query, service: null }, new Date().toISOString());
    return mapped.find((r) => r.externalId === id) ?? null;
  }
}
