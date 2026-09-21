import { prisma } from "@/lib/prisma/client";
import type { FxRate } from "@/infrastructure/providers/fx-provider";

/**
 * Persisted FX snapshots — NG-FX-03
 * Server-side only. Providers fetch; this layer pins what the workspace saw so
 * every NGN estimate stays traceable after the rate moves on.
 * - Idempotent per (org, provider, pair, retrievedAt): replays return the row.
 * - Readers take the latest retrieved snapshot — never a live fetch per render.
 */

export type FxSnapshotDTO = {
  id: string;
  provider: string;
  baseCurrency: string;
  quoteCurrency: string;
  rate: number;
  retrievedAt: string;
  effectiveAt: string | null;
  source: string | null;
  status: string;
};

export async function saveFxSnapshot(input: {
  organizationId: string;
  rate: FxRate;
  effectiveAt?: string | null;
  source?: string | null;
}): Promise<{ id: string; deduped: boolean }> {
  const retrievedAt = new Date(input.rate.observedAt);
  const existing = await prisma.fxSnapshot.findFirst({
    where: {
      organizationId: input.organizationId,
      provider: input.rate.provider,
      baseCurrency: input.rate.base,
      quoteCurrency: input.rate.quote,
      retrievedAt,
    },
    select: { id: true },
  });
  if (existing) return { id: existing.id, deduped: true };

  const created = await prisma.fxSnapshot.create({
    data: {
      organizationId: input.organizationId,
      provider: input.rate.provider,
      baseCurrency: input.rate.base,
      quoteCurrency: input.rate.quote,
      rate: input.rate.rate,
      retrievedAt,
      effectiveAt: input.effectiveAt ? new Date(input.effectiveAt) : null,
      source: input.source ?? null,
      status: "active",
    },
    select: { id: true },
  });
  return { id: created.id, deduped: false };
}

export async function getLatestFxSnapshot(
  organizationId: string,
  pair: { base?: string; quote?: string } = {}
): Promise<FxSnapshotDTO | null> {
  const row = await prisma.fxSnapshot.findFirst({
    where: {
      organizationId,
      baseCurrency: pair.base ?? "USD",
      quoteCurrency: pair.quote ?? "NGN",
    },
    orderBy: { retrievedAt: "desc" },
  });
  if (!row) return null;
  return {
    id: row.id,
    provider: row.provider,
    baseCurrency: row.baseCurrency,
    quoteCurrency: row.quoteCurrency,
    rate: row.rate,
    retrievedAt: row.retrievedAt.toISOString(),
    effectiveAt: row.effectiveAt?.toISOString() ?? null,
    source: row.source,
    status: row.status,
  };
}
