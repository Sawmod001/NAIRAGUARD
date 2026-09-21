import { describe, expect, it } from "vitest";
import { interpretConnectionStatus, retryBadge } from "@/domain/aws/errors";
import { AWS_CONNECTION_STATUSES } from "@/domain/aws/connection";

/** NG-AWS-07: every failure is understandable, retryable-or-not, and data-safe. */
describe("aws error interpreter (NG-AWS-07)", () => {
  it("interprets all 12 states completely", () => {
    for (const status of AWS_CONNECTION_STATUSES) {
      const out = interpretConnectionStatus(status);
      expect(out.headline.length).toBeGreaterThan(0);
      expect(out.detail.length).toBeGreaterThan(0);
      expect(out.nextStep.length).toBeGreaterThan(0);
      expect(typeof out.retryable).toBe("boolean");
      expect(typeof out.showLastGoodData).toBe("boolean");
    }
  });

  it("marks only transient states retryable", () => {
    expect(interpretConnectionStatus("RATE_LIMITED").retryable).toBe(true);
    expect(interpretConnectionStatus("ERROR").retryable).toBe(true);
    expect(interpretConnectionStatus("STALE").retryable).toBe(true);
    expect(interpretConnectionStatus("AUTH_FAILED").retryable).toBe(false);
    expect(interpretConnectionStatus("PERMISSION_DENIED").retryable).toBe(false);
    expect(interpretConnectionStatus("PENDING").retryable).toBe(false);
    expect(interpretConnectionStatus("SYNCED").retryable).toBe(false);
  });

  it("keeps last-known-good data visible on readable states only", () => {
    expect(interpretConnectionStatus("STALE").showLastGoodData).toBe(true);
    expect(interpretConnectionStatus("SYNCED").showLastGoodData).toBe(true);
    expect(interpretConnectionStatus("AUTH_FAILED").showLastGoodData).toBe(false);
    expect(interpretConnectionStatus("NOT_CONNECTED").showLastGoodData).toBe(false);
  });

  it("permission failures name the fix, not a retry", () => {
    const out = interpretConnectionStatus("PERMISSION_DENIED");
    expect(out.retryable).toBe(false);
    expect(out.nextStep).toMatch(/missing actions/i);
    expect(retryBadge("PERMISSION_DENIED")).toBeNull();
  });

  it("badges transient states", () => {
    expect(retryBadge("RATE_LIMITED")).toMatch(/minute/);
    expect(retryBadge("ERROR")).toMatch(/once/);
    expect(retryBadge("AUTH_FAILED")).toBeNull();
    expect(retryBadge("CONNECTED")).toBeNull();
  });
});
