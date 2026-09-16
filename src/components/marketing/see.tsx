export function See() {
  return (
    <section id="product" className="bg-zinc-50">
      <div className="mx-auto max-w-[1280px] px-6 py-16">
        <div className="font-mono text-xs tracking-[0.2em] text-zinc-500">01 / SEE</div>
        <h2 className="font-display mt-2 text-3xl font-semibold tracking-tight">Know what your cloud bill is actually doing.</h2>
        <p className="mt-2 max-w-2xl text-sm text-zinc-600">NairaGuard turns cost data into a clearer view — across services, regions, trends, and drivers. What is driving the bill? Which services deserve attention?</p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-zinc-200 bg-white p-5">
            <div className="font-mono text-xs tracking-widest text-zinc-500">CURRENT SPEND</div>
            <div className="mt-2 font-display text-2xl font-semibold">$1,378.16</div>
            <div className="text-xs text-zinc-500">30 days • EC2 $578.83 • RDS $248.07</div>
            <div className="mt-3 h-16 rounded bg-zinc-50 p-2"><div className="flex h-full items-end gap-[2px]">{[43,46,44,47,45,48].map((v,i)=><div key={i} className="flex-1 rounded-t bg-black" style={{height:`${v}%`}}/>)}</div></div>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-5">
            <div className="font-mono text-xs tracking-widest text-zinc-500">TOP SERVICES</div>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between"><span>EC2</span><span>42%</span></div>
              <div className="flex justify-between"><span>RDS</span><span>18%</span></div>
              <div className="flex justify-between"><span>EBS</span><span>12%</span></div>
            </div>
            <div className="mt-3 font-mono text-xs text-zinc-500">Freshness: 2026-09-15 • demo-fixture</div>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-5">
            <div className="font-mono text-xs tracking-widest text-zinc-500">REGIONAL</div>
            <div className="mt-3 text-sm">eu-west-1 52% • us-east-1 30% • ap-southeast 18%</div>
            <div className="mt-3 rounded bg-black p-3 font-mono text-xs text-white">Period comparison: +8.7% vs previous</div>
          </div>
        </div>
      </div>
    </section>
  );
}
