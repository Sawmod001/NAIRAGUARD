"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { ENTRANCE_DISTANCE, ENTRANCE_DURATION, ENTRANCE_VIEWPORT } from "@/lib/motion/entrance";
import { usePrefersReducedMotion } from "@/lib/motion/reduced-motion";

/**
 * Scroll reveal — NG-MOTION-01
 * Fade-rise once on entry. Reduced-motion users get static content immediately.
 */
export function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  const reduced = usePrefersReducedMotion();
  if (reduced) {
    return <div className={className}>{children}</div>;
  }
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: ENTRANCE_DISTANCE }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ ...ENTRANCE_VIEWPORT }}
      transition={{ duration: ENTRANCE_DURATION, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
