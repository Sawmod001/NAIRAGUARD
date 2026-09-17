import Link from "next/link";

export default function ConnectionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Connections</h1>
        <p className="text-sm text-zinc-500">Manage data sources for this workspace.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-zinc-200 bg-white p-6">
          <div className="font-mono text-xs tracking-widest text-zinc-500">AWS</div>
          <div className="mt-2 text-sm font-medium">Not connected</div>
          <div className="text-sm text-zinc-600">Connect an AWS account to analyze live cloud costs and optimization opportunities.</div>
          <div className="mt-4 rounded-md bg-zinc-50 p-3 text-xs text-zinc-600">NairaGuard needs read access to Cost Explorer and optimization data. Access is read-only where possible, via IAM Role + STS.</div>
          <button className="mt-4 rounded-full bg-black px-5 py-2 text-sm font-medium text-white">Connect AWS</button>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-6">
          <div className="font-mono text-xs tracking-widest text-zinc-500">DEMO ENVIRONMENT</div>
          <div className="mt-2 text-sm font-medium">Currently active • Balanced Startup</div>
          <div className="text-sm text-zinc-600">Synthetic AWS environment • No live AWS access • $1,378 • 3 opportunities</div>
          <Link href="/dashboard?scenario=balanced-startup" className="mt-4 inline-block rounded-full border border-zinc-200 px-5 py-2 text-sm hover:bg-zinc-50">
            Change scenario
          </Link>
        </div>
      </div>
    </div>
  );
}
