import {
  ComputeOptimizerClient,
  GetEBSVolumeRecommendationsCommand,
  GetEC2InstanceRecommendationsCommand,
  GetLambdaFunctionRecommendationsCommand,
  GetRDSDatabaseRecommendationsCommand,
  type GetEBSVolumeRecommendationsResponse,
  type GetEC2InstanceRecommendationsResponse,
  type GetLambdaFunctionRecommendationsResponse,
  type GetRDSDatabaseRecommendationsResponse,
  type InstanceRecommendation,
  type LambdaFunctionRecommendation,
  type RDSDBRecommendation,
  type VolumeRecommendation,
} from "@aws-sdk/client-compute-optimizer";
import { AppError } from "@/lib/errors/app-error";
import { withRetry } from "@/domain/sync/retry";
import type {
  NormalizedRecommendation,
  OptimizationProvider,
  OptimizationQuery,
} from "@/infrastructure/providers/optimization-provider";
import type { AwsTempCredentials } from "./credentials";
import { mapRecommendationError, REC_CALL_TIMEOUT_MS } from "./recommendation-errors";

/**
 * Compute Optimizer adapter — NG-OPT-02
 * Satisfies the OptimizationProvider contract across EC2, EBS, Lambda, and RDS.
 * - Bounded: per type × region calls (default eu-west-1 + us-east-1), 100/page,
 *   account filter when known, 25s per-call timeout with backoff+jitter.
 * - Compute Optimizer reports savings but not current cost or effort, so:
 *   current cost is 0 (cost attribution comes from Cost Explorer snapshots),
 *   effort is Low (single-resource config change), and restart/rollback are
 *   documented per-type heuristics — never presented as measured evidence.
 * - Items without an ARN tail or positive savings are skipped, never invented.
 */

const DEFAULT_REGIONS = ["eu-west-1", "us-east-1"];
const PAGE_SIZE = 100;

type SavingsCarrier = {
  savingsOpportunity?: {
    estimatedMonthlySavings?: { value?: number | undefined } | undefined;
    savingsOpportunityPercentage?: number | undefined;
  } | undefined;
};

function optionSavings(opt: SavingsCarrier | undefined): number | null {
  const v = opt?.savingsOpportunity?.estimatedMonthlySavings?.value;
  return typeof v === "number" && Number.isFinite(v) && v > 0 ? Math.round(v * 100) / 100 : null;
}

function optionSavingsPercentage(opt: SavingsCarrier | undefined): number | null {
  const p = opt?.savingsOpportunity?.savingsOpportunityPercentage;
  return typeof p === "number" && Number.isFinite(p) && p >= 0 ? Math.round(p * 10) / 10 : null;
}

function arnTail(arn: string | undefined): string | null {
  // EC2/EBS/Lambda ARNs end in /<id>; RDS ARNs end in :<name>.
  const afterSlash = (arn ?? "").split("/").pop() ?? "";
  const tail = afterSlash.includes(":") ? (afterSlash.split(":").pop() ?? "") : afterSlash;
  return tail.length > 0 ? tail : null;
}

function arnRegion(arn: string | undefined): string | null {
  const region = (arn ?? "").split(":")[3] ?? "";
  return region.length > 0 ? region : null;
}

function normFinding(finding: string | undefined): string {
  return (finding ?? "").toUpperCase().replace(/_/g, "");
}

function shortId(prefix: string, arn: string | undefined): string | null {
  const tail = arnTail(arn);
  if (!tail) return null;
  return `co-${prefix}-${tail.replace(/[^A-Za-z0-9-]/g, "-")}`;
}

function observedIso(ts: Date | undefined, fallback: string): string {
  return ts instanceof Date && !Number.isNaN(ts.getTime()) ? ts.toISOString() : fallback;
}

export type ComputeOptimizerItems = {
  ec2: InstanceRecommendation[];
  ebs: VolumeRecommendation[];
  lambda: LambdaFunctionRecommendation[];
  rds: RDSDBRecommendation[];
};

/** Pure Compute Optimizer mapping — unit-tested without network. */
export function mapComputeOptimizerRecommendations(
  items: ComputeOptimizerItems,
  query: OptimizationQuery,
  observedAt: string
): NormalizedRecommendation[] {
  const out: NormalizedRecommendation[] = [];
  const regionOf = (arn: string | undefined) => arnRegion(arn) ?? query.region ?? "global";

  for (const rec of items.ec2) {
    const savings = optionSavings(rec.recommendationOptions?.[0]);
    const resourceId = arnTail(rec.instanceArn);
    if (!savings || !resourceId) continue;
    const current = rec.currentInstanceType ?? "Unknown";
    const recommended = rec.recommendationOptions?.[0]?.instanceType ?? "Unknown";
    out.push({
      externalId: shortId("ec2", rec.instanceArn) ?? `co-ec2-${resourceId}`,
      source: "AWS Compute Optimizer",
      resourceType: "Ec2Instance",
      resourceId,
      resourceArn: rec.instanceArn ?? null,
      region: regionOf(rec.instanceArn),
      actionType: "Rightsize",
      currentConfiguration: current,
      recommendedConfiguration: recommended,
      estimatedMonthlyCostUsd: 0,
      estimatedMonthlySavingsUsd: savings,
      savingsPercentage: optionSavingsPercentage(rec.recommendationOptions?.[0]),
      effort: "Low",
      restartRequired: true,
      rollbackPossible: true,
      status: "open",
      observedAt: observedIso(rec.lastRefreshTimestamp, observedAt),
    });
  }

  for (const rec of items.ebs) {
    const opt = rec.volumeRecommendationOptions?.[0];
    const savings = optionSavings(opt);
    const resourceId = arnTail(rec.volumeArn);
    if (!savings || !resourceId) continue;
    const cur = rec.currentConfiguration;
    const current = cur ? `${cur.volumeType ?? "unknown"} ${cur.volumeSize ?? "?"} GiB` : "Unknown";
    const cfg = opt?.configuration;
    const recommended = cfg ? `${cfg.volumeType ?? "unknown"} ${cfg.volumeSize ?? "?"} GiB` : "Unknown";
    out.push({
      externalId: shortId("ebs", rec.volumeArn) ?? `co-ebs-${resourceId}`,
      source: "AWS Compute Optimizer",
      resourceType: "EbsVolume",
      resourceId,
      resourceArn: rec.volumeArn ?? null,
      region: regionOf(rec.volumeArn),
      actionType: "Optimize storage",
      currentConfiguration: current,
      recommendedConfiguration: recommended,
      estimatedMonthlyCostUsd: 0,
      estimatedMonthlySavingsUsd: savings,
      savingsPercentage: optionSavingsPercentage(opt),
      effort: "Low",
      restartRequired: false,
      rollbackPossible: true,
      status: "open",
      observedAt: observedIso(rec.lastRefreshTimestamp, observedAt),
    });
  }

  for (const rec of items.lambda) {
    const opt = rec.memorySizeRecommendationOptions?.[0];
    const savings = optionSavings(opt);
    const resourceId = arnTail(rec.functionArn);
    if (!savings || !resourceId) continue;
    out.push({
      externalId: shortId("lambda", rec.functionArn) ?? `co-lambda-${resourceId}`,
      source: "AWS Compute Optimizer",
      resourceType: "LambdaFunction",
      resourceId,
      resourceArn: rec.functionArn ?? null,
      region: regionOf(rec.functionArn),
      actionType: "Optimize memory",
      currentConfiguration: rec.currentMemorySize !== undefined ? `${rec.currentMemorySize} MB` : "Unknown",
      recommendedConfiguration: opt?.memorySize !== undefined ? `${opt.memorySize} MB` : "Unknown",
      estimatedMonthlyCostUsd: 0,
      estimatedMonthlySavingsUsd: savings,
      savingsPercentage: optionSavingsPercentage(opt),
      effort: "Low",
      restartRequired: false,
      rollbackPossible: true,
      status: "open",
      observedAt: observedIso(rec.lastRefreshTimestamp, observedAt),
    });
  }

  for (const rec of items.rds) {
    // Instance rightsizing only; storage-level findings ride a later ticket.
    const opt = rec.instanceRecommendationOptions?.[0];
    const savings = optionSavings(opt);
    const resourceId = arnTail(rec.resourceArn);
    if (!savings || !resourceId) continue;
    out.push({
      externalId: shortId("rds", rec.resourceArn) ?? `co-rds-${resourceId}`,
      source: "AWS Compute Optimizer",
      resourceType: "RdsInstance",
      resourceId,
      resourceArn: rec.resourceArn ?? null,
      region: regionOf(rec.resourceArn),
      actionType: "Rightsize",
      currentConfiguration: rec.engine ? `${rec.engine} ${rec.engineVersion ?? ""}`.trim() : "Unknown",
      recommendedConfiguration: opt?.dbInstanceClass ?? "Unknown",
      estimatedMonthlyCostUsd: 0,
      estimatedMonthlySavingsUsd: savings,
      savingsPercentage: optionSavingsPercentage(opt),
      effort: "Low",
      restartRequired: true,
      rollbackPossible: true,
      status: "open",
      observedAt: observedIso(rec.lastRefreshTimestamp, observedAt),
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

export class AwsComputeOptimizerProvider implements OptimizationProvider {
  constructor(
    private readonly credentials: AwsTempCredentials,
    private readonly regions: string[] = DEFAULT_REGIONS
  ) {}

  private client(region: string): ComputeOptimizerClient {
    return new ComputeOptimizerClient({
      region,
      credentials: {
        accessKeyId: this.credentials.accessKeyId,
        secretAccessKey: this.credentials.secretAccessKey,
        sessionToken: this.credentials.sessionToken,
      },
    });
  }

  private async send<T>(client: ComputeOptimizerClient, command: object): Promise<T> {
    const outcome = await withRetry(() =>
      client.send(command as never, { abortSignal: AbortSignal.timeout(REC_CALL_TIMEOUT_MS) })
    );
    if (!outcome.ok) throw outcome.error;
    return outcome.value as T;
  }

  private regionsFor(query: OptimizationQuery): string[] {
    if (query.region) return [query.region];
    return this.regions.length > 0 ? this.regions : DEFAULT_REGIONS;
  }

  async getRecommendations(query: OptimizationQuery): Promise<NormalizedRecommendation[]> {
    const items: ComputeOptimizerItems = { ec2: [], ebs: [], lambda: [], rds: [] };
    for (const region of this.regionsFor(query)) {
      const client = this.client(region);
      try {
        const accountFilter = query.accountId ? { accountIds: [query.accountId] } : {};

        let token: string | undefined;
        do {
          const page: GetEC2InstanceRecommendationsResponse = await this.send<GetEC2InstanceRecommendationsResponse>(
            client,
            new GetEC2InstanceRecommendationsCommand({ maxResults: PAGE_SIZE, ...accountFilter, nextToken: token })
          );
          items.ec2.push(...(page.instanceRecommendations ?? []));
          token = page.nextToken ?? undefined;
        } while (token);

        token = undefined;
        do {
          const page: GetEBSVolumeRecommendationsResponse = await this.send<GetEBSVolumeRecommendationsResponse>(
            client,
            new GetEBSVolumeRecommendationsCommand({ maxResults: PAGE_SIZE, ...accountFilter, nextToken: token })
          );
          items.ebs.push(...(page.volumeRecommendations ?? []));
          token = page.nextToken ?? undefined;
        } while (token);

        token = undefined;
        do {
          const page: GetLambdaFunctionRecommendationsResponse = await this.send<GetLambdaFunctionRecommendationsResponse>(
            client,
            new GetLambdaFunctionRecommendationsCommand({ maxResults: PAGE_SIZE, ...accountFilter, nextToken: token })
          );
          items.lambda.push(...(page.lambdaFunctionRecommendations ?? []));
          token = page.nextToken ?? undefined;
        } while (token);

        token = undefined;
        do {
          const page: GetRDSDatabaseRecommendationsResponse = await this.send<GetRDSDatabaseRecommendationsResponse>(
            client,
            new GetRDSDatabaseRecommendationsCommand({ maxResults: PAGE_SIZE, ...accountFilter, nextToken: token })
          );
          items.rds.push(...(page.rdsDBRecommendations ?? []));
          token = page.nextToken ?? undefined;
        } while (token);
      } catch (e) {
        if (e instanceof AppError) throw e;
        throw mapRecommendationError(e, "Compute Optimizer");
      } finally {
        client.destroy();
      }
    }
    return mapComputeOptimizerRecommendations(items, query, new Date().toISOString());
  }

  async getRecommendationById(id: string, query: OptimizationQuery): Promise<NormalizedRecommendation | null> {
    const all = await this.getRecommendations(query);
    return all.find((r) => r.externalId === id) ?? null;
  }
}
