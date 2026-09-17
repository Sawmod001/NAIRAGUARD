import { DemoResourceProvider } from "@/infrastructure/providers/demo/resource-provider";
import { DemoOptimizationProvider } from "@/infrastructure/providers/demo/optimization-provider";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma/client";
import Link from "next/link";

export default async function ResourceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const userId = (session?.user as unknown as { id?: string })?.id;
  const membership = userId ? await prisma.membership.findFirst({ where: { userId } }) : null;
  if (!membership) return <div>Unauthorized</div>;

  const rp = new DemoResourceProvider("balanced-startup");
  const resource = await rp.getResource({ organizationId: membership.organizationId, resourceId: id });
  if (!resource) return <div className="p-6">Resource not found</div>;

  const op = new DemoOptimizationProvider("balanced-startup");
  const recs = await op.getRecommendations({ organizationId: membership.organizationId });
  const rec = recs.find((r) => r.resourceId === id);

  return (
    <div className="space-y-6">
      <Link href="/costs" className="text-sm text-zinc-500 hover:text-black">← Costs</Link>
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">{resource.resourceId} • {resource.resourceType}</h1>
        <p className="text-sm text-zinc-500">{resource.region} • {resource.resourceArn}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <div className="font-mono text-xs tracking-widest text-zinc-500">CURRENT CONFIGURATION</div>
          <div className="mt-2 font-mono text-sm">{resource.configuration}</div>
          <div className="text-xs text-zinc-500">Observed {new Date(resource.observedAt).toLocaleDateString()}</div>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <div className="font-mono text-xs tracking-widest text-zinc-500">UTILIZATION</div>
          <div className="text-sm">CPU {resource.utilization?.cpuAverage ?? "—"}% • Memory {resource.utilization?.memoryAverage ?? "—"}% • Lookback {resource.utilization?.lookbackDays ?? 14}d</div>
        </div>
      </div>
      {rec ? (
        <div className="rounded-xl border border-orange-200 bg-orange-50 p-5">
          <div className="font-mono text-xs tracking-widest text-orange-700">OPTIMIZATION OPPORTUNITY</div>
          <div className="mt-2 text-sm font-medium">{rec.actionType} → {rec.recommendedConfiguration}</div>
          <div className="text-sm">Potential savings ${rec.estimatedMonthlySavingsUsd.toFixed(2)}/mo • {rec.effort} effort • {rec.restartRequired ? "restart" : "no restart"}</div>
          <Link href={`/optimizations/${rec.externalId}`} className="mt-3 inline-block rounded-full bg-black px-4 py-2 text-sm font-medium text-white">View recommendation</Link>
        </div>
      ) : (
        <div className="text-sm text-zinc-500">No optimization for this resource</div>
      )}
    </div>
  );
}
