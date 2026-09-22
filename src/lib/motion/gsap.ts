"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * GSAP singleton — NG-MOTION-01
 * ScrollTrigger registered once for hero choreography and selected scroll
 * storytelling (NG-MOTION-02/03). Consumers must use gsap.matchMedia() and
 * skip pinning for reduced-motion users. Importing this module has no visual
 * effect on its own — no bundle cost unless a route imports it.
 */

gsap.registerPlugin(ScrollTrigger);

export { gsap, ScrollTrigger };

/** Scoped matchMedia session; call .revert() on cleanup. */
export function gsapMatchMedia() {
  return gsap.matchMedia();
}
