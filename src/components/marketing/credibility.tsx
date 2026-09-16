export function Credibility() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-[1280px] px-6 py-16">
        <div className="font-mono text-xs tracking-[0.2em] text-zinc-500">BUILT FOR ENGINEERING TEAMS</div>
        <h2 className="font-display mt-2 text-3xl font-semibold tracking-tight">Clear numbers. Traceable recommendations. No magic savings.</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-4">
          <div className="border-l-2 border-black pl-4"><div className="font-semibold text-sm">Provider evidence</div><div className="text-sm text-zinc-600">Findings from Cost Optimization Hub / Compute Optimizer</div></div>
          <div className="border-l-2 border-orange-500 pl-4"><div className="font-semibold text-sm">Deterministic</div><div className="text-sm text-zinc-600">Totals, %, NGN via app logic — not LLM</div></div>
          <div className="border-l-2 border-zinc-300 pl-4"><div className="font-semibold text-sm">Explainable AI</div><div className="text-sm text-zinc-600">Summarizes evidence, never invents savings</div></div>
          <div className="border-l-2 border-zinc-800 pl-4"><div className="font-semibold text-sm">Security first</div><div className="text-sm text-zinc-600">Future: IAM Role + STS, no long-lived keys</div></div>
        </div>
      </div>
    </section>
  );
}
