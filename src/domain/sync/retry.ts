/**
 * Sync retry policy — NG-SYNC-03
 * Pure helpers: exponential backoff with full jitter, throttle detection, and
 * attempt budgeting. Callers wrap provider fetches; the runner (NG-SYNC-02)
 * stays single-attempt so every try is its own auditable history entry.
 * Partial results ride the existing PARTIAL terminal state (usable by readers).
 */

export type RetryPolicy = {
  /** Max tries including the first attempt. */
  maxAttempts: number;
  /** Base delay before doubling. */
  baseDelayMs: number;
  /** Hard ceiling per wait. */
  maxDelayMs: number;
};

export const DEFAULT_RETRY_POLICY: RetryPolicy = {
  maxAttempts: 4,
  baseDelayMs: 1_000,
  maxDelayMs: 15_000,
};

/** Exponential backoff with full jitter: uniform(0, min(cap, base * 2^attempt)). */
export function computeBackoffDelay(
  failedAttempt: number,
  policy: RetryPolicy = DEFAULT_RETRY_POLICY,
  random: () => number = Math.random
): number {
  const attempt = Math.max(0, Math.floor(failedAttempt));
  const cap = Math.min(policy.maxDelayMs, policy.baseDelayMs * 2 ** attempt);
  return Math.floor(random() * (cap + 1));
}

const THROTTLE_RE = /Throttl|TooManyRequests|RequestLimitExceeded|RateExceeded|429|ProvisionedThroughputExceeded/i;

/** Whether an SDK-shaped failure is throttling (back off, do not rewire). */
export function isThrottledError(err: unknown): boolean {
  const name = (err as { name?: string })?.name ?? "";
  const code = (err as { code?: string | number })?.code ?? "";
  const status = (err as { $metadata?: { httpStatusCode?: number } })?.$metadata?.httpStatusCode;
  if (status === 429) return true;
  return THROTTLE_RE.test(`${name} ${code}`);
}

const RETRYABLE_RE = /Throttl|TooManyRequests|RequestLimitExceeded|RateExceeded|Timeout|NetworkingError|AbortError|ECONNRESET|ETIMEDOUT|ServiceUnavailable|InternalError|RequestTimeout/i;

/** Retryable = throttling or transient transport/service faults. Auth and shape errors never retry. */
export function isRetryableSyncError(err: unknown): boolean {
  if (isThrottledError(err)) return true;
  const name = (err as { name?: string })?.name ?? "";
  const code = (err as { code?: string | number })?.code ?? "";
  const status = (err as { $metadata?: { httpStatusCode?: number } })?.$metadata?.httpStatusCode;
  if (typeof status === "number" && (status === 429 || status >= 500)) return true;
  return RETRYABLE_RE.test(`${name} ${code}`);
}

export type RetryOutcome<T> =
  | { ok: true; value: T; attempts: number }
  | { ok: false; error: unknown; attempts: number };

/**
 * Run `fn` under the policy: retry only retryable failures, wait with jitter
 * between tries, stop early on permanent errors. Sleep is injectable for tests.
 */
export async function withRetry<T>(
  fn: (attempt: number) => Promise<T>,
  policy: RetryPolicy = DEFAULT_RETRY_POLICY,
  sleep: (ms: number) => Promise<void> = (ms) => new Promise((r) => setTimeout(r, ms)),
  random: () => number = Math.random
): Promise<RetryOutcome<T>> {
  const maxAttempts = Math.max(1, Math.floor(policy.maxAttempts));
  let attempt = 0;
  // oxlint-disable-next-line no-constant-condition
  while (true) {
    try {
      const value = await fn(attempt);
      return { ok: true, value, attempts: attempt + 1 };
    } catch (error) {
      if (attempt + 1 >= maxAttempts || !isRetryableSyncError(error)) {
        return { ok: false, error, attempts: attempt + 1 };
      }
      await sleep(computeBackoffDelay(attempt, policy, random));
      attempt += 1;
    }
  }
}
