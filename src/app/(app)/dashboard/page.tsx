import { auth } from "@/auth";
import { prisma } from "@/lib/prisma/client";
import { DemoCostProvider } from "@/infrastructure/providers/demo/cost-provider";
import { DemoOptimizationProvider } from "@/infrastructure/providers/demo/optimization-provider";
import { normalizeCostResult } from "@/domain/costs/normalize";
import { toNairaEquivalent } from "@/domain/fx";
import { aggregateSavings } from "@/domain/finops";
import { prioritizeRecommendations } from "@/domain/optimizations";
import { getDemoDataset } from "@/infrastructure/providers/demo/registry";
import Link from "next/link";

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ scenario?: string; period?: string }> }) {
  const session = await auth();
  const userId = (session?.user as unknown as { id?: string })?.id;
  const membership = userId ? await prisma.membership.findFirst({ where: { userId }, include: { organization: true } }) : null;
  const scenarioId = (await searchParams).scenario ?? "balanced-startup";
  const period = (await searchParams).period === "7" ? 7 : 30;
  const dataset = getDemoDataset(scenarioId);
  const costProvider = new DemoCostProvider(scenarioId);
  const optProvider = new DemoOptimizationProvider(scenarioId);
  const orgId = membership?.organizationId ?? "demo";
  const rawCost = await costProvider.getCosts({ organizationId: orgId, periodDays: period });
  const cost = normalizeCostResult(rawCost);
  const recs = await optProvider.getRecommendations({ organizationId: orgId });
  const prioritized = prioritizeRecommendations(recs);
  const fx = { rate: dataset.fx.usdNgn, observedAt: dataset.fx.observedAt, source: dataset.fx.provider };
  const totalNgn = toNairaEquivalent(cost.total, fx);
  const savingsAgg = aggregateSavings(recs);
  const savingsNgn = toNairaEquivalent(savingsAgg.totalSavingsUsd, fx);
  const topServices = [...cost.services].sort((a, b) => b.amount - a.amount).slice(0, 6);

  const name = session?.user?.name ?? session?.user?.email?.split("@")[0] ?? "there";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-zinc-500">Good morning, {name}. Here&apos;s what&apos;s happening across your AWS environment.</p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="rounded-full bg-zinc-900 px-3 py-1.5 text-white">Demo • {dataset.scenario.name}</span>
          <span className="rounded-full border border-zinc-200 bg-white px-3 py-1.5">Last {period} days</span>
          <Link href="/costs" className="rounded-full border border-zinc-200 px-3 py-1.5 hover:bg-zinc-50">View costs</Link>
        </div>
      </div>

      {/* Metrics 4 */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <div className="font-mono text-xs tracking-widest text-zinc-500">TOTAL AWS SPEND</div>
          <div className="mt-2 text-2xl font-semibold">${cost.total.toLocaleString()}</div>
          <div className="text-xs text-zinc-500">{period} days • {cost.source}</div>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <div className="font-mono text-xs tracking-widest text-zinc-500">EST. NAIRA EQUIVALENT</div>
          <div className="mt-2 text-2xl font-semibold">₦{totalNgn.naira.toLocaleString()}</div>
          <div className="text-xs text-zinc-500">at ₦{fx.rate.toLocaleString()}/USD • {new Date(fx.observedAt).toLocaleDateString()}</div>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <div className="font-mono text-xs tracking-widest text-zinc-500">POTENTIAL SAVINGS</div>
          <div className="mt-2 text-2xl font-semibold text-emerald-600">${savingsAgg.totalSavingsUsd.toFixed(2)}/mo</div>
          <div className="text-xs text-zinc-500">₦{savingsNgn.naira.toLocaleString()}/mo est.</div>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <div className="font-mono text-xs tracking-widest text-zinc-500">OPPORTUNITIES</div>
          <div className="mt-2 text-2xl font-semibold">{recs.length}</div>
          <div className="text-xs text-zinc-500">{prioritized.filter((r) => r.effort === "Low").length} low effort</div>
        </div>
      </div>

      {/* Trend + Distribution */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-zinc-200 bg-white p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div className="font-mono text-xs tracking-widest text-zinc-500">AWS SPEND • DAILY</div>
            <div className="text-xs text-zinc-500">Daily over {period} days</div>
          </div>
          <div className="mt-4 flex h-32 items-end gap-[2px]">
            {cost.daily.map((d) => {
              const max = Math.max(...cost.daily.map((x) => x.amount));
              const h = max ? (d.amount / max) * 100 : 0;
              return <div key={d.date} className="flex-1 rounded-t bg-zinc-900" style={{ height: `${h}%` }} title={`${d.date} $${d.amount}`} />;
            })}
          </div>
          <div className="mt-2 flex justify-between text-xs text-zinc-500">
            <span>{cost.daily[0]?.date}</span>
            <span>{cost.daily[cost.daily.length - 1]?.date}</span>
          </div>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <div className="font-mono text-xs tracking-widest text-zinc-500">COST DISTRIBUTION</div>
          <div className="mt-3">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-left font-mono text-xs tracking-widest text-zinc-500">
                  <th className="py-2 font-medium">SERVICE</th>
                  <th className="py-2 text-right font-medium">SPEND</th>
                  <th className="py-2 text-right font-medium">SHARE</th>
                </tr>
              </thead>
              <tbody>
                {topServices.map((s) => (
                  <tr key={s.service} className="border-b border-zinc-100 last:border-0">
                    <td className="py-2 truncate pr-2">{s.service.replace("Amazon ", "").replace("AWS ", "")}</td>
                    <td className="py-2 text-right font-mono">${s.amount.toFixed(2)}</td>
                    <td className="py-2 text-right text-zinc-500">{s.percentage.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Link href="/costs" className="mt-3 inline-block text-xs font-medium hover:underline">View breakdown →</Link>
        </div>
      </div>

      {/* Attention + Activity */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-zinc-200 bg-white p-5 lg:col-span-2">
          <div className="font-mono text-xs tracking-widest text-zinc-500">ATTENTION NEEDED</div>
          <div className="mt-3 space-y-3">
            {prioritized.slice(0, 2).map((r) => (
              <Link key={r.externalId} href={`/optimizations/${r.externalId}`} className="flex items-center justify-between rounded-lg border border-zinc-200 p-4 hover:bg-zinc-50">
                <div>
                  <div className="text-sm font-medium">{r.resourceId} • {r.resourceType}</div>
                  <div className="text-xs text-zinc-500">{r.actionType} • {r.effort} effort • {r.restartRequired ? "restart" : "no restart"}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-emerald-600">${r.estimatedMonthlySavingsUsd.toFixed(2)}/mo</div>
                  <div className="text-xs text-zinc-500">→ Review</div>
                </div>
              </Link>
            ))}
            {prioritized.length === 0 && <div className="text-sm text-zinc-500">No opportunities</div>}
          </div>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <div className="font-mono text-xs tracking-widest text-zinc-500">RECENT ACTIVITY</div>
          <div className="mt-3 space-y-3 text-sm">
            <div className="flex gap-3">
              <div className="h-2 w-2 rounded-full bg-emerald-500 mt-1.5" />
              <div>
                <div>Cost data refreshed</div>
                <div className="text-xs text-zinc-500">2h ago • 30 days processed</div>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="h-2 w-2 rounded-full bg-orange-500 mt-1.5" />
              <div>
                <div>Optimization identified</div>
                <div className="text-xs text-zinc-500">Yesterday • {recs[0]?.resourceId ?? "—"}</div>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="h-2 w-2 rounded-full bg-zinc-400 mt-1.5" />
              <div>
                <div>FX rate recorded</div>
                <div className="text-xs text-zinc-500">{new Date(fx.observedAt).toLocaleDateString()} • ₦{fx.rate}/USD</div>
              </div>
            </div>
          </div>
          <Link href="/activity" className="mt-3 inline-block text-xs font-medium hover:underline">View all activity →</Link>
        </div>
      </div>

      <div className="rounded-md border border-zinc-200 bg-zinc-50 px-4 py-3 text-xs text-zinc-600">
        Demo environment • Data updated today • FX ₦{fx.rate}/USD • NGN values are estimates — not bank charges.
      </div>
    </div>
  );
}
