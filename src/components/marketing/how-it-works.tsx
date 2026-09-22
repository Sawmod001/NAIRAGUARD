export function HowItWorks() {
  const steps = [
    { n: "01", title: "CONNECT", desc: "Bring AWS cost & recommendation data. Explore first with a guided dataset.", color: "bg-white text-black" },
    { n: "02", title: "NORMALIZE", desc: "Provider data → consistent model. Costs & recs comparable.", color: "bg-zinc-900 text-white" },
    { n: "03", title: "CALCULATE", desc: "Deterministic: totals, %, aggregates, NGN. No LLM math.", color: "bg-orange-500 text-black" },
    { n: "04", title: "UNDERSTAND", desc: "USD truth plus NGN estimates, freshness, and next steps — the business context.", color: "bg-black text-white" },
  ];
  return (
    <section id="how" className="bg-white">
      <div className="mx-auto max-w-[1280px] px-6 py-16">
        <div className="font-mono text-xs tracking-[0.2em] text-zinc-500">HOW NAIRAGUARD WORKS</div>
        <h2 className="font-display mt-2 text-3xl font-semibold tracking-tight">From cloud data to a decision you can act on.</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-4">
          {steps.map((s) => (
            <div key={s.n} className={`rounded-xl border border-zinc-200 p-6 ${s.color}`}>
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
