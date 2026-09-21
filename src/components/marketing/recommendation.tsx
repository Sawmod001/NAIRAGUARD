export function RecommendationShowcase() {
  return (
    <section className="bg-zinc-50">
      <div className="mx-auto max-w-[1280px] px-6 py-16">
        <h2 className="font-display text-3xl font-semibold tracking-tight">Don&apos;t just see a recommendation. Understand it.</h2>
        <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-xl border border-zinc-200 bg-white p-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-zinc-50 p-4">
                <div className="font-mono text-xs tracking-widest text-zinc-500">CURRENT</div>
                <div className="mt-1 font-mono text-sm">m6i.2xlarge</div>
                <div className="text-xs text-zinc-500">i-0a91f4c2 • eu-west-1</div>
              </div>
              <div className="rounded-lg bg-orange-50 p-4">
                <div className="font-mono text-xs tracking-widest text-orange-700">RECOMMENDED</div>
                <div className="mt-1 font-mono text-sm">m6i.xlarge</div>
                <div className="text-xs text-zinc-500">Rightsize • Cost Optimization Hub</div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
              <div className="rounded bg-zinc-900 p-3 text-white"><div className="text-xs text-zinc-400">Cost</div><div className="font-semibold">$286.40</div></div>
              <div className="rounded bg-emerald-600 p-3 text-white"><div className="text-xs">Savings</div><div className="font-semibold">$118.70</div></div>
              <div className="rounded border border-zinc-200 p-3"><div className="text-xs text-zinc-500">NGN est.</div><div className="font-semibold">₦183,985</div></div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="rounded-xl border border-zinc-200 bg-white p-5">
              <div className="font-mono text-xs tracking-widest text-zinc-500">EVIDENCE</div>
              <div className="mt-2 text-sm">CPU avg 12.4% • 14d lookback • Source Cost Optimization Hub • Freshness 2026-09-15</div>
              <div className="mt-2 text-xs">Effort Low • Restart Yes • Rollback Yes • 41.4%</div>
            </div>
            <div className="rounded-xl bg-violet-50 p-5">
              <div className="font-mono text-xs tracking-widest text-violet-700">AI EXPLANATION</div>
              <div className="mt-2 text-sm">Rightsizing reduces over-provisioned capacity. Validate in non-prod — restart required.</div>
            </div>
            <a href="/optimizations/BALANCED-STARTUP-REC-001" className="inline-block rounded-full bg-black px-5 py-2 text-sm font-medium text-white">View recommendation details</a>
          </div>
        </div>
      </div>
    </section>
  );
}
