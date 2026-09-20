import { describe, expect, it } from "vitest";
import {
  AWS_CONNECTION_STATUSES,
  canStartSync,
  canTransition,
  generateExternalId,
  isConnectionFailure,
  isConnectionReadable,
  type AwsConnectionStatus,
} from "@/domain/aws/connection";

/** NG-AWS-01: connection lifecycle is explicit — every failure distinguishable. */
describe("aws connection lifecycle (NG-AWS-01)", () => {
  it("covers the 12 production states", () => {
    expect(AWS_CONNECTION_STATUSES).toHaveLength(12);
    for (const s of ["NOT_CONNECTED", "PENDING", "VALIDATING", "CONNECTED", "SYNCING", "SYNCED", "STALE", "AUTH_FAILED", "PERMISSION_DENIED", "RATE_LIMITED", "ERROR", "DISCONNECTED"] as const) {
      expect(AWS_CONNECTION_STATUSES).toContain(s);
    }
  });

  it("happy path transitions are legal", () => {
    const path: [AwsConnectionStatus, AwsConnectionStatus][] = [
      ["NOT_CONNECTED", "PENDING"],
      ["PENDING", "VALIDATING"],
      ["VALIDATING", "CONNECTED"],
      ["CONNECTED", "SYNCING"],
      ["SYNCING", "SYNCED"],
      ["SYNCED", "SYNCING"],
      ["SYNCED", "STALE"],
      ["STALE", "SYNCING"],
      ["SYNCING", "DISCONNECTED"],
      ["STALE", "DISCONNECTED"],
    ];
    for (const [from, to] of path) expect(canTransition(from, to)).toBe(true);
  });

  it("rejects impossible jumps", () => {
    expect(canTransition("NOT_CONNECTED", "SYNCED")).toBe(false);
    expect(canTransition("SYNCED", "CONNECTED")).toBe(false);
    expect(canTransition("DISCONNECTED", "SYNCED")).toBe(false);
    expect(canTransition("ERROR", "SYNCED")).toBe(false);
  });

  it("failures retry via VALIDATING or end at DISCONNECTED", () => {
    for (const f of ["AUTH_FAILED", "PERMISSION_DENIED", "RATE_LIMITED", "ERROR"] as const) {
      expect(isConnectionFailure(f)).toBe(true);
      expect(canTransition(f, "DISCONNECTED")).toBe(true);
    }
    expect(canTransition("AUTH_FAILED", "VALIDATING")).toBe(true);
    expect(canTransition("PERMISSION_DENIED", "VALIDATING")).toBe(true);
    expect(canTransition("RATE_LIMITED", "SYNCING")).toBe(true);
  });

  it("readable states preserve last-known-good data", () => {
    for (const s of ["CONNECTED", "SYNCING", "SYNCED", "STALE"] as const) {
      expect(isConnectionReadable(s)).toBe(true);
    }
    expect(isConnectionReadable("AUTH_FAILED")).toBe(false);
    expect(isConnectionReadable("NOT_CONNECTED")).toBe(false);
  });

  it("sync starts only from connected-like states", () => {
    expect(canStartSync("CONNECTED")).toBe(true);
    expect(canStartSync("SYNCED")).toBe(true);
    expect(canStartSync("STALE")).toBe(true);
    expect(canStartSync("SYNCING")).toBe(false);
    expect(canStartSync("PENDING")).toBe(false);
    expect(canStartSync("AUTH_FAILED")).toBe(false);
  });

  it("generates unique opaque external ids", () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateExternalId()));
    expect(ids.size).toBe(100);
    for (const id of ids) expect(id).toMatch(/^ng_[0-9a-f]{24}$/);
  });
});
