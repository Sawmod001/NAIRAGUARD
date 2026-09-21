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
  SYNCING: new Set(["SYNCED", "RATE_LIMITED", "AUTH_FAILED", "PERMISSION_DENIED", "ERROR", "DISCONNECTED"]),
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

export type ConnectionHealthTone = "ok" | "warn" | "error" | "muted";

export type ConnectionHealth = {
  tone: ConnectionHealthTone;
  title: string;
  whatItMeans: string;
  nextStep: string;
};

/**
 * NG-AWS-05: every connection state explains itself — what it means and what
 * to do next. Rendered on Connections; dashboard freshness arrives in NG-DASH-06.
 */
export const CONNECTION_HEALTH: Record<AwsConnectionStatus, ConnectionHealth> = {
  NOT_CONNECTED: {
    tone: "muted",
    title: "Not connected",
    whatItMeans: "No AWS role has been entered for this workspace yet.",
    nextStep: "Enter a Role ARN below to create the connection.",
  },
  PENDING: {
    tone: "warn",
    title: "Validation pending",
    whatItMeans: "The role is recorded but NairaGuard has not proven it can assume it yet.",
    nextStep: "Paste the workspace External ID into the role trust policy, then run validation.",
  },
  VALIDATING: {
    tone: "warn",
    title: "Validating",
    whatItMeans: "NairaGuard is assuming the role with STS right now.",
    nextStep: "Wait a few seconds, then refresh. Stuck here means a retry is safe.",
  },
  CONNECTED: {
    tone: "ok",
    title: "Connected",
    whatItMeans: "The role was assumed successfully. Cost sync can run against this connection.",
    nextStep: "Sync arrives with the data pipeline — nothing to fix.",
  },
  SYNCING: {
    tone: "ok",
    title: "Syncing",
    whatItMeans: "Cost and recommendation data is being pulled into the workspace snapshot.",
    nextStep: "Wait for the run to finish; last-known-good data stays visible meanwhile.",
  },
  SYNCED: {
    tone: "ok",
    title: "Synced",
    whatItMeans: "The latest sync completed and the workspace shows persisted AWS data.",
    nextStep: "Check freshness timestamps on the dashboard.",
  },
  STALE: {
    tone: "warn",
    title: "Stale",
    whatItMeans: "Showing the last-known-good snapshot — newer AWS data could not be pulled.",
    nextStep: "Re-run sync from the dashboard when available, or check the last error below.",
  },
  AUTH_FAILED: {
    tone: "error",
    title: "Authentication failed",
    whatItMeans: "AWS refused the AssumeRole call — wrong trust policy, External ID, or deleted role.",
    nextStep: "Fix the trust relationship in your AWS account, then retry validation.",
  },
  PERMISSION_DENIED: {
    tone: "error",
    title: "Permission denied",
    whatItMeans: "The role is assumable but lacks one or more required read permissions.",
    nextStep: "Attach the missing actions from the setup guide policy, then retry validation.",
  },
  RATE_LIMITED: {
    tone: "warn",
    title: "Rate limited",
    whatItMeans: "AWS throttled the request. Nothing is misconfigured.",
    nextStep: "Wait a minute and retry — backoff is automatic on sync runs.",
  },
  ERROR: {
    tone: "error",
    title: "Error",
    whatItMeans: "Something unexpected happened (network, timeout, or AWS-side fault).",
    nextStep: "Retry once. If it persists, re-enter the Role ARN to start clean.",
  },
  DISCONNECTED: {
    tone: "muted",
    title: "Disconnected",
    whatItMeans: "A previous connection was closed. It no longer syncs or validates.",
    nextStep: "Enter a Role ARN to connect again.",
  },
};

export function getConnectionHealth(status: AwsConnectionStatus): ConnectionHealth {
  return CONNECTION_HEALTH[status];
}
