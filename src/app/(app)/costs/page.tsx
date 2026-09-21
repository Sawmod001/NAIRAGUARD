import { auth } from "@/auth";
import { prisma } from "@/lib/prisma/client";
import { DemoCostProvider } from "@/infrastructure/providers/demo/cost-provider";
import { normalizeCostResult } from "@/domain/costs/normalize";
import type { DomainCost } from "@/domain/costs/types";
import { toNairaEquivalent } from "@/domain/fx";
import { getLatestFxSnapshot } from "@/lib/fx/snapshots";
import { getLatestCostSnapshot, snapshotToCostView } from "@/lib/costs/snapshots";
import { getDemoDataset } from "@/infrastructure/providers/demo/registry";
import Link from "next/link";
import { ServiceBreakdown } from "@/components/costs/service-breakdown";
import { RegionBreakdown } from "@/components/costs/region-breakdown";
import { PeriodComparison } from "@/components/costs/period-comparison";

export default async function CostsPage({ searchParams }: { searchParams: Promise<{ period?: string; scenario?: string }> }) {
  const session = await auth();
  const userId = (session?.user as unknown as { id?: string })?.id;
  if (!userId) return <div>Unauthorized</div>;
  const membership = await prisma.membership.findFirst({ where: { userId } });
  if (!membership) return <div>No organization</div>;

  const sp = await searchParams;
  const period = sp.period === "7" ? 7 : sp.period === "90" ? 90 : 30;
  const scenarioId = (sp.scenario as string) || "balanced-startup";
  const dataset = getDemoDataset(scenarioId);
  // NG-DASH-08: persisted snapshot first, provider fallback (same as dashboard).
  const persistedCosts = await getLatestCostSnapshot(membership.organizationId).catch(() => null);
  const persistedView = persistedCosts ? snapshotToCostView(persistedCosts, { organizationId: membership.organizationId, period }) : null;
  let cost: DomainCost;
  if (persistedView) {
    cost = persistedView;
  } else {
    const provider = new DemoCostProvider(scenarioId);
    const raw = await provider.getCosts({ organizationId: membership.organizationId, periodDays: period });
    cost = normalizeCostResult(raw);
  }
  const pinnedFx = await getLatestFxSnapshot(membership.organizationId).catch(() => null);
  const fx = pinnedFx
    ? { rate: pinnedFx.rate, observedAt: pinnedFx.retrievedAt, source: pinnedFx.provider }
    : { rate: dataset.fx.usdNgn, observedAt: dataset.fx.observedAt, source: dataset.fx.provider };
  const naira = toNairaEquivalent(cost.total, fx, pinnedFx?.id ?? null);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Costs</h1>
          <p className="text-sm text-stone-500">Analytical view — where cost is happening, by service and region. <span className="text-stone-400">{dataset.scenario.name}</span></p>
        </div>
        <div className="flex gap-1 rounded-lg border border-stone-200 bg-white p-1">
          {[7, 30, 90].map((d) => (
            <Link key={d} href={`/costs?period=${d}&scenario=${scenarioId}`} className={`rounded-md px-3 py-1 text-sm ${period === d ? "bg-zinc-900 text-white" : "hover:bg-zinc-100"}`}>
              {d}D
            </Link>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-stone-200 bg-white p-5">
          <div className="font-mono text-xs tracking-widest text-stone-500">TOTAL SPEND</div>
          <div className="mt-2 text-2xl font-semibold tracking-tight">${cost.total.toLocaleString()} <span className="text-xs font-normal text-stone-500">{cost.currency}</span></div>
          <div className="text-xs text-stone-500">Source {cost.source} · Synced {new Date(cost.observedAt).toLocaleDateString()}</div>
          <details className="mt-2 text-xs text-stone-500"><summary className="cursor-pointer">What this includes</summary><span className="mt-1 block">Aggregated daily cost over {cost.daily.length} days. Trend below shows distribution.</span></details>
        </div>
        <div className="rounded-2xl border border-stone-200 bg-white p-5">
          <div className="font-mono text-xs tracking-widest text-stone-500">ESTIMATED NAIRA</div>
          <div className="mt-2 text-xl font-semibold">₦{naira.naira.toLocaleString()}</div>
          <div className="text-xs text-stone-500">₦{naira.rate.toLocaleString()}/USD · {naira.source} · {new Date(fx.observedAt).toLocaleDateString()}</div>
          <div className="mt-1 text-xs text-stone-500">Estimate — not a bank charge.</div>
        </div>
        <div className="rounded-2xl border border-stone-200 bg-white p-5">
          <div className="font-mono text-xs tracking-widest text-stone-500">PERIOD & FRESHNESS</div>
          <div className="mt-2 text-sm leading-5">{cost.daily.length} days · {cost.daily[0]?.date} → {cost.daily[cost.daily.length - 1]?.date}</div>
          <div className="mt-1 text-xs text-stone-500">Click a service below to drill into its share.</div>
        </div>
      </div>

      <ServiceBreakdown services={cost.services} total={cost.total} scenarioId={scenarioId} />
      <RegionBreakdown regions={cost.regions} />
      <PeriodComparison periodDays={period} />

      <div className="rounded-2xl border border-stone-200 bg-white p-5">
        <div className="font-mono text-xs tracking-widest text-stone-500">DAILY TREND</div>
        <div className="text-xs text-stone-500">Bar height = daily spend relative to period max</div>
        <div className="mt-4 flex h-32 items-end gap-[2px]" role="img" aria-label={`Daily spend trend over ${period} days`}>
          {cost.daily.map((d) => {
            const max = Math.max(...cost.daily.map((x) => x.amount));
            const h = max ? (d.amount / max) * 100 : 0;
            return <div key={d.date} className="flex-1 rounded-t bg-zinc-900" style={{ height: `${h}%` }} title={`${d.date} $${d.amount.toFixed(2)}`} />;
          })}
        </div>
      </div>
    </div>
  );
}
