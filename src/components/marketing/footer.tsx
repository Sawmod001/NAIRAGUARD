export function Footer() {
  return (
    <footer className="bg-black text-zinc-400">
      <div className="mx-auto max-w-[1280px] px-6 py-10">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <div className="font-display font-semibold text-white">NairaGuard</div>
            <div className="text-xs">AWS FinOps, built with Naira in mind.</div>
            <a href="/onboarding" className="mt-2 block font-mono text-xs hover:text-white">Try Demo →</a>
          </div>
          <div>
            <div className="font-mono text-xs tracking-widest text-zinc-500">PRODUCT</div>
            <div className="mt-2 space-y-1 text-sm">
              <a href="/dashboard" className="block hover:text-white">Dashboard</a>
              <a href="/costs" className="block hover:text-white">Costs</a>
              <a href="/optimizations" className="block hover:text-white">Optimizations</a>
              <a href="/onboarding" className="block hover:text-white">Try Demo</a>
            </div>
          </div>
          <div>
            <div className="font-mono text-xs tracking-widest text-zinc-500">LEGAL</div>
            <div className="mt-2 space-y-1 text-sm">
              <a href="/privacy" className="block hover:text-white">Privacy</a>
              <a href="/terms" className="block hover:text-white">Terms</a>
            </div>
          </div>
          <div className="font-mono text-xs">© 2026 NairaGuard • Naira estimates, not bank charges</div>
        </div>
      </div>
    </footer>
  );
}
