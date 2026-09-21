import { prisma } from "@/lib/prisma/client";
import type { DomainCost } from "@/domain/costs/types";

/**
 * Persisted cost snapshots — NG-COST-03
 * Server-side only. Writes normalized DomainCost (NG-COST-02, cents-based)
 * plus service/region breakdowns in one transaction.
 * - Idempotent per sync run: a snapshot already stored for the run is returned.
 * - Readers take the latest snapshot by observedAt — dashboard never live-fetches.
 */

export type CostSnapshotDTO = {
  id: string;
  organizationId: string;
  syncRunId: string | null;
  accountId: string | null;
  periodStart: string;
  periodEnd: string;
  totalCents: number;
  currency: string;
  source: string;
  observedAt: string;
  services: { service: string; amountCents: number; percentage: number }[];
  regions: { region: string; amountCents: number; percentage: number }[];
};

export async function saveCostSnapshot(input: {
  organizationId: string;
  syncRunId?: string | null;
  periodStart: string;
  periodEnd: string;
  cost: DomainCost;
}): Promise<{ id: string; deduped: boolean }> {
  if (input.syncRunId) {
    const existing = await prisma.costSnapshot.findFirst({
      where: { organizationId: input.organizationId, syncRunId: input.syncRunId },
      select: { id: true },
    });
    if (existing) return { id: existing.id, deduped: true };
  }

  const created = await prisma.$transaction(async (tx) => {
    const snapshot = await tx.costSnapshot.create({
      data: {
        organizationId: input.organizationId,
        syncRunId: input.syncRunId ?? null,
        accountId: input.cost.accountId,
        periodStart: new Date(input.periodStart),
        periodEnd: new Date(input.periodEnd),
        totalCents: input.cost.totalCents,
        currency: input.cost.currency,
        source: input.cost.source,
        observedAt: new Date(input.cost.observedAt),
      },
      select: { id: true },
    });
    const rows = [
      ...input.cost.services.map((s) => ({
        snapshotId: snapshot.id,
        kind: "service",
        key: s.service,
        amountCents: s.amountCents,
        percentage: s.percentage,
      })),
      ...input.cost.regions.map((r) => ({
        snapshotId: snapshot.id,
        kind: "region",
        key: r.region,
        amountCents: r.amountCents,
        percentage: r.percentage,
      })),
    ];
    if (rows.length > 0) {
      await tx.costBreakdown.createMany({ data: rows });
    }
    return snapshot;
  });
  return { id: created.id, deduped: false };
}

export async function getLatestCostSnapshot(organizationId: string): Promise<CostSnapshotDTO | null> {
  const snapshot = await prisma.costSnapshot.findFirst({
    where: { organizationId },
    orderBy: { observedAt: "desc" },
    include: { breakdowns: true },
  });
  if (!snapshot) return null;
  return {
    id: snapshot.id,
    organizationId: snapshot.organizationId,
    syncRunId: snapshot.syncRunId,
    accountId: snapshot.accountId,
    periodStart: snapshot.periodStart.toISOString(),
    periodEnd: snapshot.periodEnd.toISOString(),
    totalCents: snapshot.totalCents,
    currency: snapshot.currency,
    source: snapshot.source,
    observedAt: snapshot.observedAt.toISOString(),
    services: snapshot.breakdowns
      .filter((b) => b.kind === "service")
      .map((b) => ({ service: b.key, amountCents: b.amountCents, percentage: b.percentage })),
    regions: snapshot.breakdowns
      .filter((b) => b.kind === "region")
      .map((b) => ({ region: b.key, amountCents: b.amountCents, percentage: b.percentage })),
  };
}
