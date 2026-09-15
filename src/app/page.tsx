export default function Home() {
  return (
    <main className="min-h-screen bg-white text-zinc-900">
      {/* NG-001 placeholder — not final homepage (NG-901..905).
          Keeps NG-001 scope minimal: proves App Router boots. */}
      <div className="mx-auto max-w-5xl px-6 py-16">
        <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-medium tracking-wide text-zinc-600">
          <span className="h-2 w-2 rounded-full bg-[var(--accent)]" />
          Demo Mode — synthetic AWS FinOps data
        </div>

        <h1 className="mt-6 text-4xl font-semibold tracking-tight sm:text-5xl">
          NairaGuard
        </h1>
        <p className="mt-3 max-w-2xl text-lg leading-7 text-zinc-600">
          Naira-aware AWS FinOps intelligence. Understand spend, surface credible waste, and
          translate potential savings into{" "}
          <span className="font-medium text-zinc-900">estimated Naira impact</span>.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-zinc-200 p-5">
            <div className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
              Architecture
            </div>
            <div className="mt-2 text-sm leading-6 text-zinc-700">
              Presentation → Application → Domain → Infrastructure. Provider abstractions keep
              Demo and Live AWS interchangeable.
            </div>
          </div>
          <div className="rounded-xl border border-zinc-200 p-5">
            <div className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
              Foundation
            </div>
            <div className="mt-2 text-sm leading-6 text-zinc-700">
              NG-001 initialized: Next.js App Router, TypeScript strict, Tailwind, lint/typecheck.
              No auth, no DB, no providers — by design.
            </div>
          </div>
          <div className="rounded-xl border border-zinc-200 p-5">
            <div className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
              Next
            </div>
            <div className="mt-2 text-sm leading-6 text-zinc-700">
              NG-002 → architecture skeleton. Then env/config, Prisma, and provider contracts.
            </div>
          </div>
        </div>

        <div className="mt-10 rounded-xl bg-zinc-900 px-6 py-4 text-sm text-zinc-100">
          <span className="font-mono text-xs uppercase tracking-widest text-zinc-400">
            Local
          </span>
          <div className="mt-1 font-mono">http://localhost:3000</div>
          <div className="mt-1 text-xs text-zinc-400">
            Financial truth = provider data + deterministic calculations. AI explains, never invents.
          </div>
        </div>
      </div>
    </main>
  );
}
