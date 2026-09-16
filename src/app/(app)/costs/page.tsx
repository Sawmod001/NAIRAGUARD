import { auth } from "@/auth";
import { prisma } from "@/lib/prisma/client";
import { DemoCostProvider } from "@/infrastructure/providers/demo/cost-provider";
import { normalizeCostResult } from "@/domain/costs/normalize";
import { toNairaEquivalent } from "@/domain/fx";
import { getDemoDataset } from "@/infrastructure/providers/demo/registry";
import Link from "next/link";

export default async function CostsPage({ searchParams }: { searchParams: Promise<{ period?: string }> }) {
  const session = await auth();
  const userId = (session?.user as unknown as { id?: string })?.id;
  if (!userId) return <div>Unauthorized</div>;
  const membership = await prisma.membership.findFirst({ where: { userId } });
  if (!membership) return <div>No organization</div>;

  const sp = await searchParams;
  const period = sp.period === "7" ? 7 : sp.period === "90" ? 90 : 30;
  const scenarioId = "balanced-startup";
  const dataset = getDemoDataset(scenarioId);
  const provider = new DemoCostProvider(scenarioId);
  const raw = await provider.getCosts({ organizationId: membership.organizationId, periodDays: period });
  const cost = normalizeCostResult(raw);
  const fx = { rate: dataset.fx.usdNgn, observedAt: dataset.fx.observedAt, source: dataset.fx.provider };
  const naira = toNairaEquivalent(cost.total, fx);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Costs</h1>
          <p className="text-sm text-zinc-600">Detailed cost analysis • {period} days • {cost.source}</p>
        </div>
        <div className="flex gap-1 rounded-lg border border-zinc-200 p-1">
          {[7, 30, 90].map((d) => (
            <Link key={d} href={`/costs?period=${d}`} className={`rounded-md px-3 py-1 text-sm ${period === d ? "bg-zinc-900 text-white" : "hover:bg-zinc-100"}`}>
              {d}d
            </Link>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <div className="text-xs uppercase tracking-widest text-zinc-500">Total spend</div>
          <div className="mt-2 text-2xl font-semibold">${cost.total.toLocaleString()} <span className="text-xs text-zinc-500">{cost.currency}</span></div>
          <div className="text-xs text-zinc-500">Freshness {new Date(cost.observedAt).toLocaleDateString()}</div>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <div className="text-xs uppercase tracking-widest text-zinc-500">Estimated Naira</div>
          <div className="mt-2 text-lg font-semibold">₦{naira.naira.toLocaleString()}</div>
          <div className="text-xs text-zinc-500">at ₦{naira.rate.toLocaleString()}/USD • {naira.source}</div>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <div className="text-xs uppercase tracking-widest text-zinc-500">Period</div>
          <div className="mt-2 text-sm">{cost.daily.length} days • Trend from {cost.daily[0]?.date} to {cost.daily[cost.daily.length - 1]?.date}</div>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-5">
        <div className="text-xs uppercase tracking-widest text-zinc-500">Service breakdown</div>
        <div className="mt-3 space-y-2">
          {cost.services
            .sort((a, b) => b.amount - a.amount)
            .map((s) => (
              <div key={s.service} className="flex justify-between border-b border-zinc-100 py-2 text-sm">
                <span>{s.service}</span>
                <span className="font-medium">${s.amount.toFixed(2)} • {s.percentage.toFixed(1)}%</span>
              </div>
            ))}
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-5">
        <div className="text-xs uppercase tracking-widest text-zinc-500">Trend (daily)</div>
        <div className="mt-4 flex h-32 items-end gap-[2px]">
          {cost.daily.map((d) => {
            const max = Math.max(...cost.daily.map((x) => x.amount));
            const h = max ? (d.amount / max) * 100 : 0;
            return <div key={d.date} className="flex-1 rounded-t bg-zinc-900" style={{ height: `${h}%` }} title={`${d.date} $${d.amount}`} />;
          })}
        </div>
      </div>
    </div>
  );
}
