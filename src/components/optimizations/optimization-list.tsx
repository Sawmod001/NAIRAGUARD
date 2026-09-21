import { auth } from "@/auth";
import { prisma } from "@/lib/prisma/client";
import { DemoOptimizationProvider } from "@/infrastructure/providers/demo/optimization-provider";
import { findingsToRecommendations, listOptimizationFindings } from "@/lib/optimizations/findings";
import { prioritizeRecommendations } from "@/domain/optimizations";
import { convertUsdToNgn } from "@/domain/fx";
import { getDemoDataset } from "@/infrastructure/providers/demo/registry";
import Link from "next/link";

/**
 * Optimization List — NG-601
 * Each rec: resource, type, savings USD/NGN, effort, impact (savings%), risk (restart/rollback), status, priority
 */

export async function OptimizationList({ searchParams }: { searchParams?: { effort?: string; region?: string; sort?: string; scenario?: string } }) {
  const session = await auth();
  const userId = (session?.user as unknown as { id?: string })?.id;
  if (!userId) return <div>Unauthorized</div>;
  const membership = await prisma.membership.findFirst({ where: { userId } });
  if (!membership) return <div>No organization</div>;

  const scenarioId = (searchParams?.scenario as string) || "balanced-startup";
  const dataset = getDemoDataset(scenarioId);
  // NG-DASH-09: persisted findings first (org truth, scenario-independent), provider fallback.
  const persisted = await listOptimizationFindings({ organizationId: membership.organizationId, limit: 200 }).catch(() => null);
  let recs;
  try {
    if (persisted && persisted.length > 0) {
      recs = findingsToRecommendations(persisted);
    } else {
      const provider = new DemoOptimizationProvider(scenarioId);
      recs = await provider.getRecommendations({ organizationId: membership.organizationId });
    }
  } catch (e: unknown) {
    return <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">{e instanceof Error ? e.message : "Failed"}</div>;
  }

  if (!recs.length) return <div className="rounded-xl border border-dashed p-6 text-sm text-zinc-600">No optimization opportunities.</div>;

  // Deterministic filtering
  let filtered = recs;
  if (searchParams?.effort) filtered = filtered.filter((r) => r.effort === searchParams.effort);
  if (searchParams?.region) filtered = filtered.filter((r) => r.region === searchParams.region);

  if (!filtered.length) return <div className="rounded-xl border border-dashed p-6 text-sm text-zinc-600">No matches for filters.</div>;

  // Deterministic sorting
  let prioritized = prioritizeRecommendations(filtered);
  if (searchParams?.sort === "percentage") {
    prioritized = [...filtered]
      .sort((a, b) => (b.savingsPercentage ?? 0) - (a.savingsPercentage ?? 0) || b.estimatedMonthlySavingsUsd - a.estimatedMonthlySavingsUsd)
      .map((r, i) => ({ ...r, nairaGuardScore: prioritizeRecommendations([r])[0]!.nairaGuardScore, rank: i + 1 } as typeof prioritized[0]));
  } else if (searchParams?.sort === "effort") {
    const order = { Low: 0, Medium: 1, High: 2 } as const;
    prioritized = [...filtered]
      .sort((a, b) => order[a.effort as keyof typeof order] - order[b.effort as keyof typeof order] || b.estimatedMonthlySavingsUsd - a.estimatedMonthlySavingsUsd)
      .map((r, i) => ({ ...r, nairaGuardScore: prioritizeRecommendations([r])[0]!.nairaGuardScore, rank: i + 1 } as typeof prioritized[0]));
  }
  const fxRate = dataset.fx.usdNgn;

  const scenarioQs = scenarioId !== "balanced-startup" ? `&scenario=${scenarioId}` : "";
  // Production table — dense, sticky header, right-aligned monetary, keyboard accessible; stacked on mobile
  return (
    <>
      <div className="hidden overflow-x-auto rounded-xl border border-stone-200 bg-white md:block">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-zinc-50">
            <tr className="border-b border-zinc-200 text-left font-mono text-xs tracking-widest text-zinc-500">
              <th className="px-4 py-3 font-medium">RESOURCE</th>
              <th className="px-4 py-3 font-medium">OPPORTUNITY</th>
              <th className="px-4 py-3 font-medium">REGION</th>
              <th className="px-4 py-3 text-right font-medium">SAVINGS</th>
              <th className="px-4 py-3 font-medium">EFFORT</th>
              <th className="px-4 py-3 font-medium">STATUS</th>
            </tr>
          </thead>
          <tbody>
            {prioritized.map((r) => (
              <tr key={r.externalId} className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50">
                <td className="px-4 py-3">
                  <Link href={`/optimizations/${r.externalId}${scenarioQs ? `?scenario=${scenarioId}` : ""}`} className="font-mono text-xs hover:underline focus-visible:outline-none">
                    {r.resourceId}
                  </Link>
                  <div className="text-xs text-zinc-500">{r.resourceType}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium">{r.actionType}</div>
                  <div className="text-xs text-zinc-500">{r.source}</div>
                </td>
                <td className="px-4 py-3 font-mono text-xs">{r.region}</td>
                <td className="px-4 py-3 text-right font-mono">${r.estimatedMonthlySavingsUsd.toFixed(2)}/mo</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-1 text-xs ${r.effort === "Low" ? "bg-emerald-100 text-emerald-700" : r.effort === "Medium" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>{r.effort}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-zinc-900 px-2 py-1 text-xs text-white">{r.status ?? "Open"}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="space-y-3 md:hidden">
        {prioritized.map((r) => (
          <Link key={r.externalId} href={`/optimizations/${r.externalId}${scenarioQs ? `?scenario=${scenarioId}` : ""}`} className="block rounded-xl border border-stone-200 bg-white p-4">
            <div className="font-mono text-xs">{r.resourceId} • {r.resourceType}</div>
            <div className="text-sm font-medium">{r.actionType}</div>
            <div className="text-xs text-zinc-500">{r.region} • {r.source}</div>
            <div className="mt-2 flex justify-between text-sm">
              <span className="font-mono">${r.estimatedMonthlySavingsUsd.toFixed(2)}/mo</span>
              <span className="rounded-full bg-zinc-900 px-2 py-1 text-xs text-white">{r.status ?? "Open"}</span>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
