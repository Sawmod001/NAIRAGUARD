"use client";
import { useEffect, useState } from "react";
import { getReducedMotionSnapshot } from "@/lib/motion/reduced-motion";

export function CountUp({ value, prefix = "", decimals = 0 }: { value: number; prefix?: string; decimals?: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (getReducedMotionSnapshot(window.matchMedia.bind(window))) {
      setDisplay(value);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const dur = 900;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(value * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  const formatted = decimals ? display.toFixed(decimals) : Math.round(display).toLocaleString();
  return <span>{prefix}{formatted}</span>;
}
