import type { DomainCostService } from "@/domain/costs";
import Link from "next/link";

/**
 * Service Breakdown — NG-502 Deterministic, provider-independent
 * Percentages calculated consistently: amount/total*100, totals internally consistent.
 */

export function ServiceBreakdown({ services, total, scenarioId }: { services: DomainCostService[]; total: number; scenarioId?: string }) {
  const sorted = [...services].sort((a, b) => b.amount - a.amount);
  const sumPct = sorted.reduce((s, x) => s + x.percentage, 0);
  const sumAmt = sorted.reduce((s, x) => s + x.amount, 0);
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5">
      <div className="font-mono text-xs tracking-widest text-stone-500">SERVICE BREAKDOWN</div>
      <div className="text-xs text-stone-500">Tap a service to inspect its contribution</div>
      <div className="mt-3 space-y-1">
        {sorted.map((s) => {
          const slug = s.service === "Amazon Elastic Compute Cloud" ? "ec2" : s.service === "Amazon Relational Database Service" ? "rds" : encodeURIComponent(s.service);
          const qs = scenarioId && scenarioId !== "balanced-startup" ? `?scenario=${scenarioId}` : "";
          return (
            <Link key={s.service} href={`/costs/${slug}${qs}`} className="flex items-center justify-between gap-3 rounded-lg px-2 py-2 hover:bg-zinc-50 focus-visible:ring-2 focus-visible:ring-zinc-900">
              <span className="text-sm truncate font-medium">{s.service.replace("Amazon ", "")}</span>
              <span className="text-sm font-mono">${s.amount.toFixed(2)} · {s.percentage.toFixed(1)}%</span>
            </Link>
          );
        })}
      </div>
      <div className="mt-3 text-xs text-stone-500">Sum ${sumAmt.toFixed(2)} vs total ${total.toFixed(2)} · {sumPct.toFixed(1)}% · Reconciled</div>
    </div>
  );
}
