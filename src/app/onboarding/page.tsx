import Link from "next/link";

export default function OnboardingPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-6 py-16">
      <div className="w-full max-w-2xl rounded-2xl border border-zinc-200 bg-white p-8">
        <div className="font-mono text-xs tracking-widest text-zinc-500">WELCOME TO NAIRAGUARD</div>
        <h1 className="font-display mt-2 text-3xl font-semibold tracking-tight">Understand where your AWS spend goes.</h1>
        <p className="mt-2 text-sm text-zinc-600">Find optimization opportunities. See what cloud costs mean in naira.</p>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <Link href="/connections" className="rounded-xl border border-zinc-200 p-6 hover:bg-zinc-50">
            <div className="font-semibold">Connect AWS</div>
            <div className="text-sm text-zinc-600">Read-only via IAM Role + STS. Coming soon — Demo is ready now.</div>
            <div className="mt-3 text-sm font-medium text-zinc-900">Connect AWS →</div>
          </Link>
          <Link href="/dashboard" className="rounded-xl bg-black p-6 text-white hover:bg-zinc-900">
            <div className="font-semibold">Explore Demo</div>
            <div className="text-sm text-zinc-400">Balanced Startup • $1,378 • 3 opportunities • No AWS account needed</div>
            <div className="mt-3 text-sm font-medium">Enter Demo →</div>
          </Link>
        </div>
      </div>
    </main>
  );
}
