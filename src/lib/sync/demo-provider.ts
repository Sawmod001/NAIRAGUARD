import { getDemoDataset } from "@/infrastructure/providers/demo/registry";
import type { SyncProvider } from "@/lib/sync/runner";

/**
 * Demo sync provider — NG-SYNC-02
 * Loads the seeded dataset and reports the record counts that NG-COST-02/03
 * will persist. No writes yet: proves the runner end-to-end on real data.
 */
export function createDemoSyncProvider(scenarioId = "balanced-startup"): SyncProvider {
  return {
    source: "DEMO",
    async fetch() {
      const dataset = getDemoDataset(scenarioId);
      return {
        counts: {
          days: dataset.cost.daily.length,
          services: dataset.cost.serviceBreakdown.length,
          recommendations: dataset.recommendations.length,
        },
      };
    },
  };
}
