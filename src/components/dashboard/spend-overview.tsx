import { auth } from "@/auth";
import { prisma } from "@/lib/prisma/client";
import { DemoCostProvider } from "@/infrastructure/providers/demo/cost-provider";
import { normalizeCostResult } from "@/domain/costs/normalize";
import { toNairaEquivalent } from "@/domain/fx";
import { getDemoDataset } from "@/infrastructure/providers/demo/registry";

/**
 * Spend Overview — NG-402
 * Current period spend + currency + freshness + estimated Naira
 * Numbers from domain/application, no hardcoded UI calc.
 */

export async function SpendOverview() {
  const session = await auth();
  const userId = (session?.user as unknown as { id?: string })?.id;
  if (!userId) return <div className="text-sm text-red-600">Unauthorized</div>;

  const membership = await prisma.membership.findFirst({ where: { userId }, include: { organization: true } });
  if (!membership) return <div className="text-sm text-zinc-500">No organization</div>;

  // Demo scenario — later org will store preference (NG-203). For now default balanced.
  const scenarioId = "balanced-startup";
  const dataset = getDemoDataset(scenarioId);

  const provider = new DemoCostProvider(scenarioId);
  const raw = await provider.getCosts({ organizationId: membership.organizationId });
  const cost = normalizeCostResult(raw);

  const fx = { rate: dataset.fx.usdNgn, observedAt: dataset.fx.observedAt, source: dataset.fx.provider };
  const naira = toNairaEquivalent(cost.total, fx);

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5">
      <div className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Total spend • Current period</div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-2xl font-semibold">${cost.total.toLocaleString()}</span>
        <span className="text-xs font-medium text-zinc-500">{cost.currency}</span>
      </div>
      <div className="mt-1 text-xs text-zinc-500">{cost.periodDays} days • {cost.daily.length} points</div>

      <div className="mt-4 rounded-md bg-zinc-50 p-3">
        <div className="text-xs font-medium text-zinc-700">{naira.label}</div>
        <div className="text-sm font-semibold">₦{naira.naira.toLocaleString()}</div>
        <div className="text-xs text-zinc-500">
          at ₦{naira.rate.toLocaleString()}/USD • {naira.source} • {naira.observedAt.slice(0, 10)}
        </div>
      </div>

      <div className="mt-3 text-xs text-zinc-500">
        Freshness: {new Date(cost.observedAt).toLocaleDateString()} • Source {cost.source} • Account {cost.accountId ?? "—"}
      </div>
    </div>
  );
}
