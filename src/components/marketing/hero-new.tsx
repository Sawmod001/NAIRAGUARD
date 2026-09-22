"use client";
// NG-HOME-03 audit: interval respects prefers-reduced-motion, no ScrollTrigger pinned sections (0/1 allowed)

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/motion/gsap";
import { getReducedMotionSnapshot } from "@/lib/motion/reduced-motion";

const steps = [
  { label: "AWS RESOURCES", sub: "EC2 • RDS • EBS • S3" },
  { label: "CLOUD SPEND", sub: "$1,378.16 • 30d" },
  { label: "NEEDS ATTENTION", sub: "EC2 underutilized" },
  { label: "OPPORTUNITY", sub: "Rightsize m6i.2xlarge → xlarge" },
  { label: "POTENTIAL SAVINGS", sub: "$118.70 / mo" },
  { label: "₦ IMPACT", sub: "₦183,985 est." },
] as const;

export function HeroNew() {
  const [active, setActive] = useState(0);
  const [visible, setVisible] = useState(true);
  const rootRef = useRef<HTMLElement>(null);
  // NG-MOTION-04: pause the rotation while the hero is off-screen (mobile scroll).
  useEffect(() => {
    const root = rootRef.current;
    if (!root || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry?.isIntersecting ?? true), {
      threshold: 0,
    });
    observer.observe(root);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (m.matches || !visible) return;
    const id = setInterval(() => setActive((v) => (v + 1) % steps.length), 1400);
    return () => clearInterval(id);
  }, [visible]);

  // NG-MOTION-02: entrance choreography — kicker, headline, sub, CTAs, panel.
  // Reduced-motion users skip it via the shared snapshot (static first paint).
  useEffect(() => {
    const root = rootRef.current;
    if (!root || getReducedMotionSnapshot(window.matchMedia.bind(window))) return;
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.from(root.querySelectorAll("[data-hero-step]"), { y: 28, opacity: 0, duration: 0.7, stagger: 0.09 })
        .from(root.querySelectorAll("[data-hero-panel]"), { y: 24, opacity: 0, duration: 0.8 }, "-=0.4");
    });
    return () => {
      mm.revert();
    };
  }, []);

  return (
    <section ref={rootRef} className="bg-black text-white">
      <div className="mx-auto grid max-w-[1280px] gap-8 px-6 py-12 md:grid-cols-[1.15fr_0.85fr] md:py-20">
        <div>
          <div data-hero-step className="font-mono text-xs tracking-[0.2em] text-zinc-400">AWS FINOPS / BUILT FOR NAIRA-AWARE TEAMS</div>
          <h1 data-hero-step className="font-display mt-4 text-[clamp(32px,6vw,64px)] font-semibold leading-[0.9] tracking-[-0.04em]">
            <span className="block">See where your</span>
            <span className="block">AWS spend goes.</span>
            <span className="block text-orange-500">Find what deserves attention.</span>
            <span className="block font-light text-zinc-300">Understand what it</span>
            <span className="block font-light text-zinc-300">means in naira.</span>
          </h1>
          <p data-hero-step className="mt-4 max-w-xl text-[15px] leading-6 text-zinc-400">
            AWS gives you the infrastructure bill. NairaGuard gives the business context around it.
          </p>
          <div data-hero-step className="mt-6 flex flex-wrap gap-3">
            <a href="/onboarding" className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-black hover:bg-zinc-100">Try Demo</a>
            <a href="#how" className="rounded-full border border-zinc-700 px-5 py-3 text-sm font-medium hover:bg-zinc-900">See how it works</a>
          </div>
          <div className="mt-3 font-mono text-xs tracking-wide text-zinc-500">Guided tour • No setup • Naira context included</div>
        </div>

        {/* Visual story — product UI + human context, not decorative */}
        <div data-hero-panel className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">
          {/* Business image — human context, masked transition with story */}
          <div className="relative h-48 overflow-hidden">
            <img
              src="/istockphoto-2094337676-612x612.jpg"
              alt="Business team reviewing data"
              className="h-full w-full object-cover transition-all duration-700"
              style={{ clipPath: active >= 2 ? "inset(0 0 0 0)" : "inset(0 50% 0 0)", filter: active >= 4 ? "grayscale(0)" : "grayscale(1)" }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent" />
            <div className="absolute bottom-2 left-3 rounded bg-black/70 px-2 py-1 font-mono text-[10px] tracking-widest text-white">HUMAN • BUSINESS DECISION</div>
          </div>
          <div className="p-6">
            <div className="font-mono text-xs tracking-widest text-zinc-500">VISUAL STORY • {steps[active]!.label}</div>
            <div className="mt-3 space-y-1.5">
              {steps.map((s, i) => (
                <div key={s.label} className={`flex items-center justify-between rounded-lg border px-3 py-1.5 text-xs transition-all ${i === active ? "border-orange-500 bg-zinc-800 text-white" : i < active ? "border-zinc-700 bg-zinc-800/50 text-zinc-300" : "border-zinc-800 text-zinc-500"}`}>
                  <span className="font-mono">{s.label}</span>
                  <span>{s.sub}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
              <div className="rounded bg-white p-3 text-black">
                <div className="font-mono text-[10px] tracking-widest text-zinc-500">USD</div>
                <div className="font-semibold">$118.70</div>
              </div>
              <div className="flex items-center justify-center text-zinc-500">× 1,550</div>
              <div className="rounded bg-orange-500 p-3 text-black">
                <div className="font-mono text-[10px] tracking-widest">EST. NGN</div>
                <div className="font-semibold">₦183,985</div>
              </div>
            </div>
            <div className="mt-2 text-center font-mono text-[10px] tracking-widest text-zinc-500">DETERMINISTIC • 2026-09-15 • RECORDED RATE</div>
          </div>
        </div>
      </div>
    </section>
  );
}
