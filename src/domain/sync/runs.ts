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
