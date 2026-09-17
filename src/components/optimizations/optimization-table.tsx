import Link from "next/link";
import type { NormalizedRecommendation } from "@/infrastructure/providers/optimization-provider";

export function OptimizationTable({ recs }: { recs: NormalizedRecommendation[] }) {
  if (!recs.length) return <div className="rounded-xl border border-dashed p-6 text-sm text-zinc-600">No optimization opportunities.</div>;
  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white">
      <table className="w-full text-sm">
        <thead className="sticky top-0 bg-zinc-50">
          <tr className="border-b border-zinc-200 text-left font-mono text-xs tracking-widest text-zinc-500">
            <th className="px-4 py-3 font-medium">RESOURCE</th>
            <th className="px-4 py-3 font-medium">OPPORTUNITY</th>
            <th className="px-4 py-3 font-medium">REGION</th>
            <th className="px-4 py-3 text-right font-medium">SAVINGS</th>
            <th className="px-4 py-3 font-medium">EFFORT</th>
            <th className="px-4 py-3 font-medium">STATUS</th>
          </tr>
        </thead>
        <tbody>
          {recs.map((r) => (
            <tr key={r.externalId} className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50">
              <td className="px-4 py-3">
                <div className="font-mono text-xs">{r.resourceId}</div>
                <div className="text-xs text-zinc-500">{r.resourceType}</div>
              </td>
              <td className="px-4 py-3">
                <div className="font-medium">{r.actionType}</div>
                <div className="text-xs text-zinc-500">{r.source}</div>
              </td>
              <td className="px-4 py-3 font-mono text-xs">{r.region}</td>
              <td className="px-4 py-3 text-right font-mono">${r.estimatedMonthlySavingsUsd.toFixed(2)}/mo</td>
              <td className="px-4 py-3">
                <span className={`rounded-full px-2 py-1 text-xs ${r.effort === "Low" ? "bg-emerald-100 text-emerald-700" : r.effort === "Medium" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>{r.effort}</span>
              </td>
              <td className="px-4 py-3">
                <span className="rounded-full bg-zinc-900 px-2 py-1 text-xs text-white">{r.status ?? "Open"}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
