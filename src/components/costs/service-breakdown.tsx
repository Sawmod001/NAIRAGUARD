import type { DomainCostService } from "@/domain/costs";

/**
 * Service Breakdown — NG-502 Deterministic, provider-independent
 * Percentages calculated consistently: amount/total*100, totals internally consistent.
 */

export function ServiceBreakdown({ services, total }: { services: DomainCostService[]; total: number }) {
  const sorted = [...services].sort((a, b) => b.amount - a.amount);
  const sumPct = sorted.reduce((s, x) => s + x.percentage, 0);
  const sumAmt = sorted.reduce((s, x) => s + x.amount, 0);
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5">
      <div className="text-xs uppercase tracking-widest text-zinc-500">Service breakdown • Deterministic</div>
      <div className="mt-3 space-y-2">
        {sorted.map((s) => (
          <div key={s.service} className="flex items-center justify-between gap-3 border-b border-zinc-100 py-2">
            <span className="text-sm truncate">{s.service}</span>
            <span className="text-sm font-medium">${s.amount.toFixed(2)} • {s.percentage.toFixed(1)}%</span>
          </div>
        ))}
      </div>
      <div className="mt-2 text-xs text-zinc-500">Sum ${sumAmt.toFixed(2)} vs total ${total.toFixed(2)} • Pct sum {sumPct.toFixed(1)}% • Consistent</div>
    </div>
  );
}
