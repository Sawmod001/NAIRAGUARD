import type { NormalizedResource } from "@/infrastructure/providers/resource-provider";
import type { NormalizedRecommendation } from "@/infrastructure/providers/optimization-provider";

/**
 * Evidence Display — NG-604
 * Shows provider evidence distinguishable from AI (NG-605). Uses resource utilization, attributes, source, timestamps.
 */

export function EvidenceDisplay({ rec, resource }: { rec: NormalizedRecommendation; resource: NormalizedResource | null }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5">
      <div className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Evidence • Provider-sourced</div>
      <div className="mt-1 text-xs text-zinc-500">Not AI — deterministic from provider (docs/07)</div>
      <div className="mt-3 grid gap-4 md:grid-cols-2">
        <div>
          <div className="text-xs font-medium text-zinc-700">Utilization (lookback {resource?.utilization?.lookbackDays ?? 14}d)</div>
          <div className="mt-1 text-sm">
            {resource?.utilization?.cpuAverage !== undefined && <div>CPU avg {resource.utilization.cpuAverage}%</div>}
            {resource?.utilization?.memoryAverage !== undefined && <div>Memory avg {resource.utilization.memoryAverage}%</div>}
            {resource?.utilization?.iopsAverage !== undefined && <div>IOPS avg {resource.utilization.iopsAverage}</div>}
            {!resource?.utilization && <div className="text-zinc-500">No utilization data</div>}
          </div>
        </div>
        <div>
          <div className="text-xs font-medium text-zinc-700">Resource attributes</div>
          <div className="mt-1 text-xs font-mono break-all">{rec.currentConfiguration} → {rec.recommendedConfiguration}</div>
          <div className="text-xs text-zinc-500">Type {rec.resourceType} • Region {rec.region} • Source {rec.source}</div>
        </div>
        <div>
          <div className="text-xs font-medium text-zinc-700">Timestamps</div>
          <div className="text-xs">Observed {new Date(rec.observedAt).toLocaleString()}</div>
          <div className="text-xs text-zinc-500">Resource {resource ? new Date(resource.observedAt).toLocaleString() : "—"}</div>
        </div>
        <div>
          <div className="text-xs font-medium text-zinc-700">Supporting metrics</div>
          <div className="text-xs">Cost ${rec.estimatedMonthlyCostUsd.toFixed(2)} • Savings ${rec.estimatedMonthlySavingsUsd.toFixed(2)} • {rec.savingsPercentage ?? "—"}%</div>
          <div className="text-xs text-zinc-500">Provider {rec.source} • Status {rec.status ?? "open"}</div>
        </div>
      </div>
    </div>
  );
}
