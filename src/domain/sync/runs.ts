/**
 * Sync run lifecycle — NG-SYNC-01
 * Pure transitions for persisted runs. Append-only history: a FAILED run is a
 * record, never a deletion — readers keep serving the last SUCCEEDED/PARTIAL data.
 */

export const SYNC_RUN_STATUSES = ["QUEUED", "RUNNING", "SUCCEEDED", "PARTIAL", "FAILED"] as const;

export type SyncRunStatus = (typeof SYNC_RUN_STATUSES)[number];

export const SYNC_SOURCES = ["DEMO", "AWS"] as const;

export type SyncSource = (typeof SYNC_SOURCES)[number];

const TRANSITIONS: Record<SyncRunStatus, ReadonlySet<SyncRunStatus>> = {
  QUEUED: new Set(["RUNNING", "FAILED"]),
  RUNNING: new Set(["SUCCEEDED", "PARTIAL", "FAILED"]),
  SUCCEEDED: new Set([]),
  PARTIAL: new Set([]),
  FAILED: new Set(["QUEUED"]),
};

/** Terminal runs never move again — history is immutable. */
export function isSyncRunTerminal(status: SyncRunStatus): boolean {
  return status === "SUCCEEDED" || status === "PARTIAL" || status === "FAILED";
}

/** Guard for run writes — illegal jumps are rejected, never silently stored. */
export function canTransitionRun(from: SyncRunStatus, to: SyncRunStatus): boolean {
  return TRANSITIONS[from].has(to);
}

/** Freshness source of truth: latest terminal run carrying usable data. */
export function isUsableRun(status: SyncRunStatus): boolean {
  return status === "SUCCEEDED" || status === "PARTIAL";
}

/** Data older than this reads as stale (NG-DASH-06). */
export const FRESHNESS_STALE_AFTER_MS = 24 * 60 * 60 * 1000;

/** Human age for freshness lines: "just now", "Xm ago", "Xh ago", "Xd ago". */
export function formatAge(observedAtIso: string, nowMs: number = Date.now()): string {
  const diff = Math.max(0, nowMs - new Date(observedAtIso).getTime());
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

/** Whether an observation timestamp counts as stale right now. */
export function isStaleObservation(
  observedAtIso: string,
  nowMs: number = Date.now(),
  thresholdMs: number = FRESHNESS_STALE_AFTER_MS
): boolean {
  return nowMs - new Date(observedAtIso).getTime() > thresholdMs;
}
