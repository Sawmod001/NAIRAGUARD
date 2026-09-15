import { auth } from "@/auth";
import { SpendOverview } from "@/components/dashboard/spend-overview";
import { CostTrend } from "@/components/dashboard/cost-trend";

export default async function DashboardPage() {
  const session = await auth();
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-zinc-600">
            Protected shell • <span className="font-medium text-black">{session?.user?.email}</span> • Demo Mode synthetic
          </p>
        </div>
        <div className="text-xs text-zinc-500">NG-401 shell — responsive, no experimental visuals</div>
      </div>

      {/* Top metrics — NG-402 spend overview wired */}
      <div className="grid gap-4 md:grid-cols-3">
        <SpendOverview />
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <div className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Potential savings</div>
          <div className="mt-2 h-4 w-24 rounded bg-zinc-100" />
          <div className="mt-1 text-xs text-zinc-500">NG-406 will populate</div>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <div className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Top optimization</div>
          <div className="mt-2 h-4 w-32 rounded bg-zinc-100" />
          <div className="mt-1 text-xs text-zinc-500">NG-406 will populate</div>
        </div>
      </div>

      {/* Middle: trend + drivers — NG-404 trend wired, drivers shell */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CostTrend />
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <div className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Top drivers</div>
          <div className="mt-4 space-y-2">
            <div className="h-3 rounded bg-zinc-100" />
            <div className="h-3 rounded bg-zinc-100" />
            <div className="h-3 rounded bg-zinc-100" />
          </div>
          <div className="mt-2 text-xs text-zinc-500">NG-405</div>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-5">
        <div className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Optimization highlights</div>
        <div className="mt-3 rounded-md border border-dashed border-zinc-300 bg-zinc-50 p-4 text-sm text-zinc-600">
          Shell placeholder — 3 high-value opportunities will appear here (NG-406).
        </div>
      </div>
    </div>
  );
}
