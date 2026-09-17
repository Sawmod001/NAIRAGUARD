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

  const scenarioQs = scenarioId !== "balanced-startup" ? `?scenario=${scenarioId}` : "";
  const costsHref = `/costs${scenarioQs ? `${scenarioQs}&period=${period}` : `?period=${period}`}`;
  return (
    <div className="space-y-6">
      {/* Header — §11 */}
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-stone-500">Good morning, {name}. Here&apos;s what&apos;s happening across your AWS environment.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full bg-zinc-900 px-3 py-1.5 text-white">Demo · {dataset.scenario.name}</span>
          <span className="rounded-full border border-stone-200 bg-white px-3 py-1.5">Last {period} days</span>
          <Link href={costsHref} className="rounded-full border border-stone-200 bg-white px-3 py-1.5 hover:bg-zinc-50">View costs</Link>
        </div>
      </div>

      {/* Metrics — §12 with teaching layer */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-stone-200 bg-white p-5">
          <div className="font-mono text-xs tracking-widest text-stone-500">AWS SPEND</div>
          <div className="mt-2 text-2xl font-semibold tracking-tight">${cost.total.toLocaleString()}</div>
          <div className="text-xs text-stone-500">{period} days · {cost.currency} · {cost.source}</div>
          <details className="mt-2 text-xs text-stone-500"><summary className="cursor-pointer hover:text-stone-700">What this means</summary><span className="mt-1 block">Sum of daily spend from the provider over the selected period. This is the source truth.</span></details>
        </div>
        <div className="rounded-2xl border border-stone-200 bg-white p-5">
          <div className="font-mono text-xs tracking-widest text-stone-500">ESTIMATED NAIRA EQUIVALENT</div>
          <div className="mt-2 text-2xl font-semibold tracking-tight">₦{totalNgn.naira.toLocaleString()}</div>
          <div className="text-xs text-stone-500">at ₦{fx.rate.toLocaleString()}/USD · {new Date(fx.observedAt).toLocaleDateString()} · {fx.source}</div>
          <details className="mt-2 text-xs text-stone-500"><summary className="cursor-pointer hover:text-stone-700">How calculated</summary><span className="mt-1 block">${cost.total.toLocaleString()} × ₦{fx.rate.toLocaleString()} = ₦{totalNgn.naira.toLocaleString()}. Estimate — not a bank charge.</span></details>
        </div>
        <div className="rounded-2xl border border-stone-200 bg-white p-5">
          <div className="font-mono text-xs tracking-widest text-stone-500">POTENTIAL MONTHLY SAVINGS</div>
          <div className="mt-2 text-2xl font-semibold tracking-tight text-emerald-600">${savingsAgg.totalSavingsUsd.toFixed(2)}/mo</div>
          <div className="text-xs text-stone-500">₦{savingsNgn.naira.toLocaleString()}/mo est. · {recs.length} opportunities</div>
          <details className="mt-2 text-xs text-stone-500"><summary className="cursor-pointer hover:text-stone-700">What this means</summary><span className="mt-1 block">Estimated savings from the recommendations below. Not guaranteed — validate before implementation.</span></details>
        </div>
        <div className="rounded-2xl border border-stone-200 bg-white p-5">
          <div className="font-mono text-xs tracking-widest text-stone-500">OPTIMIZATION OPPORTUNITIES</div>
          <div className="mt-2 text-2xl font-semibold tracking-tight">{recs.length}</div>
          <div className="text-xs text-stone-500">{prioritized.filter((r) => r.effort === "Low").length} low effort · {prioritized.filter((r) => r.effort !== "Low").length} review</div>
          <details className="mt-2 text-xs text-stone-500"><summary className="cursor-pointer hover:text-stone-700">Why it matters</summary><span className="mt-1 block">Highest savings first. Low-effort items are fastest to validate.</span></details>
        </div>
      </div>

      {/* Trend + Distribution — §13-14 */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-stone-200 bg-white p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-mono text-xs tracking-widest text-stone-500">AWS SPEND OVER TIME</div>
              <div className="text-xs text-stone-500">Daily spend across the selected period · USD</div>
            </div>
            <div className="flex gap-1 rounded-lg border border-stone-200 p-1">
              {[7,30,90].map((d)=>(
                <Link key={d} href={`/dashboard?scenario=${scenarioId}&period=${d}`} className={`rounded-md px-3 py-1 text-xs ${period===d ? "bg-zinc-900 text-white" : "hover:bg-zinc-100"}`}>{d}D</Link>
              ))}
            </div>
          </div>
          <div className="mt-4 flex h-32 items-end gap-[2px]" role="img" aria-label={`Daily AWS spend over ${period} days, total $${cost.total.toLocaleString()}`}>
            {cost.daily.map((d) => {
              const max = Math.max(...cost.daily.map((x) => x.amount));
              const h = max ? (d.amount / max) * 100 : 0;
              return <div key={d.date} className="flex-1 rounded-t bg-zinc-900" style={{ height: `${h}%` }} title={`${d.date} $${d.amount.toFixed(2)}`} />;
            })}
          </div>
          <div className="mt-2 flex justify-between text-xs text-stone-500">
            <span>{cost.daily[0]?.date}</span>
            <span>{cost.daily[cost.daily.length - 1]?.date}</span>
          </div>
        </div>
        <div className="rounded-2xl border border-stone-200 bg-white p-5">
          <div className="font-mono text-xs tracking-widest text-stone-500">SERVICES DRIVING YOUR SPEND</div>
          <div className="mt-1 text-xs text-stone-500">Where the money is going</div>
          <div className="mt-3">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-200 text-left font-mono text-xs tracking-widest text-stone-500">
                  <th className="py-2 font-medium">SERVICE</th>
                  <th className="py-2 text-right font-medium">SPEND</th>
                  <th className="py-2 text-right font-medium">SHARE</th>
                </tr>
              </thead>
              <tbody>
                {topServices.map((s) => (
                  <tr key={s.service} className="border-b border-stone-100 last:border-0">
                    <td className="py-2 truncate pr-2">{s.service.replace("Amazon ", "").replace("AWS ", "")}</td>
                    <td className="py-2 text-right font-mono text-xs">${s.amount.toFixed(2)}</td>
                    <td className="py-2 text-right text-stone-500 text-xs">{s.percentage.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Link href={costsHref} className="mt-3 inline-block text-xs font-medium hover:underline">View full breakdown →</Link>
        </div>
      </div>

      {/* What needs attention — §15 */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-stone-200 bg-white p-5 lg:col-span-2">
          <div className="font-mono text-xs tracking-widest text-stone-500">WHAT NEEDS ATTENTION</div>
          <div className="mt-1 text-xs text-stone-500">Highest estimated savings first — review evidence before acting</div>
          <div className="mt-3 space-y-3">
            {prioritized.slice(0, 2).map((r) => (
              <Link key={r.externalId} href={`/optimizations/${r.externalId}${scenarioQs ? `?scenario=${scenarioId}` : ""}`} className="flex items-center justify-between rounded-xl border border-stone-200 p-4 hover:bg-zinc-50 focus-visible:ring-2 focus-visible:ring-zinc-900">
                <div>
                  <div className="text-sm font-medium">{r.resourceId} · {r.resourceType}</div>
                  <div className="text-xs text-stone-500">{r.actionType} · {r.effort} effort · {r.restartRequired ? "restart required" : "no restart"} · {r.rollbackPossible ? "rollback possible" : ""}</div>
                  <div className="mt-1 text-xs text-stone-600">Why: {r.actionType} — validate workload before resizing.</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-emerald-600">${r.estimatedMonthlySavingsUsd.toFixed(2)}/mo</div>
                  <div className="text-xs text-stone-500">→ Review</div>
                </div>
              </Link>
            ))}
            {prioritized.length === 0 && <div className="rounded-xl border border-dashed border-stone-300 p-6 text-sm text-stone-600">No optimization opportunities yet. When NairaGuard receives recommendation data, eligible opportunities will appear here.</div>}
          </div>
        </div>
        <div className="rounded-2xl border border-stone-200 bg-white p-5">
          <div className="font-mono text-xs tracking-widest text-stone-500">RECENT ACTIVITY</div>
          <div className="mt-3 space-y-3 text-sm">
            <div className="flex gap-3">
              <div className="h-2 w-2 rounded-full bg-emerald-500 mt-1.5" aria-hidden />
              <div>
                <div className="font-medium">Cost data refreshed</div>
                <div className="text-xs text-stone-500">2h ago · 30 days processed · {dataset.scenario.name}</div>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="h-2 w-2 rounded-full bg-[#ff3b30] mt-1.5" aria-hidden />
              <div>
                <div className="font-medium">Optimization identified</div>
                <div className="text-xs text-stone-500">Yesterday · {recs[0]?.resourceId ?? "—"} · ${recs[0]?.estimatedMonthlySavingsUsd.toFixed(2) ?? "—"}/mo</div>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="h-2 w-2 rounded-full bg-zinc-400 mt-1.5" aria-hidden />
              <div>
                <div className="font-medium">FX rate recorded</div>
                <div className="text-xs text-stone-500">{new Date(fx.observedAt).toLocaleDateString()} · ₦{fx.rate.toLocaleString()}/USD · {fx.source}</div>
              </div>
            </div>
          </div>
          <Link href="/activity" className="mt-3 inline-block text-xs font-medium hover:underline">View all activity →</Link>
        </div>
      </div>

      {/* What this means — §17 */}
      <div className="rounded-2xl border border-stone-200 bg-white p-6">
        <div className="font-mono text-xs tracking-widest text-stone-500">WHAT THIS MEANS</div>
        <div className="mt-3 grid gap-4 text-sm leading-6 text-stone-700 md:grid-cols-3">
          <div>Your spend is concentrated in <span className="font-medium text-stone-900">{topServices[0]?.service.replace("Amazon ","")} </span> and <span className="font-medium text-stone-900">{topServices[1]?.service.replace("Amazon ","")}</span> — together ~{((topServices[0]?.percentage ?? 0)+(topServices[1]?.percentage ?? 0)).toFixed(0)}% of the period.</div>
          <div>Largest opportunity is <span className="font-medium text-stone-900">{prioritized[0]?.resourceId ?? "—"}</span> at <span className="font-medium text-emerald-700">${prioritized[0]?.estimatedMonthlySavingsUsd.toFixed(2) ?? "—"}/mo</span>. Effort {prioritized[0]?.effort ?? "—"} · {prioritized[0]?.restartRequired ? "restart required" : "no restart"}.</div>
          <div>At ₦{fx.rate.toLocaleString()}/USD, that largest saving is about <span className="font-medium text-stone-900">₦{prioritized[0] ? Math.round(prioritized[0].estimatedMonthlySavingsUsd*fx.rate).toLocaleString() : "—"}/mo</span> estimated. <span className="text-stone-500">Not a bank charge.</span></div>
        </div>
      </div>

      <div className="rounded-xl border border-stone-200 bg-white px-4 py-3 text-xs leading-5 text-stone-600">
        <span className="font-mono tracking-widest text-stone-500">DEMO · {dataset.scenario.name} ·</span> Synthetic AWS data · Last sync today · FX ₦{fx.rate.toLocaleString()}/USD · <span className="font-medium">NGN values are estimates — not bank charges.</span> <Link href="/connections" className="underline hover:text-stone-900">How NairaGuard connects</Link>
      </div>
    </div>
  );
}
