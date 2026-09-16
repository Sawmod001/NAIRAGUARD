import type { DomainCostRegion } from "@/domain/costs";

/**
 * Regional Breakdown — NG-503 Normalized, aggregation correct, empty handled
 */

export function RegionBreakdown({ regions }: { regions: DomainCostRegion[] }) {
  if (!regions.length) return <div className="rounded-xl border border-dashed p-6 text-sm text-zinc-600">No regional data</div>;
  const sorted = [...regions].sort((a, b) => b.amount - a.amount);
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5">
      <div className="text-xs uppercase tracking-widest text-zinc-500">Regional breakdown</div>
      <div className="mt-3 space-y-2">
        {sorted.map((r) => (
          <div key={r.region} className="flex justify-between border-b border-zinc-100 py-2 text-sm">
            <span>{r.region}</span>
            <span className="font-medium">${r.amount.toFixed(2)} • {r.percentage.toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
