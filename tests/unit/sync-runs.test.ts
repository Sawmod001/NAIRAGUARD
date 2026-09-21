import { describe, expect, it } from "vitest";
import { canTransitionRun, isSyncRunTerminal, isUsableRun, SYNC_RUN_STATUSES } from "@/domain/sync/runs";

/** NG-SYNC-01: append-only run history — failures never erase good data. */
describe("sync run lifecycle (NG-SYNC-01)", () => {
  it("covers queued, running, and the three terminal states", () => {
    expect(SYNC_RUN_STATUSES).toEqual(["QUEUED", "RUNNING", "SUCCEEDED", "PARTIAL", "FAILED"]);
  });

  it("flows queue → run → terminal", () => {
    expect(canTransitionRun("QUEUED", "RUNNING")).toBe(true);
    expect(canTransitionRun("RUNNING", "SUCCEEDED")).toBe(true);
    expect(canTransitionRun("RUNNING", "PARTIAL")).toBe(true);
    expect(canTransitionRun("RUNNING", "FAILED")).toBe(true);
    expect(canTransitionRun("QUEUED", "FAILED")).toBe(true);
  });

  it("terminal runs are immutable except failed → requeue", () => {
    expect(canTransitionRun("FAILED", "QUEUED")).toBe(true);
    expect(canTransitionRun("SUCCEEDED", "RUNNING")).toBe(false);
    expect(canTransitionRun("PARTIAL", "QUEUED")).toBe(false);
    expect(canTransitionRun("QUEUED", "SUCCEEDED")).toBe(false);
    for (const s of ["SUCCEEDED", "PARTIAL", "FAILED"] as const) {
      expect(isSyncRunTerminal(s)).toBe(true);
    }
    expect(isSyncRunTerminal("RUNNING")).toBe(false);
  });

  it("only succeeded and partial runs feed the dashboard", () => {
    expect(isUsableRun("SUCCEEDED")).toBe(true);
    expect(isUsableRun("PARTIAL")).toBe(true);
    expect(isUsableRun("FAILED")).toBe(false);
    expect(isUsableRun("RUNNING")).toBe(false);
    expect(isUsableRun("QUEUED")).toBe(false);
  });
});
