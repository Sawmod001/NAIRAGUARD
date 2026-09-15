import { auth } from "@/auth";
import { prisma } from "@/lib/prisma/client";
import { DemoOptimizationProvider } from "@/infrastructure/providers/demo/optimization-provider";
import { prioritizeRecommendations } from "@/domain/optimizations";
import { convertUsdToNgn } from "@/domain/fx";
import { getDemoDataset } from "@/infrastructure/providers/demo/registry";

/**
 * Optimization Highlights — NG-406
 * High-value opportunities: resource, savings USD+NGN, priority (NG score), effort/risk.
 */

export async function OptimizationHighlights() {
  const session = await auth();
  const userId = (session?.user as unknown as { id?: string })?.id;
  if (!userId) return <div className="text-sm text-red-600">Unauthorized</div>;
  const membership = await prisma.membership.findFirst({ where: { userId } });
  if (!membership) return <div className="text-sm text-zinc-500">No organization</div>;

  const scenarioId = "balanced-startup";
  const dataset = getDemoDataset(scenarioId);
  const provider = new DemoOptimizationProvider(scenarioId);
  let recs;
  try {
    recs = await provider.getRecommendations({ organizationId: membership.organizationId });
  } catch (e: unknown) {
    return <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">{e instanceof Error ? e.message : "Failed"}</div>;
  }

  if (!recs.length) return <div className="rounded-xl border border-dashed p-6 text-sm text-zinc-600">No optimization opportunities — try waste-heavy scenario.</div>;

  const prioritized = prioritizeRecommendations(recs).slice(0, 3);
  const fx = { rate: dataset.fx.usdNgn, source: dataset.fx.provider };

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5">
      <div className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Optimization highlights • Top 3</div>
      <div className="mt-3 grid gap-3 md:grid-cols-3">
        {prioritized.map((r) => (
          <div key={r.externalId} className="rounded-lg border border-zinc-200 p-4">
            <div className="text-xs font-medium text-zinc-500">{r.resourceType} • {r.region}</div>
            <div className="mt-1 text-sm font-semibold truncate">{r.resourceId}</div>
            <div className="text-xs text-zinc-600">{r.actionType} • {r.source}</div>
            <div className="mt-2 text-sm font-semibold text-emerald-700">${r.estimatedMonthlySavingsUsd.toFixed(2)}/mo</div>
            <div className="text-xs text-zinc-500">₦{convertUsdToNgn(r.estimatedMonthlySavingsUsd, fx.rate).toLocaleString()} estimated</div>
            <div className="mt-2 flex flex-wrap gap-1 text-xs">
              <span className="rounded bg-zinc-900 px-1.5 py-0.5 text-white">Score {r.nairaGuardScore}</span>
              <span className="rounded bg-zinc-100 px-1.5 py-0.5">{r.effort} effort</span>
              {r.restartRequired && <span className="rounded bg-amber-100 px-1.5 py-0.5 text-amber-800">restart</span>}
              {r.rollbackPossible ? <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-emerald-800">rollback</span> : <span className="rounded bg-red-100 px-1.5 py-0.5 text-red-800">no rollback</span>}
            </div>
            <div className="mt-1 text-xs text-zinc-500">{r.reason}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
