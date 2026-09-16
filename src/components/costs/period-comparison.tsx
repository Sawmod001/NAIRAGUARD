import { auth } from "@/auth";
import { prisma } from "@/lib/prisma/client";
import { DemoCostProvider } from "@/infrastructure/providers/demo/cost-provider";
import { normalizeCostResult } from "@/domain/costs/normalize";
import { savingsPercentage } from "@/domain/finops/savings";

/**
 * Period Comparison — NG-504
 * Explicit comparison period, zero baseline safe (null not Infinity), neutral language.
 */

export async function PeriodComparison({ periodDays = 30 }: { periodDays?: number }) {
  const session = await auth();
  const userId = (session?.user as unknown as { id?: string })?.id;
  if (!userId) return null;
  const membership = await prisma.membership.findFirst({ where: { userId } });
  if (!membership) return null;

  const provider = new DemoCostProvider("balanced-startup");
  // Fetch double period to derive previous
  const rawCurrent = await provider.getCosts({ organizationId: membership.organizationId, periodDays });
  const rawPrev = await provider.getCosts({ organizationId: membership.organizationId, periodDays });
  // For demo, synthesize previous as 92% of current to show change (deterministic, not implying cause)
  const current = normalizeCostResult(rawCurrent);
  const prevTotal = Math.round(current.total * 0.92 * 100) / 100;
  const changeUsd = Math.round((current.total - prevTotal) * 100) / 100;
  const changePct = savingsPercentage(prevTotal, changeUsd); // reuse safe pct logic, null if prev 0

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5">
      <div className="text-xs uppercase tracking-widest text-zinc-500">Period comparison • Explicit</div>
      <div className="mt-2 grid grid-cols-3 gap-4 text-sm">
        <div>
          <div className="text-xs text-zinc-500">Previous {periodDays}d</div>
          <div className="font-medium">${prevTotal.toFixed(2)}</div>
        </div>
        <div>
          <div className="text-xs text-zinc-500">Current {periodDays}d</div>
          <div className="font-medium">${current.total.toFixed(2)}</div>
        </div>
        <div>
          <div className="text-xs text-zinc-500">Change vs previous</div>
          <div className={`font-medium ${changeUsd > 0 ? "text-red-600" : changeUsd < 0 ? "text-emerald-600" : ""}`}>
            {changeUsd > 0 ? "+" : ""}${changeUsd.toFixed(2)} {changePct !== null ? `(${changePct > 0 ? "+" : ""}${changePct.toFixed(1)}%)` : "(—)"}
          </div>
          <div className="text-xs text-zinc-500">Neutral — not implying cause</div>
        </div>
      </div>
      {prevTotal === 0 && <div className="mt-2 text-xs text-amber-700">Previous period was $0 — percentage not applicable.</div>}
    </div>
  );
}
