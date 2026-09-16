import { MockAIProvider } from "@/infrastructure/providers/ai/mock-ai-provider";
import { convertUsdToNgn } from "@/domain/fx";
import type { NormalizedRecommendation } from "@/infrastructure/providers/optimization-provider";

/**
 * AI Explanation — NG-605
 * Structured, Zod-validated, graceful failure — deterministic values remain visible without AI.
 */

export async function AIExplanationCard({ rec, fxRate }: { rec: NormalizedRecommendation; fxRate: number | null }) {
  const nairaImpact = fxRate ? { estimatedMonthlySavingsNgn: convertUsdToNgn(rec.estimatedMonthlySavingsUsd, fxRate) } : null;
  const fx = fxRate ? { rate: fxRate, observedAt: rec.observedAt } : null;

  try {
    const provider = new MockAIProvider();
    const explanation = await provider.explain({
      recommendation: {
        source: rec.source,
        resourceType: rec.resourceType,
        resourceId: rec.resourceId,
        region: rec.region,
        currentConfiguration: rec.currentConfiguration,
        recommendedConfiguration: rec.recommendedConfiguration,
        estimatedMonthlyCostUsd: rec.estimatedMonthlyCostUsd,
        estimatedMonthlySavingsUsd: rec.estimatedMonthlySavingsUsd,
        effort: rec.effort,
        restartRequired: rec.restartRequired,
        rollbackPossible: rec.rollbackPossible,
        actionType: rec.actionType,
      },
      fx,
      nairaImpact,
    });

    return (
      <div className="rounded-xl border border-violet-200 bg-violet-50 p-5">
        <div className="text-xs font-semibold uppercase tracking-widest text-violet-700">AI explanation • Mock • Grounded in evidence</div>
        <div className="mt-2 text-sm font-medium">{explanation.summary}</div>
        <div className="mt-2 text-sm">{explanation.whyItMatters}</div>
        <div className="mt-3">
          <div className="text-xs font-semibold text-violet-700">Why it matters</div>
          <div className="text-sm">{explanation.whyItMatters}</div>
        </div>
        <div className="mt-2">
          <div className="text-xs font-semibold text-violet-700">Recommended next step</div>
          <div className="text-sm">{explanation.recommendedNextStep}</div>
        </div>
        <div className="mt-2 grid gap-2 md:grid-cols-2">
          <div>
            <div className="text-xs font-semibold text-violet-700">Business impact</div>
            <div className="text-sm">{explanation.businessImpact}</div>
          </div>
          <div>
            <div className="text-xs font-semibold text-violet-700">Technical impact</div>
            <div className="text-sm">{explanation.technicalImpact}</div>
          </div>
        </div>
        <div className="mt-2">
          <div className="text-xs font-semibold text-violet-700">Risks</div>
          <ul className="list-disc pl-5 text-sm">
            {explanation.risks.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </div>
        <div className="mt-2 text-xs text-violet-700">Priority {explanation.priority} • Confidence {explanation.confidence} • Assumptions: {explanation.assumptions.join("; ")}</div>
      </div>
    );
  } catch (e: unknown) {
    // Graceful failure — deterministic savings still visible via parent page
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
        <div className="text-xs font-semibold uppercase tracking-widest text-amber-700">AI explanation unavailable</div>
        <div className="mt-1 text-sm text-amber-700">Could not generate AI explanation. Your deterministic savings remain visible. Try again.</div>
        <div className="mt-1 text-xs text-amber-700">{e instanceof Error ? e.message : "Unknown error"}</div>
      </div>
    );
  }
}
