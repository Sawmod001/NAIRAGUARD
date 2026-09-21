export function DemoSection() {
  return (
    <section id="tour" className="bg-black text-white">
      <div className="mx-auto max-w-[1280px] px-6 py-16">
        <div className="grid gap-8 md:grid-cols-[1.1fr_0.9fr]">
          <div>
            <div className="font-mono text-xs tracking-[0.2em] text-zinc-500">SEE THE WORKFLOW FIRST</div>
            <h2 className="font-display mt-2 text-3xl font-semibold tracking-tight">See the workflow before you connect an account.</h2>
            <p className="mt-2 text-sm text-zinc-400">Real app flow with AWS-style data — costs, waste, recommendations, Naira, explanation.</p>
            <div className="mt-6 flex gap-3">
              <a href="/onboarding" className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-black hover:bg-zinc-100">Try Demo</a>
              <a href="/sign-in" className="rounded-full border border-zinc-700 px-5 py-3 text-sm hover:bg-zinc-900">Sign in</a>
            </div>
            <div className="mt-3 font-mono text-xs tracking-widest text-zinc-500">Guided tour • Naira estimates shown</div>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
            <div className="font-mono text-xs tracking-widest text-zinc-500">EXAMPLE DATASETS • 5</div>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between rounded bg-white p-3 text-black"><span>Balanced Startup</span><span>$1,378</span></div>
              <div className="flex justify-between rounded bg-zinc-800 p-3"><span>Waste-heavy</span><span>$2,136 • 3 recs</span></div>
              <div className="flex justify-between rounded bg-zinc-800 p-3"><span>EC2-heavy</span><span>$3,070</span></div>
              <div className="flex justify-between rounded bg-zinc-800 p-3"><span>FX Pressure</span><span>₦ high</span></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
