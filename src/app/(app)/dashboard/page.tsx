import { auth } from "@/auth";

export default async function DashboardPage() {
  const session = await auth();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Protected shell • Signed in as <span className="font-medium text-black">{session?.user?.email}</span>
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <div className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Total spend</div>
          <div className="mt-2 text-sm text-zinc-500">Shell only — NG-301+ will populate</div>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <div className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Potential savings</div>
          <div className="mt-2 text-sm text-zinc-500">Shell only — NG-401+ will populate</div>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <div className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Naira impact</div>
          <div className="mt-2 text-sm text-zinc-500">FX engine in NG-501+</div>
        </div>
      </div>

      <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-6 text-sm text-zinc-600">
        App shell verified — navigation: <span className="font-medium">Dashboard | Costs | Optimizations | Settings</span>. Content is placeholder until FinOps engine lands.
      </div>
    </div>
  );
}
