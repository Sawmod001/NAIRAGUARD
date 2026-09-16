export function Understand() {
  return (
    <section className="bg-black text-white">
      <div className="mx-auto max-w-[1280px] px-6 py-16">
        <div className="font-mono text-xs tracking-[0.2em] text-zinc-500">03 / UNDERSTAND</div>
        <h2 className="font-display mt-2 text-3xl font-semibold tracking-tight">A dollar saving means something different when your budget is in naira.</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-8">
            <div className="font-mono text-xs tracking-widest text-zinc-500">POTENTIAL MONTHLY SAVINGS</div>
            <div className="font-display mt-2 text-5xl font-semibold">$118.70</div>
            <div className="mt-4 flex items-center gap-4">
              <div className="h-px flex-1 bg-zinc-700" />
              <span className="font-mono text-xs tracking-widest text-zinc-500">× ₦1,550</span>
              <div className="h-px flex-1 bg-orange-500" />
            </div>
            <div className="mt-4">
              <div className="font-display text-5xl font-semibold text-orange-500">₦183,985</div>
              <div className="font-mono text-xs tracking-widest text-zinc-500">ESTIMATED NAIRA EQUIVALENT</div>
            </div>
            <div className="mt-4 font-mono text-xs text-zinc-500">FX 1,550 • 2026-09-15 • demo-fixture • Not exact bank charge</div>
          </div>
          <div className="space-y-4 text-sm text-zinc-300">
            <p>NairaGuard translates USD costs and potential savings into estimated Naira equivalent using recorded rate and timestamp.</p>
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">Current spend $1,378.16 → ₦2,136,148 at same rate. Potential savings $138.70 → ₦214,985. Deterministic, not AI.</div>
            <div className="font-mono text-xs tracking-widest text-zinc-500">USD truth • NGN estimate • Rate shown everywhere</div>
          </div>
        </div>
      </div>
    </section>
  );
}
