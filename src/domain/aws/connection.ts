import { randomBytes } from "crypto";

/**
 * AWS Connection domain — NG-AWS-01
 * Pure logic, no DB/framework imports (mirrors the Prisma AwsConnectionStatus enum).
 * Different failures stay distinguishable so the UI can explain them (03 spec).
 */

export const AWS_CONNECTION_STATUSES = [
  "NOT_CONNECTED",
  "PENDING",
  "VALIDATING",
  "CONNECTED",
  "SYNCING",
  "SYNCED",
  "STALE",
  "AUTH_FAILED",
  "PERMISSION_DENIED",
  "RATE_LIMITED",
  "ERROR",
  "DISCONNECTED",
] as const;

export type AwsConnectionStatus = (typeof AWS_CONNECTION_STATUSES)[number];

/** Failures that name a cause — surfaced distinctly, never as generic ERROR. */
const FAILURE_STATUSES: ReadonlySet<AwsConnectionStatus> = new Set([
  "AUTH_FAILED",
  "PERMISSION_DENIED",
  "RATE_LIMITED",
  "ERROR",
]);

/** States where the workspace may read last-known-good data (fresh or stale). */
const READABLE_STATUSES: ReadonlySet<AwsConnectionStatus> = new Set([
  "CONNECTED",
  "SYNCING",
  "SYNCED",
  "STALE",
]);

/** States from which a sync run may start. */
const SYNCABLE_STATUSES: ReadonlySet<AwsConnectionStatus> = new Set([
  "CONNECTED",
  "SYNCED",
  "STALE",
]);

export function isConnectionFailure(status: AwsConnectionStatus): boolean {
  return FAILURE_STATUSES.has(status);
}

/** Whether persisted data may be shown (a failed sync never destroys it). */
export function isConnectionReadable(status: AwsConnectionStatus): boolean {
  return READABLE_STATUSES.has(status);
}

export function canStartSync(status: AwsConnectionStatus): boolean {
  return SYNCABLE_STATUSES.has(status);
}

const TRANSITIONS: Record<AwsConnectionStatus, ReadonlySet<AwsConnectionStatus>> = {
  NOT_CONNECTED: new Set(["PENDING", "ERROR"]),
  PENDING: new Set(["VALIDATING", "ERROR", "DISCONNECTED"]),
  VALIDATING: new Set(["CONNECTED", "AUTH_FAILED", "PERMISSION_DENIED", "ERROR", "DISCONNECTED"]),
  CONNECTED: new Set(["SYNCING", "STALE", "AUTH_FAILED", "ERROR", "DISCONNECTED"]),
  SYNCING: new Set(["SYNCED", "RATE_LIMITED", "AUTH_FAILED", "PERMISSION_DENIED", "ERROR"]),
  SYNCED: new Set(["SYNCING", "STALE", "DISCONNECTED"]),
  STALE: new Set(["SYNCING", "DISCONNECTED"]),
  AUTH_FAILED: new Set(["VALIDATING", "DISCONNECTED"]),
  PERMISSION_DENIED: new Set(["VALIDATING", "DISCONNECTED"]),
  RATE_LIMITED: new Set(["SYNCING", "STALE", "DISCONNECTED"]),
  ERROR: new Set(["VALIDATING", "DISCONNECTED"]),
  DISCONNECTED: new Set(["PENDING"]),
};

/** Guard for status writes — illegal jumps are rejected, never silently stored. */
export function canTransition(from: AwsConnectionStatus, to: AwsConnectionStatus): boolean {
  return TRANSITIONS[from].has(to);
}

/**
 * Customer-specific External ID for the cross-account trust relationship (NG-AWS-04).
 * Opaque and random; DB enforces uniqueness, creation retries on collision.
 */
export function generateExternalId(): string {
  return `ng_${randomBytes(12).toString("hex")}`;
}
