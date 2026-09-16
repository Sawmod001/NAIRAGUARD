import type { AIProvider, AIExplainInput, AIExplanation } from "../ai-provider";
import { aiExplanationSchema } from "@/schemas/ai";

/**
 * MockAIProvider — NG-605 Deterministic for dev, validates via zod
 * Never invents savings — uses supplied USD/NGN exactly.
 */

export class MockAIProvider implements AIProvider {
  async explain(input: AIExplainInput): Promise<AIExplanation> {
    const rec = input.recommendation;
    const naira = input.nairaImpact ? ` (≈₦${input.nairaImpact.estimatedMonthlySavingsNgn.toLocaleString()} at ₦${input.fx?.rate ?? 1550}/USD)` : "";
    const raw: AIExplanation = {
      summary: `${rec.resourceType} ${rec.resourceId} in ${rec.region} can be optimized via ${rec.actionType ?? rec.source} from ${rec.currentConfiguration} to ${rec.recommendedConfiguration}.`,
      whyItMatters: `Provider ${rec.source} flagged this ${rec.resourceType} as over-provisioned. Estimated savings $${rec.estimatedMonthlySavingsUsd.toFixed(2)}/mo${naira} — deterministic, not AI-calculated.`,
      recommendedNextStep: `Verify utilization (CPU/memory lookback), test ${rec.recommendedConfiguration} in non-prod, plan restart ${rec.restartRequired ? "required" : "not required"} and rollback ${rec.rollbackPossible ? "possible" : "limited"}.`,
      businessImpact: `Potential $${rec.estimatedMonthlySavingsUsd.toFixed(2)}/mo reduction in cloud spend; Naira impact depends on FX rate.`,
      technicalImpact: `Action ${rec.actionType ?? rec.source} with ${rec.effort} effort; restart ${rec.restartRequired ? "required" : "none"}; check CloudWatch before applying.`,
      risks: [
        rec.restartRequired ? "Restart will cause brief downtime — schedule maintenance window." : "No restart, lower risk.",
        rec.rollbackPossible ? "Rollback possible — keep snapshot." : "Rollback limited — back up first.",
        "Validate performance — rightsizing may affect latency under peak load.",
      ],
      priority: rec.estimatedMonthlySavingsUsd > 100 ? "high" : rec.estimatedMonthlySavingsUsd > 20 ? "medium" : "low",
      confidence: "medium",
      assumptions: ["Savings assume similar usage as lookback", "FX rate may vary — NGN is estimate"],
    };
    // Zod validation — ensures structured output, malformed -> throw for graceful handling
    return aiExplanationSchema.parse(raw);
  }

  async isAvailable(): Promise<boolean> {
    return true;
  }
}
