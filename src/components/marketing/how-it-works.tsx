"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/motion/gsap";
import { getReducedMotionSnapshot } from "@/lib/motion/reduced-motion";

const STEPS = [
  { n: "01", title: "CONNECT", desc: "Bring AWS cost & recommendation data. Explore first with a guided dataset.", color: "bg-white text-black" },
  { n: "02", title: "NORMALIZE", desc: "Provider data → consistent model. Costs & recs comparable.", color: "bg-zinc-900 text-white" },
  { n: "03", title: "CALCULATE", desc: "Deterministic: totals, %, aggregates, NGN. No LLM math.", color: "bg-orange-500 text-black" },
  { n: "04", title: "UNDERSTAND", desc: "USD truth plus NGN estimates, freshness, and next steps — the business context.", color: "bg-black text-white" },
] as const;

/**
 * NG-MOTION-03: the single pinned storytelling section (≤1 allowed).
 * Desktop + no-preference only: the panel pins while scrub highlights each
 * pipeline step in turn. Everyone else gets the static grid, fully visible.
 */
export function HowItWorks() {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || getReducedMotionSnapshot(window.matchMedia.bind(window))) return;
    const mm = gsap.matchMedia();
    mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
      const cards = gsap.utils.toArray<HTMLElement>(root.querySelectorAll("[data-pipeline-step]"));
      if (cards.length === 0) return;
      gsap.set(cards, { opacity: 0.35 });
      const first = cards[0];
      if (first) gsap.set(first, { opacity: 1 });
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root.querySelector("[data-pipeline-pin]"),
          start: "top top+=96",
          end: "+=900",
          pin: true,
          scrub: 0.5,
        },
      });
      cards.slice(1).forEach((card) => {
        tl.to(card, { opacity: 1, duration: 0.4 });
      });
    });
    return () => {
      mm.revert();
    };
  }, []);

  return (
    <section ref={rootRef} id="how" className="bg-white">
      <div className="mx-auto max-w-[1280px] px-6 py-16">
        <div className="font-mono text-xs tracking-[0.2em] text-zinc-500">HOW NAIRAGUARD WORKS</div>
        <h2 className="font-display mt-2 text-3xl font-semibold tracking-tight">From cloud data to a decision you can act on.</h2>
        <div data-pipeline-pin className="mt-8 grid gap-4 md:grid-cols-4">
          {STEPS.map((s) => (
            <div key={s.n} data-pipeline-step className={`rounded-xl border border-zinc-200 p-6 ${s.color}`}>
              <div className="font-mono text-xs tracking-widest opacity-60">{s.n}</div>
              <div className="font-display mt-2 text-lg font-semibold">{s.title}</div>
              <div className="mt-2 text-sm opacity-80">{s.desc}</div>
            </div>
          ))}
        </div>
        <div className="mt-6 rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-center font-mono text-xs tracking-widest text-orange-800">THE NUMBERS ARE DETERMINISTIC. THE CONTEXT EXPLAINS THEM.</div>
      </div>
    </section>
  );
}
