import Link from "next/link";

export default function OnboardingPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fafaf8] px-6 py-16">
      <div className="w-full max-w-2xl rounded-[20px] border border-zinc-200 bg-white p-8 shadow-sm">
        <div className="font-mono text-xs tracking-[0.18em] text-zinc-500">WELCOME TO NAIRAGUARD</div>
        <h1 className="font-display mt-3 text-[32px] font-semibold leading-none tracking-[-0.03em]">Understand where your<br />AWS spend goes.</h1>
        <p className="mt-3 max-w-xl text-[14px] leading-6 text-zinc-600">See costs clearly. Find optimization opportunities. Understand what cloud spend means in estimated naira — before you connect a live AWS account.</p>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <Link href="/connections" className="group rounded-2xl border border-zinc-200 bg-white p-6 transition hover:border-zinc-300 hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900">
            <div className="font-mono text-xs tracking-widest text-zinc-500">01 — LIVE</div>
            <div className="mt-2 font-semibold">Connect AWS</div>
            <div className="mt-1 text-sm leading-5 text-zinc-600">Read-only via IAM Role + STS. No long-lived keys. When ready, verify and sync.</div>
            <div className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-zinc-900 group-hover:gap-2">Learn how it will work <span aria-hidden>→</span></div>
          </Link>
          <Link href="/dashboard" className="group rounded-2xl bg-[#0a0a0a] p-6 text-white transition hover:bg-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900">
            <div className="font-mono text-xs tracking-widest text-zinc-400">02 — DEMO</div>
            <div className="mt-2 font-semibold">Explore Demo</div>
            <div className="mt-1 text-sm leading-5 text-zinc-400">Balanced Startup • ~$1,378 / 30d • 2 opportunities • No AWS account needed</div>
            <div className="mt-4 inline-flex items-center gap-1 text-sm font-medium group-hover:gap-2">Enter Demo <span aria-hidden>→</span></div>
            <div className="mt-3 text-xs text-zinc-500">You can switch scenarios inside the workspace. NGN = estimate.</div>
          </Link>
        </div>
        <div className="mt-6 flex items-center justify-between text-xs text-zinc-500">
          <span>Demo data is synthetic and clearly labeled.</span>
          <a href="/dashboard?skipOnboarding=1" className="rounded-full border border-zinc-200 px-3 py-1 hover:bg-zinc-50">Skip → Dashboard</a>
        </div>
      </div>
    </main>
  );
}
