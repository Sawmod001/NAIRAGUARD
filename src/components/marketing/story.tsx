/**
 * Storytelling — NG-903 Communicates: visibility, waste, optimization, Naira, evidence, Demo, future AWS
 */

export function Story() {
  return (
    <section className="mx-auto max-w-6xl space-y-16 px-6 py-16">
      <div className="grid gap-8 md:grid-cols-3">
        <div className="rounded-xl border border-zinc-200 p-6">
          <div className="text-xs uppercase tracking-widest text-zinc-500">01 • Visibility</div>
          <h3 className="mt-2 text-lg font-semibold">See spend, not just a bill</h3>
          <p className="mt-2 text-sm text-zinc-600">Current period, trend, service breakdown, freshness — from provider, not guesses.</p>
        </div>
        <div className="rounded-xl border border-zinc-200 p-6">
          <div className="text-xs uppercase tracking-widest text-zinc-500">02 • Waste</div>
          <h3 className="mt-2 text-lg font-semibold">Invisible waste → visible</h3>
          <p className="mt-2 text-sm text-zinc-600">Rightsizing, idle, storage — credible opportunities with savings, effort, risk.</p>
        </div>
        <div className="rounded-xl border border-zinc-200 p-6">
          <div className="text-xs uppercase tracking-widest text-zinc-500">03 • Naira</div>
          <h3 className="mt-2 text-lg font-semibold">Naira-aware, not dollar-blind</h3>
          <p className="mt-2 text-sm text-zinc-600">USD truth + estimated NGN at explicit rate/timestamp — never exact bank charge.</p>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="rounded-xl bg-zinc-900 p-6 text-white">
          <div className="text-xs uppercase tracking-widest text-zinc-400">Evidence-based</div>
          <h3 className="mt-2 text-lg font-semibold">Source + utilization, not AI math</h3>
          <p className="mt-2 text-sm text-zinc-300">Each recommendation shows provider source, resource config, cost/savings, utilization lookback — AI explains, never invents.</p>
        </div>
        <div className="rounded-xl border border-zinc-200 p-6">
          <div className="text-xs uppercase tracking-widest text-zinc-500">Demo → Live AWS</div>
          <h3 className="mt-2 text-lg font-semibold">Demo today, AWS tomorrow</h3>
          <p className="mt-2 text-sm text-zinc-600">5 scenarios (balanced, waste-heavy, ec2-heavy, storage, FX pressure). Same domain contracts will consume Cost Explorer + Optimization Hub later — no rewrite.</p>
          <a href="/sign-up" className="mt-4 inline-block rounded-md bg-black px-4 py-2 text-sm font-medium text-white">Enter Demo Mode →</a>
        </div>
      </div>
    </section>
  );
}
