import { auth } from "@/auth";
import { prisma } from "@/lib/prisma/client";
import { DemoOptimizationProvider } from "@/infrastructure/providers/demo/optimization-provider";
import { DemoResourceProvider } from "@/infrastructure/providers/demo/resource-provider";
import { findingsToRecommendations, getOptimizationFinding } from "@/lib/optimizations/findings";
import { displayFxSource, toNairaEquivalent } from "@/domain/fx";
import { getLatestFxSnapshot } from "@/lib/fx/snapshots";
import { getDemoDataset } from "@/infrastructure/providers/demo/registry";
import { notFound } from "next/navigation";
import Link from "next/link";
import { EvidenceDisplay } from "@/components/optimizations/evidence-display";
import { AIExplanationCard } from "@/components/optimizations/ai-explanation";

export default async function RecommendationDetailPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ scenario?: string }> }) {
  const { id } = await params;
  const sp = await searchParams;
  const session = await auth();
  const userId = (session?.user as unknown as { id?: string })?.id;
  if (!userId) return <div>Unauthorized</div>;
  const membership = await prisma.membership.findFirst({ where: { userId } });
  if (!membership) return <div>No organization</div>;

  const scenarioId = (sp.scenario as string) || "balanced-startup";
  const dataset = getDemoDataset(scenarioId);
  // NG-DASH-09: persisted finding first, provider fallback. Resource evidence
  // stays provider-driven until resource-level persistence lands.
  const persistedFinding = await getOptimizationFinding({ organizationId: membership.organizationId, externalId: id }).catch(() => null);
  let rec;
  if (persistedFinding) {
    [rec] = findingsToRecommendations([persistedFinding]);
  } else {
    const optProvider = new DemoOptimizationProvider(scenarioId);
    rec = await optProvider.getRecommendationById(id, { organizationId: membership.organizationId });
  }
  if (!rec) notFound();

  const resourceProvider = new DemoResourceProvider(scenarioId);
  const resource = await resourceProvider.getResource({ organizationId: membership.organizationId, resourceId: rec.resourceId });

  // NG-DASH-10: NGN figures trace to the pinned snapshot, like everywhere else.
  const pinnedFx = await getLatestFxSnapshot(membership.organizationId).catch(() => null);
  const fx = pinnedFx
    ? { rate: pinnedFx.rate, observedAt: pinnedFx.retrievedAt, source: pinnedFx.provider }
    : { rate: dataset.fx.usdNgn, observedAt: dataset.fx.observedAt, source: dataset.fx.provider };
  const savingsNgn = toNairaEquivalent(rec.estimatedMonthlySavingsUsd, fx, pinnedFx?.id ?? null);
  const costNgn = toNairaEquivalent(rec.estimatedMonthlyCostUsd, fx, pinnedFx?.id ?? null);

  const backQs = scenarioId !== "balanced-startup" ? `?scenario=${scenarioId}` : "";
  return (
    <div className="space-y-6">
      <Link href={`/optimizations${backQs}`} className="text-sm text-zinc-600 hover:text-black">← Back to optimizations</Link>
      <div>
        <h1 className="text-2xl font-semibold">{rec.resourceId} • {rec.resourceType}</h1>
        <p className="text-sm text-zinc-600">{rec.actionType} • {rec.source} • {rec.region}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <div className="text-xs uppercase tracking-widest text-zinc-500">Current</div>
          <div className="mt-2 text-sm font-medium">{rec.currentConfiguration}</div>
          <div className="mt-1 text-xs text-zinc-500">Resource {rec.resourceId} • {resource?.configuration ?? "—"}</div>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <div className="text-xs uppercase tracking-widest text-zinc-500">Recommended</div>
          <div className="mt-2 text-sm font-medium">{rec.recommendedConfiguration}</div>
          <div className="mt-1 text-xs text-zinc-500">Action: {rec.actionType}</div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <div className="text-xs uppercase tracking-widest text-zinc-500">Current est. monthly cost</div>
          <div className="mt-2 text-lg font-semibold">${rec.estimatedMonthlyCostUsd.toFixed(2)}</div>
          <div className="text-xs text-zinc-500">₦{costNgn.naira.toLocaleString()} est.</div>
          <div className="text-xs text-zinc-500">Recommended ${(rec.estimatedMonthlyCostUsd - rec.estimatedMonthlySavingsUsd).toFixed(2)}/mo</div>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
          <div className="text-xs uppercase tracking-widest text-emerald-700">Est. monthly savings</div>
          <div className="mt-2 text-lg font-semibold text-emerald-700">${rec.estimatedMonthlySavingsUsd.toFixed(2)}</div>
          <div className="text-xs text-emerald-700">₦{savingsNgn.naira.toLocaleString()} estimated • {rec.savingsPercentage ? `${rec.savingsPercentage}%` : "—"}</div>
          <div className="text-xs text-emerald-700">Based on ₦{fx.rate.toLocaleString()}/USD • {fx.observedAt.slice(0, 10)} • {displayFxSource(fx.source)}</div>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <div className="text-xs uppercase tracking-widest text-zinc-500">Effort & risk</div>
          <div className="mt-2 text-sm">{rec.effort} effort • {rec.restartRequired ? "restart required" : "no restart"} • {rec.rollbackPossible ? "rollback possible" : "no rollback"}</div>
          <div className="text-xs text-zinc-500">Source {rec.source} • Freshness {new Date(rec.observedAt).toLocaleDateString()}</div>
          <div className="mt-3 flex gap-2">
            <span className="rounded bg-zinc-900 px-2 py-1 text-xs text-white">Review</span>
            <span className="rounded border border-zinc-200 px-2 py-1 text-xs">Accept</span>
            <span className="rounded border border-zinc-200 px-2 py-1 text-xs">Dismiss</span>
          </div>
          <div className="mt-1 text-xs text-zinc-500">Read-only: updates status here, never changes AWS</div>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-5">
        <div className="text-xs uppercase tracking-widest text-zinc-500">Why flagged • Evidence</div>
        <div className="mt-2 grid gap-4 md:grid-cols-3 text-sm">
          <div>Average CPU {resource?.utilization?.cpuAverage ?? 18}% • Peak 34% • Memory {resource?.utilization?.memoryAverage ?? 31}%</div>
          <div>Observation 30 days • Region {rec.region} • Resource {rec.resourceId}</div>
          <div>Source {rec.source} • Status {rec.status ?? "Open"} • Freshness {new Date(rec.observedAt).toLocaleDateString()}</div>
        </div>
      </div>

      <EvidenceDisplay rec={rec} resource={resource} />
      <AIExplanationCard rec={rec} fxRate={fx.rate} />
    </div>
  );
}
