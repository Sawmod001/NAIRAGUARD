import { auth } from "@/auth";
import { prisma } from "@/lib/prisma/client";
import { DemoCostProvider } from "@/infrastructure/providers/demo/cost-provider";
import { normalizeCostResult } from "@/domain/costs/normalize";
import type { DomainCost } from "@/domain/costs/types";
import { getLatestCostSnapshot, snapshotToCostView } from "@/lib/costs/snapshots";
import Link from "next/link";

function slugToService(slug: string): string {
  const map: Record<string, string> = {
    ec2: "Amazon Elastic Compute Cloud",
    rds: "Amazon Relational Database Service",
    ebs: "Amazon Elastic Block Store",
    s3: "Amazon Simple Storage Service",
    lambda: "AWS Lambda",
  };
  return map[slug] ?? decodeURIComponent(slug);
}

export default async function ServiceDetailPage({ params, searchParams }: { params: Promise<{ service: string }>; searchParams: Promise<{ scenario?: string }> }) {
  const { service: slug } = await params;
  const sp = await searchParams;
  const scenarioId = (sp.scenario as string) || "balanced-startup";
  const serviceName = slugToService(slug);
  const session = await auth();
  const userId = (session?.user as unknown as { id?: string })?.id;
  const membership = userId ? await prisma.membership.findFirst({ where: { userId } }) : null;
  if (!membership) return <div>Unauthorized</div>;

  // NG-DASH-08: persisted snapshot first (full window for share math), provider fallback.
  const persistedCosts = await getLatestCostSnapshot(membership.organizationId).catch(() => null);
  let cost: DomainCost;
  if (persistedCosts) {
    const view = snapshotToCostView(persistedCosts, { organizationId: membership.organizationId, period: persistedCosts.periodDays });
    if (view) {
      cost = view;
    } else {
      const provider = new DemoCostProvider(scenarioId);
      cost = normalizeCostResult(await provider.getCosts({ organizationId: membership.organizationId }));
    }
  } else {
    const provider = new DemoCostProvider(scenarioId);
    cost = normalizeCostResult(await provider.getCosts({ organizationId: membership.organizationId }));
  }
  const svc = cost.services.find((s) => s.service === serviceName);
  if (!svc) return <div className="p-6">Service not found: {serviceName}</div>;

  const qs = scenarioId !== "balanced-startup" ? `?scenario=${scenarioId}` : "";
  return (
    <div className="space-y-6">
      <Link href={`/costs${qs}`} className="text-sm text-stone-500 hover:text-stone-900">← Costs</Link>
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Costs / {serviceName.replace("Amazon ", "")}</h1>
        <p className="text-sm text-zinc-500">Service detail • {svc.percentage.toFixed(1)}% of total • ${svc.amount.toFixed(2)}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <div className="font-mono text-xs tracking-widest text-zinc-500">TOTAL EC2 SPEND</div>
          <div className="mt-2 text-2xl font-semibold">${svc.amount.toFixed(2)}</div>
          <div className="text-xs text-zinc-500">{svc.percentage.toFixed(1)}% of ${cost.total.toFixed(2)}</div>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <div className="font-mono text-xs tracking-widest text-zinc-500">TREND</div>
          <div className="mt-2 flex h-16 items-end gap-[2px]">
            {cost.daily.slice(-7).map((d) => (
              <div key={d.date} className="flex-1 rounded-t bg-zinc-900" style={{ height: `${(d.amount / Math.max(...cost.daily.map((x) => x.amount))) * 100}%` }} />
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <div className="font-mono text-xs tracking-widest text-zinc-500">REGIONS</div>
          <div className="mt-2 space-y-1 text-sm">
            {cost.regions.slice(0, 3).map((r) => (
              <div key={r.region} className="flex justify-between">
                <span>{r.region}</span>
                <span>${r.amount.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="rounded-xl border border-zinc-200 bg-white p-5">
        <div className="font-mono text-xs tracking-widest text-zinc-500">RESOURCES</div>
        <table className="mt-3 w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-left font-mono text-xs tracking-widest text-zinc-500">
              <th className="py-2">RESOURCE</th>
              <th className="py-2">TYPE</th>
              <th className="py-2">REGION</th>
              <th className="py-2 text-right">SPEND</th>
              <th className="py-2 text-right">OPTIMIZATION</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-zinc-100 hover:bg-zinc-50">
              <td className="py-2"><Link href={`/costs/resource/i-0demo001${qs}`} className="font-mono text-xs hover:underline">i-0demo001</Link></td>
              <td className="py-2">m6i.2xlarge</td>
              <td className="py-2">eu-west-1</td>
              <td className="py-2 text-right">$285.40</td>
              <td className="py-2 text-right text-emerald-600">Available</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
