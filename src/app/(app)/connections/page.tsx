import Link from "next/link";

export default function ConnectionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Connections</h1>
        <p className="text-sm text-zinc-500">Manage data sources for this workspace.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-stone-200 bg-white p-6">
          <div className="font-mono text-xs tracking-widest text-stone-500">AWS CONNECTION</div>
          <div className="mt-2 flex items-center gap-2 text-sm font-medium"><span className="h-2 w-2 rounded-full bg-amber-500" aria-hidden /> Not connected</div>
          <div className="mt-1 text-sm leading-6 text-stone-600">Connect an AWS account to analyze live costs. NairaGuard uses read-only, least-privilege access via IAM Role + STS — no long-lived keys stored.</div>
          <div className="mt-4 rounded-xl bg-stone-50 p-3 text-xs leading-5 text-stone-600">Required (future): Cost Explorer, Cost Optimization Hub, Compute Optimizer read access. Data is cached — not re-fetched on every page.</div>
          <button disabled className="mt-4 rounded-full bg-zinc-900 px-5 py-2 text-sm font-medium text-white opacity-60">Connect AWS — coming soon</button>
        </div>
        <div className="rounded-2xl border border-stone-200 bg-white p-6">
          <div className="font-mono text-xs tracking-widest text-stone-500">DEMO ENVIRONMENT</div>
          <div className="mt-2 text-sm font-medium">Currently active · Balanced Startup</div>
          <div className="text-sm text-stone-600">Synthetic AWS environment · No live AWS access · ~$1,378 · 2 opportunities · NGN estimates at recorded rate</div>
          <Link href="/dashboard?scenario=balanced-startup" className="mt-4 inline-flex rounded-full border border-stone-200 bg-white px-5 py-2 text-sm hover:bg-zinc-50">
            Change scenario in Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
