import type { Variants } from "framer-motion";

/**
 * Shared entrance language — NG-MOTION-01
 * One fade-rise for section content; keep durations short and easing uniform
 * so motion feels like a system, not decoration. Reduced-motion users bypass
 * variants entirely (see Reveal) instead of getting zero-duration variants.
 */

export const ENTRANCE_DURATION = 0.5;
export const ENTRANCE_DISTANCE = 16;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: ENTRANCE_DISTANCE },
  show: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: ENTRANCE_DURATION, delay, ease: "easeOut" },
  }),
};

export const staggerParent: Variants = {
  hidden: {},
  show: (gap: number = 0.08) => ({
    transition: { staggerChildren: gap },
  }),
};

export const ENTRANCE_VIEWPORT = { once: true, margin: "-80px" } as const;
