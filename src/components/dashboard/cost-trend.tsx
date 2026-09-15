import { auth } from "@/auth";
import { prisma } from "@/lib/prisma/client";
import { DemoCostProvider } from "@/infrastructure/providers/demo/cost-provider";
import { normalizeCostResult } from "@/domain/costs/normalize";

/**
 * Cost Trend — NG-404
 * Daily trend from normalized domain data, clear period labeling, no misleading precision (2 decimals).
 * Loading/empty/error handled via async server component boundaries.
 */

export async function CostTrend() {
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
    const msg = e instanceof Error ? e.message : "Could not load trend.";
    return <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">{msg}</div>;
  }

  if (!cost.daily.length) {
    return <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-6 text-sm text-zinc-600">No trend data — empty period.</div>;
  }

  const max = Math.max(...cost.daily.map((d) => d.amount));
  const min = Math.min(...cost.daily.map((d) => d.amount));

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5">
      <div className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Cost trend • Daily • {cost.periodDays} days</div>
      <div className="mt-1 text-xs text-zinc-500">Period {cost.daily[0]?.date} → {cost.daily[cost.daily.length - 1]?.date} • {cost.source}</div>
      <div className="mt-4 flex items-end gap-[2px] h-32">
        {cost.daily.map((d) => {
          const h = max > 0 ? Math.round((d.amount / max) * 100) : 0;
          return (
            <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full rounded-t bg-zinc-900" style={{ height: `${h}%` }} title={`${d.date}: $${d.amount.toFixed(2)}`} />
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex justify-between text-xs text-zinc-500">
        <span>Min ${min.toFixed(2)}</span>
        <span>Max ${max.toFixed(2)}</span>
        <span>Total ${cost.total.toFixed(2)}</span>
      </div>
    </div>
  );
}
