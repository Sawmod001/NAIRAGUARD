import { auth } from "@/auth";
import { prisma } from "@/lib/prisma/client";
import { DemoCostProvider } from "@/infrastructure/providers/demo/cost-provider";
import { DemoOptimizationProvider } from "@/infrastructure/providers/demo/optimization-provider";
import { normalizeCostResult } from "@/domain/costs/normalize";
import { displayFxSource, toNairaEquivalent } from "@/domain/fx";
import { getLatestFxSnapshot } from "@/lib/fx/snapshots";
import { maskAwsAccountId } from "@/schemas/demo";
import { aggregateSavings } from "@/domain/finops";
import { prioritizeRecommendations } from "@/domain/optimizations";
import { getDemoDataset } from "@/infrastructure/providers/demo/registry";
import { dashboardQuerySchema } from "@/schemas/query";
import { PanelErrorBoundary } from "@/components/ui/panel-error-boundary";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { CountUp } from "@/components/dashboard/count-up";
import { SpendChart } from "@/components/dashboard/spend-chart";
import Link from "next/link";

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ scenario?: string; period?: string }> }) {
  const session = await auth();
  const userId = (session?.user as unknown as { id?: string })?.id;
  const membership = userId ? await prisma.membership.findFirst({ where: { userId }, include: { organization: true } }) : null;
  const raw = dashboardQuerySchema.parse(await searchParams);
  const scenarioId = raw.scenario ?? "balanced-startup";
  const period = (raw.period === "7" ? 7 : raw.period === "90" ? 90 : 30) as 7 | 30 | 90;
  const dataset = getDemoDataset(scenarioId);
  const costProvider = new DemoCostProvider(scenarioId);
  const optProvider = new DemoOptimizationProvider(scenarioId);
  const orgId = membership?.organizationId ?? "demo";
  const rawCost = await costProvider.getCosts({ organizationId: orgId, periodDays: period });
  const cost = normalizeCostResult(rawCost);
  const recs = await optProvider.getRecommendations({ organizationId: orgId });
  const prioritized = prioritizeRecommendations(recs);
  // NG-FX-04: prefer the pinned workspace snapshot so NGN estimates trace to a row;
  // fall back to the dataset fixture for workspaces connected before seeding.
  const pinnedFx = membership ? await getLatestFxSnapshot(membership.organizationId).catch(() => null) : null;
  const fx = pinnedFx
    ? { rate: pinnedFx.rate, observedAt: pinnedFx.retrievedAt, source: pinnedFx.provider }
    : { rate: dataset.fx.usdNgn, observedAt: dataset.fx.observedAt, source: dataset.fx.provider };
  const fxSnapshotId = pinnedFx?.id ?? null;
  const totalNgn = toNairaEquivalent(cost.total, fx, fxSnapshotId);
  const savingsAgg = aggregateSavings(recs);
  const savingsNgn = toNairaEquivalent(savingsAgg.totalSavingsUsd, fx, fxSnapshotId);
  const topServices = [...cost.services].sort((a, b) => b.amount - a.amount).slice(0, 5);
  const name = session?.user?.name ?? session?.user?.email?.split("@")[0] ?? "there";
  const scenarioQs = scenarioId !== "balanced-startup" ? `?scenario=${scenarioId}` : "";
  const costsHref = `/costs${scenarioQs ? `${scenarioQs}&period=${period}` : `?period=${period}`}`;

  // SEE: previous period mock comparison (+4.2% vs previous)
  const prevDelta = period === 7 ? "+6.1%" : period === 90 ? "+2.4%" : "+4.2%";
  const fxAgeDays = Math.max(0, Math.floor((Date.now() - new Date(fx.observedAt).getTime()) / 86400000));
  const syncedAgo = "2 min ago"; // demo

  const panel = "rounded-[8px] border border-[#E7E5E2] bg-[#FFFFFF] p-5 md:p-6";

  return (
    <div className="space-y-6">
        {/* Top bar with sync timestamp (§6) */}
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="font-display text-[28px] font-semibold leading-none tracking-tight text-[#0E0E0F]">Dashboard</h1>
            <p className="mt-1 text-sm text-[#6B6B6E]">Good morning, {name}. Here&apos;s what&apos;s happening across your AWS environment.</p>
            <div className="mt-2 inline-flex items-center gap-2 text-xs text-[#6B6B6E]">
              <span className="h-2 w-2 rounded-full bg-[#E8622C]" aria-hidden /> Last synced {syncedAgo} · <span className="tabular-nums">{new Date().toLocaleDateString()}</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-full bg-[#0E0E0F] px-3 py-1.5 text-white">{dataset.scenario.name}</span>
            <span className="rounded-full border border-[#E7E5E2] bg-white px-3 py-1.5 text-[#6B6B6E]">Last {period} days</span>
            <Link href={costsHref} className="rounded-full border border-[#E7E5E2] bg-white px-3 py-1.5 text-[#0E0E0F] hover:bg-[#FAFAF9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8622C]">View costs</Link>
          </div>
        </div>

        {/* KPI row — hierarchy via position/size, not identical boxes */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <PanelErrorBoundary label="AWS SPEND">
            <Card>
              <CardTitle>AWS SPEND</CardTitle>
              <CardContent>
                <div className="mt-2 text-[30px] font-semibold leading-none tracking-tight text-[#0E0E0F] tabular-nums"><CountUp value={cost.total} prefix="$" /></div>
                <div className="mt-1 flex items-center gap-1 text-xs text-[#6B6B6E]"><span className="tabular-nums">{period} days · {cost.currency}</span><span className="inline-flex items-center gap-1 rounded bg-[#FCEBE3] px-1.5 py-0.5 text-[#E8622C]">↑ {prevDelta} vs previous</span></div>
                <details className="mt-2 text-xs text-[#6B6B6E]"><summary className="cursor-pointer text-[#E8622C] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8622C]">What this means</summary><span className="mt-1 block">Sum of daily spend from the provider — source truth for {period} days.</span></details>
              </CardContent>
            </Card>
          </PanelErrorBoundary>

          <PanelErrorBoundary label="ESTIMATED NAIRA">
            <Card>
              <CardTitle>ESTIMATED NAIRA EQUIVALENT</CardTitle>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 rounded-full border border-[#E7E5E2] px-2 py-0.5 text-[11px] text-[#6B6B6E]"><span className={`h-1.5 w-1.5 rounded-full ${fxAgeDays <= 2 ? "bg-emerald-500" : "bg-amber-500"}`} /> FX updated {fxAgeDays}d ago</span>
                </div>
                <div className="mt-2 text-[30px] font-semibold leading-none tracking-tight text-[#0E0E0F] tabular-nums"><CountUp value={totalNgn.naira} prefix="₦" /></div>
                <div className="text-xs text-[#6B6B6E]">at ₦{fx.rate.toLocaleString()}/USD · {new Date(fx.observedAt).toLocaleDateString()} · {displayFxSource(fx.source)}</div>
                <details className="mt-2 text-xs text-[#6B6B6E]"><summary className="cursor-pointer text-[#E8622C] hover:underline">How calculated</summary><span className="mt-1 block">${cost.total.toLocaleString()} × ₦{fx.rate.toLocaleString()} = ₦{totalNgn.naira.toLocaleString()} · Estimate, not a bank charge.</span></details>
              </CardContent>
            </Card>
          </PanelErrorBoundary>

          <PanelErrorBoundary label="POTENTIAL SAVINGS">
            <Card className="border-t-2 border-t-[#E8622C]">
              <CardTitle>POTENTIAL MONTHLY SAVINGS</CardTitle>
              <CardContent>
                <div className="mt-2 text-[30px] font-semibold leading-none tracking-tight text-[#E8622C] tabular-nums">${savingsAgg.totalSavingsUsd.toFixed(2)}/mo</div>
                <div className="text-xs text-[#6B6B6E]">₦{savingsNgn.naira.toLocaleString()}/mo est. · {recs.length} opportunities</div>
                <details className="mt-2 text-xs text-[#6B6B6E]"><summary className="cursor-pointer text-[#E8622C] hover:underline">What this means</summary><span className="mt-1 block">Estimated savings from recommendations below — not guaranteed. Validate before implementing.</span></details>
              </CardContent>
            </Card>
          </PanelErrorBoundary>

          <PanelErrorBoundary label="OPPORTUNITIES">
            <Card>
              <CardTitle>OPTIMIZATION OPPORTUNITIES</CardTitle>
              <CardContent>
                <div className="mt-2 text-[30px] font-semibold leading-none tracking-tight text-[#0E0E0F] tabular-nums"><CountUp value={recs.length} /></div>
                <div className="text-xs text-[#6B6B6E]">{prioritized.filter((r) => r.effort === "Low").length} low effort · {prioritized.filter((r) => r.effort !== "Low").length} review</div>
                <details className="mt-2 text-xs text-[#6B6B6E]"><summary className="cursor-pointer text-[#E8622C] hover:underline">Why it matters</summary><span className="mt-1 block">Low-effort items are fastest to validate and drive quick wins.</span></details>
              </CardContent>
            </Card>
          </PanelErrorBoundary>
        </div>

        {/* Spend chart + Services — 24px gap */}
        <div className="grid gap-6 lg:grid-cols-3">
          <PanelErrorBoundary label="AWS SPEND OVER TIME">
            <div className={`${panel} lg:col-span-2`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-mono text-xs tracking-widest text-[#6B6B6E]">AWS SPEND OVER TIME</div>
                  <div className="text-xs text-[#6B6B6E]">Daily spend · USD</div>
                </div>
                <div className="flex rounded-full border border-[#E7E5E2] p-1">
                  {[7, 30, 90].map((d) => (
                    <Link key={d} href={`/dashboard?scenario=${scenarioId}&period=${d}`} className={`rounded-full px-3 py-1 text-xs transition ${period === d ? "bg-[#E8622C] text-white" : "text-[#6B6B6E] hover:bg-[#FCEBE3]"}`}>{d}D</Link>
                  ))}
                </div>
              </div>
              <div className="mt-4">
                <SpendChart daily={cost.daily} total={cost.total} />
              </div>
            </div>
          </PanelErrorBoundary>

          <PanelErrorBoundary label="SERVICES DRIVING SPEND">
            <div className={panel}>
              <div className="font-mono text-xs tracking-widest text-[#6B6B6E]">SERVICES DRIVING YOUR SPEND</div>
              <div className="mt-1 text-xs text-[#6B6B6E]">Where the money is going — bar shows share</div>
              <div className="mt-4 space-y-3">
                {topServices.map((s) => (
                  <div key={s.service} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="truncate pr-2 text-[#0E0E0F]">{s.service.replace("Amazon ", "").replace("AWS ", "")}</span>
                      <span className="tabular-nums text-xs text-[#6B6B6E]">{s.percentage.toFixed(1)}% · ${s.amount.toFixed(2)}</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-[#FCEBE3]">
                      <div className="h-1.5 rounded-full bg-[#E8622C]" style={{ width: `${s.percentage}%` }} aria-hidden />
                    </div>
                  </div>
                ))}
              </div>
              <Link href={costsHref} className="mt-4 inline-block text-xs font-medium text-[#E8622C] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8622C]">View full breakdown →</Link>
            </div>
          </PanelErrorBoundary>
        </div>

        {/* Attention + Activity */}
        <div className="grid gap-6 lg:grid-cols-3">
          <PanelErrorBoundary label="WHAT NEEDS ATTENTION">
            <div className={`${panel} lg:col-span-2`}>
              <div className="font-mono text-xs tracking-widest text-[#6B6B6E]">WHAT NEEDS ATTENTION</div>
              <div className="mt-1 text-xs text-[#6B6B6E]">Highest estimated savings first — review evidence before acting</div>
              <div className="mt-3 space-y-3">
                {prioritized.slice(0, 2).map((r) => (
                  <Link key={r.externalId} href={`/optimizations/${r.externalId}${scenarioQs ? `?scenario=${scenarioId}` : ""}`} className="flex items-center justify-between rounded-[8px] border border-[#E7E5E2] p-4 hover:bg-[#FAFAF9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8622C]">
                    <div>
                      <div className="text-sm font-medium text-[#0E0E0F]">{r.resourceId} · {r.resourceType}</div>
                      <div className="text-xs text-[#6B6B6E]">{r.actionType} · effort <span className="rounded bg-[#FCEBE3] px-1.5 py-0.5 text-[#E8622C]">{r.effort}</span> · {r.restartRequired ? "restart" : "no restart"}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-[#E8622C] tabular-nums">${r.estimatedMonthlySavingsUsd.toFixed(2)}/mo</div>
                      <div className="text-xs text-[#6B6B6E]">→ Review</div>
                    </div>
                  </Link>
                ))}
                {prioritized.length === 0 && <div className="rounded-[8px] border border-dashed border-[#E7E5E2] p-6 text-sm text-[#6B6B6E]">No optimization opportunities yet. When NairaGuard receives recommendation data, eligible opportunities will appear here.</div>}
              </div>
            </div>
          </PanelErrorBoundary>

          <PanelErrorBoundary label="RECENT ACTIVITY">
            <div className={panel}>
              <div className="font-mono text-xs tracking-widest text-[#6B6B6E]">RECENT ACTIVITY</div>
              <div className="mt-3 space-y-3 text-sm">
                <div className="flex gap-3"><span className="mt-1.5 h-2 w-2 rounded-full bg-[#E8622C]" aria-hidden /><div><div className="font-medium text-[#0E0E0F]">Cost data refreshed</div><div className="text-xs text-[#6B6B6E]">2 min ago · {period} days · {dataset.scenario.name}</div></div></div>
                <div className="flex gap-3"><span className="mt-1.5 h-2 w-2 rounded-full bg-[#E8622C]" aria-hidden /><div><div className="font-medium text-[#0E0E0F]">Optimization identified</div><div className="text-xs text-[#6B6B6E]">{recs[0]?.resourceId ?? "—"} · ${recs[0]?.estimatedMonthlySavingsUsd.toFixed(2) ?? "—"}/mo</div></div></div>
                <div className="flex gap-3"><span className="mt-1.5 h-2 w-2 rounded-full bg-[#6B6B6E]" aria-hidden /><div><div className="font-medium text-[#0E0E0F]">FX rate recorded</div><div className="text-xs text-[#6B6B6E]">{new Date(fx.observedAt).toLocaleDateString()} · ₦{fx.rate.toLocaleString()}/USD · {fx.source}</div></div></div>
              </div>
              <Link href="/activity" className="mt-3 inline-block text-xs font-medium text-[#E8622C] hover:underline">View all activity →</Link>
            </div>
          </PanelErrorBoundary>
        </div>

        {/* What this means */}
        <PanelErrorBoundary label="WHAT THIS MEANS">
          <div className={panel}>
            <div className="font-mono text-xs tracking-widest text-[#6B6B6E]">WHAT THIS MEANS</div>
            <div className="mt-3 grid gap-4 text-sm leading-6 text-[#6B6B6E] md:grid-cols-3">
              <div>Concentrated in <span className="font-medium text-[#0E0E0F]">{topServices[0]?.service.replace("Amazon ", "")}</span> and <span className="font-medium text-[#0E0E0F]">{topServices[1]?.service.replace("Amazon ", "")}</span> — ~{((topServices[0]?.percentage ?? 0) + (topServices[1]?.percentage ?? 0)).toFixed(0)}% of period.</div>
              <div>Largest opportunity <span className="font-medium text-[#0E0E0F]">{prioritized[0]?.resourceId ?? "—"}</span> at <span className="font-medium text-[#E8622C]">${prioritized[0]?.estimatedMonthlySavingsUsd.toFixed(2) ?? "—"}/mo</span> · {prioritized[0]?.effort ?? "—"}.</div>
              <div>At ₦{fx.rate.toLocaleString()}/USD that is <span className="font-medium text-[#0E0E0F]">₦{prioritized[0] ? Math.round(prioritized[0].estimatedMonthlySavingsUsd * fx.rate).toLocaleString() : "—"}/mo</span> est. <span className="text-[#6B6B6E]">Not a bank charge.</span></div>
            </div>
          </div>
        </PanelErrorBoundary>

        <div className="rounded-[8px] border border-[#E7E5E2] bg-white px-4 py-3 text-xs leading-5 text-[#6B6B6E]">
          <span className="font-mono tracking-widest">{dataset.scenario.name} · {dataset.scenario.accountName} {maskAwsAccountId(dataset.scenario.accountId)} ·</span> Last sync {syncedAgo} · FX ₦{fx.rate.toLocaleString()}/USD · <span className="font-medium">NGN estimates — not bank charges.</span> <Link href="/connections" className="text-[#E8622C] underline hover:text-[#0E0E0F]">How NairaGuard connects</Link>
        </div>
    </div>
  );
}
