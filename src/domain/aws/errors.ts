import {
  CONNECTION_HEALTH,
  isConnectionReadable,
  type AwsConnectionStatus,
  type ConnectionHealthTone,
} from "@/domain/aws/connection";

/**
 * AWS error interpreter — NG-AWS-07
 * One contract for "what went wrong, can I retry, is my old data still shown".
 * Pure: sync-phase adapters (Phase 5) and UI share it, so permission, auth,
 * throttle, and unknown failures read the same everywhere.
 */

export type AwsErrorInterpretation = {
  tone: ConnectionHealthTone;
  headline: string;
  detail: string;
  nextStep: string;
  /** Safe to retry as-is (transient). False means fix something first. */
  retryable: boolean;
  /** Last-known-good snapshot stays visible under this state. */
  showLastGoodData: boolean;
};

const RETRYABLE_STATUSES: ReadonlySet<AwsConnectionStatus> = new Set([
  "STALE",
  "RATE_LIMITED",
  "ERROR",
]);

export function interpretConnectionStatus(status: AwsConnectionStatus): AwsErrorInterpretation {
  const health = CONNECTION_HEALTH[status];
  return {
    tone: health.tone,
    headline: health.title,
    detail: health.whatItMeans,
    nextStep: health.nextStep,
    retryable: RETRYABLE_STATUSES.has(status),
    showLastGoodData: isConnectionReadable(status),
  };
}

/** Short retry badge copy for failure cards. Null when retry needs a prior fix. */
export function retryBadge(status: AwsConnectionStatus): string | null {
  if (status === "RATE_LIMITED") return "Safe to retry in a minute";
  if (status === "ERROR") return "Safe to retry once";
  if (status === "STALE") return "Re-sync when ready";
  return null;
}
