import {
  CostExplorerClient,
  GetCostAndUsageCommand,
  type GetCostAndUsageResponse,
  type Group,
  type ResultByTime,
} from "@aws-sdk/client-cost-explorer";
import { AppError } from "@/lib/errors/app-error";
import { ErrorCode } from "@/lib/errors/codes";
import { isRetryableSyncError, isThrottledError, withRetry } from "@/domain/sync/retry";
import type { CostProvider, CostQuery, CostResult } from "@/infrastructure/providers/cost-provider";

/**
 * Cost Explorer adapter — NG-COST-01
 * Satisfies the CostProvider contract against live AWS. Domain never sees SDK types.
 * - Bounded: fixed window (1–90d), DAILY granularity, UnblendedCost, one
 *   SERVICE×REGION grouped call per page, 25s per-call timeout.
 * - Cost Explorer is a us-east-1-only API — region is fixed, not configurable.
 * - Throttling retries with backoff+jitter inside; persistent failure throws
 *   AppError so the runner records FAILED without touching good data.
 * - Temporary credentials are passed in per call set and never stored here.
 */

const CE_REGION = "us-east-1";
const CALL_TIMEOUT_MS = 25_000;
const MAX_PERIOD_DAYS = 90;

export type CeCredentials = {
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken: string;
};

function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function parseAmount(raw: string | undefined, context: string): number {
  // Absent amounts mean zero spend for that slice; present-but-garbage is corruption.
  if (raw === undefined) return 0;
  const value = Number(raw);
  if (!Number.isFinite(value) || value < 0) {
    throw new AppError({
      code: ErrorCode.PROVIDER_MALFORMED_RESPONSE,
      message: `Cost Explorer returned an unusable amount (${context}).`,
    });
  }
  return Math.round(value * 100) / 100;
}

function groupAmount(g: Group, context: string): number {
  return parseAmount(g.Metrics?.UnblendedCost?.Amount, context);
}

/** Pure response mapping — unit-tested without network. */
export function mapCostExplorerResponse(
  pages: GetCostAndUsageResponse[],
  query: CostQuery,
  periodDays: number,
  observedAt: string
): CostResult {
  const periods: ResultByTime[] = pages.flatMap((p) => p.ResultsByTime ?? []);
  const daily = periods.map((r) => {
    const groups = r.Groups ?? [];
    // Grouped days sum their slices; ungrouped (zero-spend) days fall back to Total.
    const amountUsd =
      groups.length > 0
        ? groups.reduce((s, g) => s + groupAmount(g, `day ${r.TimePeriod?.Start}`), 0)
        : parseAmount(r.Total?.UnblendedCost?.Amount, `total ${r.TimePeriod?.Start}`);
    return { date: r.TimePeriod?.Start ?? observedAt.slice(0, 10), amountUsd: Math.round(amountUsd * 100) / 100 };
  });

  const serviceSums = new Map<string, number>();
  const regionSums = new Map<string, number>();
  for (const r of periods) {
    for (const g of r.Groups ?? []) {
      const amount = groupAmount(g, `group ${(g.Keys ?? []).join("/")}`);
      const [service = "Unknown", region = "Unknown"] = g.Keys ?? [];
      serviceSums.set(service, (serviceSums.get(service) ?? 0) + amount);
      regionSums.set(region, (regionSums.get(region) ?? 0) + amount);
    }
  }

  const totalUsd = Math.round(daily.reduce((s, d) => s + d.amountUsd, 0) * 100) / 100;
  const share = (amount: number) => (totalUsd > 0 ? Math.round((amount / totalUsd) * 1000) / 10 : 0);
  const serviceBreakdown = [...serviceSums.entries()]
    .map(([service, amount]) => ({ service, amountUsd: Math.round(amount * 100) / 100, percentage: share(amount) }))
    .sort((a, b) => b.amountUsd - a.amountUsd);
  const regionBreakdown = [...regionSums.entries()]
    .map(([region, amount]) => ({ region, amountUsd: Math.round(amount * 100) / 100, percentage: share(amount) }))
    .sort((a, b) => b.amountUsd - a.amountUsd);

  return {
    organizationId: query.organizationId,
    accountId: query.accountId ?? null,
    currency: "USD",
    periodDays,
    totalUsd,
    daily: daily.sort((a, b) => (a.date < b.date ? -1 : 1)),
    serviceBreakdown,
    regionBreakdown,
    source: "AWSCostExplorer",
    observedAt,
  };
}

function mapCeError(err: unknown): AppError {
  const name = (err as { name?: string })?.name ?? "";
  if (/AccessDenied|Unauthorized|Forbidden/i.test(name)) {
    return new AppError({ code: ErrorCode.AWS_ACCESS_DENIED, message: "Cost Explorer denied access. Attach the read permissions from the setup guide.", cause: err });
  }
  if (isThrottledError(err)) {
    return new AppError({ code: ErrorCode.PROVIDER_THROTTLED, message: "Cost Explorer throttled the request after retries.", cause: err });
  }
  if (isRetryableSyncError(err)) {
    return new AppError({ code: ErrorCode.PROVIDER_UNAVAILABLE, message: "Cost Explorer is temporarily unavailable.", cause: err });
  }
  return new AppError({ code: ErrorCode.PROVIDER_MALFORMED_RESPONSE, message: "Cost Explorer returned an unexpected response.", cause: err });
}

export class AwsCostExplorerProvider implements CostProvider {
  constructor(private readonly credentials: CeCredentials) {}

  async getCosts(query: CostQuery): Promise<CostResult> {
    const periodDays = Math.min(Math.max(query.periodDays ?? 30, 1), MAX_PERIOD_DAYS);
    const end = query.to ? new Date(query.to) : new Date();
    const start = query.from ? new Date(query.from) : new Date(end.getTime() - periodDays * 86_400_000);

    const client = new CostExplorerClient({
      region: CE_REGION,
      credentials: {
        accessKeyId: this.credentials.accessKeyId,
        secretAccessKey: this.credentials.secretAccessKey,
        sessionToken: this.credentials.sessionToken,
      },
    });

    const pages: GetCostAndUsageResponse[] = [];
    let nextToken: string | undefined;
    try {
      do {
        const outcome = await withRetry(() =>
          client.send(
            new GetCostAndUsageCommand({
              TimePeriod: { Start: toISODate(start), End: toISODate(end) },
              Granularity: "DAILY",
              Metrics: ["UnblendedCost"],
              GroupBy: [
                { Type: "DIMENSION", Key: "SERVICE" },
                { Type: "DIMENSION", Key: "REGION" },
              ],
              NextPageToken: nextToken,
            }),
            { abortSignal: AbortSignal.timeout(CALL_TIMEOUT_MS) }
          )
        );
        if (!outcome.ok) throw outcome.error;
        pages.push(outcome.value);
        nextToken = outcome.value.NextPageToken ?? undefined;
      } while (nextToken);
    } catch (e) {
      if (e instanceof AppError) throw e;
      throw mapCeError(e);
    } finally {
      client.destroy();
    }

    return mapCostExplorerResponse(pages, query, periodDays, new Date().toISOString());
  }
}
