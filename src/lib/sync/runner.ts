import { prisma } from "@/lib/prisma/client";
import { canTransitionRun, type SyncRunStatus, type SyncSource } from "@/domain/sync/runs";

/**
 * Idempotent sync runner — NG-SYNC-02
 * Plain library (no request scope): server actions/routes pass explicit params.
 * - One active run per org: a second trigger returns the in-flight run (deduped).
 * - Every write is transition-guarded with a status precondition, so concurrent
 *   triggers cannot fork history (loser sees count 0 and returns the winner).
 * - Provider throw → FAILED with truncated error; good data is untouched
 *   (runs are append-only; readers serve the last SUCCEEDED/PARTIAL run).
 * - Retry/backoff policy arrives in NG-SYNC-03; record tables in NG-COST-02/03.
 */

export type SyncCounts = Record<string, number>;

export type SyncProvider = {
  source: SyncSource;
  fetch(input: { organizationId: string }): Promise<{ counts: SyncCounts; partial?: boolean }>;
};

export type SyncResult = {
  runId: string;
  status: SyncRunStatus;
  deduped: boolean;
  error?: string;
};

const ACTIVE_STATUSES: SyncRunStatus[] = ["QUEUED", "RUNNING"];

async function transitionRun(
  id: string,
  from: SyncRunStatus,
  to: SyncRunStatus,
  data: { startedAt?: Date; finishedAt?: Date; error?: string; recordCounts?: SyncCounts }
): Promise<boolean> {
  if (!canTransitionRun(from, to)) return false;
  const res = await prisma.syncRun.updateMany({ where: { id, status: from }, data: { status: to, ...data } });
  return res.count === 1;
}

export async function runSync(input: {
  organizationId: string;
  awsConnectionId?: string;
  provider: SyncProvider;
}): Promise<SyncResult> {
  const scope = { organizationId: input.organizationId, status: { in: ACTIVE_STATUSES } };
  const active = await prisma.syncRun.findFirst({ where: scope, orderBy: { createdAt: "desc" } });
  if (active) {
    return { runId: active.id, status: active.status as SyncRunStatus, deduped: true };
  }

  const run = await prisma.syncRun.create({
    data: {
      organizationId: input.organizationId,
      awsConnectionId: input.awsConnectionId ?? null,
      source: input.provider.source,
      status: "QUEUED",
    },
  });

  const started = await transitionRun(run.id, "QUEUED", "RUNNING", { startedAt: new Date() });
  if (!started) {
    const winner = await prisma.syncRun.findFirst({ where: scope, orderBy: { createdAt: "desc" } });
    if (winner && winner.id !== run.id) {
      return { runId: winner.id, status: winner.status as SyncRunStatus, deduped: true };
    }
    return { runId: run.id, status: "QUEUED", deduped: true };
  }

  try {
    const result = await input.provider.fetch({ organizationId: input.organizationId });
    const terminal: SyncRunStatus = result.partial ? "PARTIAL" : "SUCCEEDED";
    await transitionRun(run.id, "RUNNING", terminal, { finishedAt: new Date(), recordCounts: result.counts });
    return { runId: run.id, status: terminal, deduped: false };
  } catch (e) {
    const message = (e instanceof Error ? e.message : "Unknown sync failure.").slice(0, 500);
    await transitionRun(run.id, "RUNNING", "FAILED", { finishedAt: new Date(), error: message });
    return { runId: run.id, status: "FAILED", deduped: false, error: message };
  }
}
