import { auth } from "@/auth";
import { prisma } from "@/lib/prisma/client";
import { DemoCostProvider } from "@/infrastructure/providers/demo/cost-provider";
import { normalizeCostResult } from "@/domain/costs/normalize";

/**
 * Cost Drivers — NG-405 Deterministic, totals consistent
 * Service distribution sorted desc, percentages sum 100, amounts sum total.
 */

export async function CostDrivers() {
  const session = await auth();
  const userId = (session?.user as unknown as { id?: string })?.id;
  if (!userId) return <div className="text-sm text-red-600">Unauthorized</div>;
  const membership = await prisma.membership.findFirst({ where: { userId } });
  if (!membership) return <div className="text-sm text-zinc-500">No organization</div>;

  const provider = new DemoCostProvider("balanced-startup");
  let cost;
  try {
    const raw = await provider.getCosts({ organizationId: membership.organizationId });
    cost = normalizeCostResult(raw);
  } catch (e: unknown) {
    return <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">{e instanceof Error ? e.message : "Failed to load"}</div>;
  }

  if (!cost.services.length) return <div className="rounded-xl border border-dashed p-6 text-sm text-zinc-600">No drivers</div>;

  const sorted = [...cost.services].sort((a, b) => b.amount - a.amount);

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5">
      <div className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Top drivers • By service</div>
      <div className="mt-3 space-y-3">
        {sorted.slice(0, 5).map((s) => (
          <div key={s.service} className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">{s.service}</div>
              <div className="h-1.5 rounded bg-zinc-100">
                <div className="h-1.5 rounded bg-zinc-900" style={{ width: `${s.percentage}%` }} />
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold">${s.amount.toFixed(2)}</div>
              <div className="text-xs text-zinc-500">{s.percentage.toFixed(1)}%</div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 text-xs text-zinc-500">Total ${cost.total.toFixed(2)} • {cost.services.length} services • Deterministic</div>
    </div>
  );
}
