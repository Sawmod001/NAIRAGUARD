"use client";

import { useEffect, useState } from "react";

/**
 * Reduced-motion foundation — NG-MOTION-01
 * Single query string plus a listener hook. Motion consumers (framer-motion
 * entrances, GSAP choreography, intervals) branch on this: reduced users get
 * immediate content, never pinned or long-running animation.
 */

export const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

type MatchMediaFn = (query: string) => { matches: boolean };

/** Pure core for tests and non-React call sites. No matchMedia = no preference. */
export function getReducedMotionSnapshot(matchMediaFn?: MatchMediaFn): boolean {
  if (!matchMediaFn) return false;
  try {
    return matchMediaFn(REDUCED_MOTION_QUERY).matches;
  } catch {
    return false;
  }
}

export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState<boolean>(() =>
    getReducedMotionSnapshot(typeof window !== "undefined" ? window.matchMedia.bind(window) : undefined)
  );
  useEffect(() => {
    const mql = window.matchMedia(REDUCED_MOTION_QUERY);
    const onChange = (event: MediaQueryListEvent) => setReduced(event.matches);
    mql.addEventListener("change", onChange);
    setReduced(mql.matches);
    return () => mql.removeEventListener("change", onChange);
  }, []);
  return reduced;
}
