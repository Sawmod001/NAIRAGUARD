import { prisma } from "@/lib/prisma/client";
import type { DomainCost } from "@/domain/costs/types";

const dollars = (cents: number) => Math.round(cents) / 100;

/**
 * Snapshot → DomainCost view for a display window — NG-DASH-08.
 * Totals follow the visible window (same semantics as the provider path).
 * Null when the snapshot carries no daily series; callers fall back.
 */
export function snapshotToCostView(
  snapshot: CostSnapshotDTO,
  input: { organizationId: string; period: number }
): DomainCost | null {
  if (snapshot.daily.length === 0) return null;
  const window = snapshot.daily.slice(-Math.max(input.period, 1));
  const windowCents = window.reduce((s, d) => s + d.amountCents, 0);
  return {
    organizationId: input.organizationId,
    accountId: snapshot.accountId,
    currency: "USD",
    periodDays: input.period,
    total: dollars(windowCents),
    totalCents: windowCents,
    daily: window.map((d) => ({ date: d.date, amount: dollars(d.amountCents), amountCents: d.amountCents, currency: "USD" as const })),
    services: snapshot.services.map((s) => ({ service: s.service, amount: dollars(s.amountCents), amountCents: s.amountCents, currency: "USD" as const, percentage: s.percentage })),
    regions: snapshot.regions.map((r) => ({ region: r.region, amount: dollars(r.amountCents), amountCents: r.amountCents, currency: "USD" as const, percentage: r.percentage })),
    observedAt: snapshot.observedAt,
    source: snapshot.source,
  };
}

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
  periodDays: number;
  totalCents: number;
  currency: string;
  source: string;
  observedAt: string;
  daily: { date: string; amountCents: number }[];
  services: { service: string; amountCents: number; percentage: number }[];
  regions: { region: string; amountCents: number; percentage: number }[];
};

function toDailyJson(daily: { date: string; amountCents: number }[]): { date: string; amountCents: number }[] {
  return daily.slice(-90).map((d) => ({ date: d.date, amountCents: d.amountCents }));
}

function fromDailyJson(raw: unknown): { date: string; amountCents: number }[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(
      (d): d is { date: string; amountCents: number } =>
        typeof d === "object" &&
        d !== null &&
        typeof (d as { date?: unknown }).date === "string" &&
        typeof (d as { amountCents?: unknown }).amountCents === "number"
    )
    .map((d) => ({ date: d.date, amountCents: d.amountCents }));
}

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
        periodDays: input.cost.periodDays,
        totalCents: input.cost.totalCents,
        currency: input.cost.currency,
        source: input.cost.source,
        observedAt: new Date(input.cost.observedAt),
        daily: toDailyJson(input.cost.daily),
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
    periodDays: snapshot.periodDays,
    totalCents: snapshot.totalCents,
    currency: snapshot.currency,
    source: snapshot.source,
    observedAt: snapshot.observedAt.toISOString(),
    daily: fromDailyJson(snapshot.daily),
    services: snapshot.breakdowns
      .filter((b) => b.kind === "service")
      .map((b) => ({ service: b.key, amountCents: b.amountCents, percentage: b.percentage })),
    regions: snapshot.breakdowns
      .filter((b) => b.kind === "region")
      .map((b) => ({ region: b.key, amountCents: b.amountCents, percentage: b.percentage })),
  };
}
