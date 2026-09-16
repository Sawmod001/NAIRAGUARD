import { auth } from "@/auth";
import { prisma } from "@/lib/prisma/client";
import { DemoOptimizationProvider } from "@/infrastructure/providers/demo/optimization-provider";
import { prioritizeRecommendations } from "@/domain/optimizations";
import { convertUsdToNgn } from "@/domain/fx";
import { getDemoDataset } from "@/infrastructure/providers/demo/registry";
import Link from "next/link";

/**
 * Optimization List — NG-601
 * Each rec: resource, type, savings USD/NGN, effort, impact (savings%), risk (restart/rollback), status, priority
 */

export async function OptimizationList() {
  const session = await auth();
  const userId = (session?.user as unknown as { id?: string })?.id;
  if (!userId) return <div>Unauthorized</div>;
  const membership = await prisma.membership.findFirst({ where: { userId } });
  if (!membership) return <div>No organization</div>;

  const scenarioId = "balanced-startup";
  const dataset = getDemoDataset(scenarioId);
  const provider = new DemoOptimizationProvider(scenarioId);
  let recs;
  try {
    recs = await provider.getRecommendations({ organizationId: membership.organizationId });
  } catch (e: unknown) {
    return <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">{e instanceof Error ? e.message : "Failed"}</div>;
  }

  if (!recs.length) return <div className="rounded-xl border border-dashed p-6 text-sm text-zinc-600">No optimization opportunities.</div>;

  const prioritized = prioritizeRecommendations(recs);
  const fxRate = dataset.fx.usdNgn;

  return (
    <div className="space-y-3">
      {prioritized.map((r) => (
        <Link key={r.externalId} href={`/optimizations/${r.externalId}`} className="block rounded-xl border border-zinc-200 bg-white p-5 hover:bg-zinc-50">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-sm font-semibold">{r.resourceId} • {r.resourceType}</div>
              <div className="text-xs text-zinc-600">{r.actionType} • {r.source} • {r.region}</div>
              <div className="mt-2 flex flex-wrap gap-1 text-xs">
                <span className="rounded bg-zinc-900 px-1.5 py-0.5 text-white">Rank {r.rank} • Score {r.nairaGuardScore}</span>
                <span className="rounded bg-zinc-100 px-1.5 py-0.5">{r.effort} effort</span>
                <span className={`rounded px-1.5 py-0.5 ${r.restartRequired ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"}`}>{r.restartRequired ? "restart" : "no restart"}</span>
                <span className={`rounded px-1.5 py-0.5 ${r.rollbackPossible ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"}`}>{r.rollbackPossible ? "rollback" : "no rollback"}</span>
                <span className="rounded bg-zinc-100 px-1.5 py-0.5">{r.status}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold text-emerald-700">${r.estimatedMonthlySavingsUsd.toFixed(2)}/mo</div>
              <div className="text-xs text-zinc-500">₦{convertUsdToNgn(r.estimatedMonthlySavingsUsd, fxRate).toLocaleString()} est.</div>
              <div className="text-xs text-zinc-500">{r.savingsPercentage ? `${r.savingsPercentage}%` : "—"}</div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
