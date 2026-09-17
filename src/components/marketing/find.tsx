export function Find() {
  return (
    <section className="bg-orange-500 text-black">
      <div className="mx-auto max-w-[1280px] px-6 py-16">
        <div className="font-mono text-xs tracking-[0.2em] text-black/60">02 / FIND</div>
        <h2 className="font-display mt-2 text-3xl font-semibold tracking-tight">The expensive resource is not always the biggest resource.</h2>
        <p className="mt-2 max-w-2xl text-sm text-black/70">Surfaces rightsizing, idle, storage waste — with estimated savings, effort, risk, not guarantees.</p>
        <div className="mt-8 grid gap-6 md:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-xl bg-black p-6 text-white">
            <div className="font-mono text-xs tracking-widest text-zinc-400">EC2 • UNDERUTILIZED</div>
            <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-xs text-zinc-400">Current est. monthly cost</div>
                <div className="font-semibold">$286.40</div>
              </div>
              <div>
                <div className="text-xs text-orange-400">Est. monthly savings</div>
                <div className="font-semibold text-orange-400">$118.70</div>
              </div>
            </div>
            <div className="mt-3 text-xs">Implementation effort <span className="font-semibold">LOW</span> • Restart <span className="font-semibold">YES</span> • Potential saving <span className="font-semibold">41.4%</span></div>
            <div className="mt-4 rounded bg-zinc-800 px-3 py-2 font-mono text-xs">m6i.2xlarge → m6i.xlarge</div>
          </div>
          <div className="grid gap-4 text-sm">
            <div className="rounded-xl border border-black/10 bg-white p-5">Rightsizing • Idle • Storage • Commitment — evidence from Cost Optimization Hub / Compute Optimizer</div>
            <div className="rounded-xl border border-black/10 bg-white p-5">Effort Low • Medium • High • Restart required • Rollback possible • Deterministic</div>
            <a href="/onboarding" className="rounded-full bg-black px-5 py-3 text-center text-sm font-medium text-white hover:bg-zinc-900">Inspect an opportunity</a>
          </div>
        </div>
      </div>
    </section>
  );
}
