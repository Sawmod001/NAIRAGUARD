/**
 * Hero — NG-902 Distinctive, high-quality
 * Strong typography, spacing, hierarchy, gradient, unusual box, restrained motion via CSS (no heavy deps)
 */

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-white">
      {/* Gradient accent */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-orange-500/40 to-transparent" />
      <div className="absolute -top-24 right -top-12 h-72 w-72 rounded-full bg-orange-500/10 blur-3xl" />

      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-16 md:grid-cols-[1.2fr_0.8fr] md:py-20">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-medium tracking-wide">
            <span className="h-2 w-2 animate-pulse rounded-full bg-orange-500" />
            Naira-aware • Demo-first
          </div>

          <h1 className="mt-4 text-5xl font-semibold tracking-tighter leading-[0.9] md:text-6xl">
            <span className="block">Your AWS bill,</span>
            <span className="block bg-gradient-to-r from-zinc-900 via-orange-600 to-zinc-900 bg-clip-text text-transparent">
              in Naira.
            </span>
          </h1>

          <p className="mt-4 max-w-xl text-lg leading-7 text-zinc-600">
            See spend in <span className="font-medium text-zinc-900">USD</span> and{" "}
            <span className="font-medium text-zinc-900">estimated NGN</span> — find credible waste before the dollar bill lands.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <a href="/sign-up" className="rounded-md bg-black px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-800">
              Start in Demo Mode →
            </a>
            <a href="/dashboard" className="rounded-md border border-zinc-200 px-5 py-2.5 text-sm font-medium hover:bg-zinc-50">
              View dashboard
            </a>
          </div>

          <div className="mt-6 flex gap-6 text-xs text-zinc-500">
            <span>✓ No AWS account needed</span>
            <span>✓ Realistic demo data</span>
            <span>✓ Prod auth</span>
          </div>
        </div>

        {/* Unusual box model — tilted card */}
        <div className="relative">
          <div className="absolute -inset-2 rotate-1 rounded-2xl bg-gradient-to-br from-orange-500/20 via-zinc-900/5 to-transparent" />
          <div className="relative rounded-2xl border border-zinc-200 bg-white p-6 shadow-lg">
            <div className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Example • Balanced Startup</div>
            <div className="mt-3 flex items-baseline justify-between">
              <div>
                <div className="text-xs text-zinc-500">Total spend</div>
                <div className="text-2xl font-semibold">$1,378.16</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-zinc-500">Est. Naira</div>
                <div className="text-lg font-semibold text-orange-600">₦2,136,148</div>
              </div>
            </div>
            <div className="mt-3 text-xs text-zinc-500">at ₦1,550/USD • demo-fixture • 2026-09-15 • <span className="rounded bg-orange-100 px-1.5 py-0.5 text-orange-700">Demo Mode</span></div>
            <div className="mt-4 h-16 rounded bg-zinc-50 p-2">
              <div className="flex h-full items-end gap-[2px]">
                {[43, 46, 44, 47, 45, 48, 46, 43, 46, 44, 47, 45].map((v, i) => (
                  <div key={i} className="flex-1 rounded-t bg-zinc-900" style={{ height: `${(v / 48) * 100}%` }} />
                ))}
              </div>
            </div>
            <div className="mt-3 rounded-md bg-emerald-50 p-2 text-xs text-emerald-700">Potential savings $138.70/mo • Rank 1 • Low effort</div>
          </div>
        </div>
      </div>
    </section>
  );
}
