import { describe, expect, it } from "vitest";
import { ENTRANCE_DISTANCE, ENTRANCE_DURATION, ENTRANCE_VIEWPORT, fadeUp, staggerParent } from "@/lib/motion/entrance";
import { getReducedMotionSnapshot, REDUCED_MOTION_QUERY } from "@/lib/motion/reduced-motion";

/** NG-MOTION-01: one entrance language and an honest reduced-motion core. */
describe("motion system (NG-MOTION-01)", () => {
  it("shares the reduced-motion query string", () => {
    expect(REDUCED_MOTION_QUERY).toBe("(prefers-reduced-motion: reduce)");
  });

  it("reads the preference without DOM access when absent", () => {
    expect(getReducedMotionSnapshot(undefined)).toBe(false);
    expect(getReducedMotionSnapshot(() => ({ matches: true }))).toBe(true);
    expect(getReducedMotionSnapshot(() => ({ matches: false }))).toBe(false);
    expect(
      getReducedMotionSnapshot(() => {
        throw new Error("no matchMedia");
      })
    ).toBe(false);
  });

  it("keeps one short fade-rise language", () => {
    expect(ENTRANCE_DURATION).toBeLessThanOrEqual(0.6);
    expect(ENTRANCE_DISTANCE).toBeGreaterThan(0);
    expect(fadeUp.hidden).toMatchObject({ opacity: 0, y: ENTRANCE_DISTANCE });
    const show = (fadeUp.show as (delay?: number) => object)(0.1);
    expect(show).toMatchObject({ opacity: 1, y: 0 });
    const stagger = (staggerParent.show as (gap?: number) => object)();
    expect(stagger).toHaveProperty("transition");
    expect(ENTRANCE_VIEWPORT.once).toBe(true);
  });
});
