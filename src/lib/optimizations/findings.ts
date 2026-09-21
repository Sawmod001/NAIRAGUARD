import { prisma } from "@/lib/prisma/client";
import type { NormalizedRecommendation } from "@/infrastructure/providers/optimization-provider";

/**
 * Persisted optimization findings — NG-OPT-03
 * Server-side only. Normalization already happened in the providers
 * (NG-OPT-01/02 map onto NormalizedRecommendation); here evidence is stored
 * cent-exact and re-syncs upsert per (workspace, externalId).
 */

export type OptimizationFindingDTO = {
  id: string;
  externalId: string;
  source: string;
  resourceType: string;
  resourceId: string;
  resourceArn: string | null;
  region: string;
  accountId: string | null;
  actionType: string;
  currentConfiguration: string | null;
  recommendedConfiguration: string | null;
  estimatedMonthlyCostCents: number;
  estimatedMonthlySavingsCents: number;
  savingsPercentage: number | null;
  effort: string;
  restartRequired: boolean;
  rollbackPossible: boolean;
  status: string;
  observedAt: string;
};

function toDTO(f: {
  id: string;
  externalId: string;
  source: string;
  resourceType: string;
  resourceId: string;
  resourceArn: string | null;
  region: string;
  accountId: string | null;
  actionType: string;
  currentConfiguration: string | null;
  recommendedConfiguration: string | null;
  estimatedMonthlyCostCents: number;
  estimatedMonthlySavingsCents: number;
  savingsPercentage: number | null;
  effort: string;
  restartRequired: boolean;
  rollbackPossible: boolean;
  status: string;
  observedAt: Date;
}): OptimizationFindingDTO {
  return {
    id: f.id,
    externalId: f.externalId,
    source: f.source,
    resourceType: f.resourceType,
    resourceId: f.resourceId,
    resourceArn: f.resourceArn,
    region: f.region,
    accountId: f.accountId,
    actionType: f.actionType,
    currentConfiguration: f.currentConfiguration,
    recommendedConfiguration: f.recommendedConfiguration,
    estimatedMonthlyCostCents: f.estimatedMonthlyCostCents,
    estimatedMonthlySavingsCents: f.estimatedMonthlySavingsCents,
    savingsPercentage: f.savingsPercentage,
    effort: f.effort,
    restartRequired: f.restartRequired,
    rollbackPossible: f.rollbackPossible,
    status: f.status,
    observedAt: f.observedAt.toISOString(),
  };
}

const toCents = (usd: number) => Math.round(usd * 100);

export async function saveOptimizationFindings(input: {
  organizationId: string;
  syncRunId?: string | null;
  items: NormalizedRecommendation[];
}): Promise<{ created: number; updated: number }> {
  let created = 0;
  let updated = 0;
  await prisma.$transaction(async (tx) => {
    for (const item of input.items) {
      const data = {
        organizationId: input.organizationId,
        syncRunId: input.syncRunId ?? null,
        source: item.source,
        resourceType: item.resourceType,
        resourceId: item.resourceId,
        resourceArn: item.resourceArn ?? null,
        region: item.region,
        accountId: null as string | null,
        actionType: item.actionType,
        currentConfiguration: item.currentConfiguration,
        recommendedConfiguration: item.recommendedConfiguration,
        estimatedMonthlyCostCents: toCents(item.estimatedMonthlyCostUsd),
        estimatedMonthlySavingsCents: toCents(item.estimatedMonthlySavingsUsd),
        savingsPercentage: item.savingsPercentage ?? null,
        effort: item.effort,
        restartRequired: item.restartRequired,
        rollbackPossible: item.rollbackPossible,
        status: item.status ?? "open",
        observedAt: new Date(item.observedAt),
      };
      const existing = await tx.optimizationFinding.findUnique({
        where: { organizationId_externalId: { organizationId: input.organizationId, externalId: item.externalId } },
        select: { id: true },
      });
      if (existing) {
        await tx.optimizationFinding.update({ where: { id: existing.id }, data });
        updated += 1;
      } else {
        await tx.optimizationFinding.create({ data: { ...data, externalId: item.externalId } });
        created += 1;
      }
    }
  });
  return { created, updated };
}

export async function listOptimizationFindings(input: {
  organizationId: string;
  limit?: number;
}): Promise<OptimizationFindingDTO[]> {
  const rows = await prisma.optimizationFinding.findMany({
    where: { organizationId: input.organizationId },
    orderBy: { estimatedMonthlySavingsCents: "desc" },
    take: Math.min(Math.max(input.limit ?? 50, 1), 200),
  });
  return rows.map(toDTO);
}
