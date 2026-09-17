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
      <div className="rounded-2xl border border-stone-200 bg-white p-6">
        <div className="font-mono text-xs tracking-widest text-stone-500">AI EXPLANATION · MOCK · GROUNDED IN EVIDENCE</div>
        <div className="mt-2 text-sm font-medium leading-6">{explanation.summary}</div>
        <div className="mt-2 text-sm leading-6 text-stone-600">AI explains the evidence below. It does not invent savings — USD values are deterministic above.</div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <div className="font-mono text-xs tracking-widest text-stone-500">WHY IT MATTERS</div>
            <div className="mt-1 text-sm leading-6">{explanation.whyItMatters}</div>
          </div>
          <div>
            <div className="font-mono text-xs tracking-widest text-stone-500">NEXT STEP</div>
            <div className="mt-1 text-sm leading-6">{explanation.recommendedNextStep}</div>
          </div>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <div className="font-mono text-xs tracking-widest text-stone-500">BUSINESS IMPACT</div>
            <div className="mt-1 text-sm leading-6">{explanation.businessImpact}</div>
          </div>
          <div>
            <div className="font-mono text-xs tracking-widest text-stone-500">TECHNICAL IMPACT</div>
            <div className="mt-1 text-sm leading-6">{explanation.technicalImpact}</div>
          </div>
        </div>
        <div className="mt-4">
          <div className="font-mono text-xs tracking-widest text-stone-500">RISKS</div>
          <ul className="list-disc pl-5 text-sm leading-6 text-stone-700">
            {explanation.risks.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </div>
        <div className="mt-4 text-xs text-stone-500">Priority {explanation.priority} · Confidence {explanation.confidence} · Assumptions: {explanation.assumptions.join("; ")}</div>
      </div>
    );
  } catch (e: unknown) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
        <div className="font-mono text-xs tracking-widest text-amber-700">AI EXPLANATION UNAVAILABLE</div>
        <div className="mt-1 text-sm text-amber-700">Could not generate explanation. Deterministic savings above remain authoritative. Retry.</div>
        <div className="mt-1 text-xs text-amber-700">{e instanceof Error ? e.message : "Unknown error"}</div>
      </div>
    );
  }
}
