import { auth } from "@/auth";
import { prisma } from "@/lib/prisma/client";
import { DemoOptimizationProvider } from "@/infrastructure/providers/demo/optimization-provider";
import { DemoResourceProvider } from "@/infrastructure/providers/demo/resource-provider";
import { convertUsdToNgn } from "@/domain/fx";
import { getDemoDataset } from "@/infrastructure/providers/demo/registry";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function RecommendationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const userId = (session?.user as unknown as { id?: string })?.id;
  if (!userId) return <div>Unauthorized</div>;
  const membership = await prisma.membership.findFirst({ where: { userId } });
  if (!membership) return <div>No organization</div>;

  const scenarioId = "balanced-startup";
  const dataset = getDemoDataset(scenarioId);
  const optProvider = new DemoOptimizationProvider(scenarioId);
  const rec = await optProvider.getRecommendationById(id, { organizationId: membership.organizationId });
  if (!rec) notFound();

  const resourceProvider = new DemoResourceProvider(scenarioId);
  const resource = await resourceProvider.getResource({ organizationId: membership.organizationId, resourceId: rec.resourceId });

  const fxRate = dataset.fx.usdNgn;
  const savingsNgn = convertUsdToNgn(rec.estimatedMonthlySavingsUsd, fxRate);
  const costNgn = convertUsdToNgn(rec.estimatedMonthlyCostUsd, fxRate);

  return (
    <div className="space-y-6">
      <Link href="/optimizations" className="text-sm text-zinc-600 hover:text-black">← Back to optimizations</Link>
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
          <div className="text-xs text-zinc-500">₦{costNgn.toLocaleString()} est.</div>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
          <div className="text-xs uppercase tracking-widest text-emerald-700">Est. monthly savings</div>
          <div className="mt-2 text-lg font-semibold text-emerald-700">${rec.estimatedMonthlySavingsUsd.toFixed(2)}</div>
          <div className="text-xs text-emerald-700">₦{savingsNgn.toLocaleString()} estimated • {rec.savingsPercentage ? `${rec.savingsPercentage}%` : "—"}</div>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <div className="text-xs uppercase tracking-widest text-zinc-500">Effort & risk</div>
          <div className="mt-2 text-sm">{rec.effort} effort • {rec.restartRequired ? "restart required" : "no restart"} • {rec.rollbackPossible ? "rollback possible" : "no rollback"}</div>
          <div className="text-xs text-zinc-500">Source {rec.source} • Freshness {new Date(rec.observedAt).toLocaleDateString()}</div>
        </div>
      </div>

      {resource && (
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <div className="text-xs uppercase tracking-widest text-zinc-500">Resource evidence</div>
          <div className="mt-2 text-sm">ARN: <span className="font-mono text-xs">{resource.resourceArn}</span></div>
          <div className="text-xs text-zinc-500">Region {resource.region} • Observed {new Date(resource.observedAt).toLocaleDateString()}</div>
        </div>
      )}
    </div>
  );
}
