import { describe, expect, it, vi } from "vitest";
import {
  computeBackoffDelay,
  DEFAULT_RETRY_POLICY,
  isRetryableSyncError,
  isThrottledError,
  withRetry,
} from "@/domain/sync/retry";

/** NG-SYNC-03: backoff honors caps, only transient faults retry, sleeps are jittered. */
describe("sync retry policy (NG-SYNC-03)", () => {
  it("backs off exponentially with a ceiling", () => {
    const fixed = () => 0.999999;
    expect(computeBackoffDelay(0, DEFAULT_RETRY_POLICY, fixed)).toBeLessThanOrEqual(1_000);
    expect(computeBackoffDelay(1, DEFAULT_RETRY_POLICY, fixed)).toBeLessThanOrEqual(2_000);
    expect(computeBackoffDelay(10, DEFAULT_RETRY_POLICY, fixed)).toBeLessThanOrEqual(15_000);
    expect(computeBackoffDelay(0, DEFAULT_RETRY_POLICY, () => 0)).toBe(0);
  });

  it("detects throttling across SDK shapes", () => {
    expect(isThrottledError({ name: "ThrottlingException" })).toBe(true);
    expect(isThrottledError({ name: "TooManyRequestsException" })).toBe(true);
    expect(isThrottledError({ name: "AccessDeniedException" })).toBe(false);
    expect(isThrottledError({ $metadata: { httpStatusCode: 429 } })).toBe(true);
    expect(isThrottledError(null)).toBe(false);
  });

  it("retries transient faults but never auth or shape errors", () => {
    expect(isRetryableSyncError({ name: "ThrottlingException" })).toBe(true);
    expect(isRetryableSyncError({ name: "TimeoutError" })).toBe(true);
    expect(isRetryableSyncError({ $metadata: { httpStatusCode: 503 } })).toBe(true);
    expect(isRetryableSyncError({ name: "AccessDeniedException" })).toBe(false);
    expect(isRetryableSyncError({ name: "ValidationError" })).toBe(false);
    expect(isRetryableSyncError({ $metadata: { httpStatusCode: 400 } })).toBe(false);
  });

  it("succeeds first try without sleeping", async () => {
    const sleep = vi.fn(async () => {});
    const out = await withRetry(async () => "done", DEFAULT_RETRY_POLICY, sleep, () => 0);
    expect(out).toEqual({ ok: true, value: "done", attempts: 1 });
    expect(sleep).not.toHaveBeenCalled();
  });

  it("retries throttles with jittered waits then succeeds", async () => {
    const sleep: (ms: number) => Promise<void> = vi.fn(async () => {});
    let calls = 0;
    const out = await withRetry(
      async () => {
        calls += 1;
        if (calls < 3) throw { name: "ThrottlingException", message: "slow down" };
        return "recovered";
      },
      { maxAttempts: 4, baseDelayMs: 1_000, maxDelayMs: 15_000 },
      sleep,
      () => 0.5
    );
    expect(out).toEqual({ ok: true, value: "recovered", attempts: 3 });
    expect(sleep).toHaveBeenCalledTimes(2);
    for (const [ms] of sleep.mock.calls) expect(ms).toBeGreaterThanOrEqual(0);
  });

  it("stops early on permanent errors and exhausts on persistent throttles", async () => {
    const sleep: (ms: number) => Promise<void> = vi.fn(async () => {});
    const perm = await withRetry(
      async () => { throw { name: "AccessDeniedException", message: "no" }; },
      DEFAULT_RETRY_POLICY,
      sleep
    );
    expect(perm.ok).toBe(false);
    expect(perm.attempts).toBe(1);
    expect(sleep).not.toHaveBeenCalled();

    const exhausted = await withRetry(
      async () => { throw { name: "ThrottlingException", message: "busy" }; },
      { maxAttempts: 3, baseDelayMs: 10, maxDelayMs: 100 },
      sleep,
      () => 0
    );
    expect(exhausted.ok).toBe(false);
    expect(exhausted.attempts).toBe(3);
  });
});
