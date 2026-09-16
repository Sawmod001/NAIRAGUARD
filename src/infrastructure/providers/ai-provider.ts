/**
 * AIProvider — NG-201
 * Structured explanation boundary per docs/08_AI_SPEC.md
 * Mock (deterministic) + future live (model) share same contract.
 * AI never calculates savings — it explains evidence.
 */

export type AIExplainInput = {
  recommendation: {
    source: string;
    resourceType: string;
    resourceId: string;
    region: string;
    currentConfiguration: string;
    recommendedConfiguration: string;
    estimatedMonthlyCostUsd: number;
    estimatedMonthlySavingsUsd: number;
    effort: string;
    restartRequired: boolean;
    rollbackPossible: boolean;
    actionType?: string;
  };
  fx?: { rate: number; observedAt: string } | null;
  nairaImpact?: { estimatedMonthlySavingsNgn: number } | null;
};

export type AIExplanation = {
  summary: string;
  whyItMatters: string;
  recommendedNextStep: string;
  businessImpact: string;
  technicalImpact: string;
  risks: string[];
  priority: "low" | "medium" | "high";
  confidence: "low" | "medium" | "high";
  assumptions: string[];
};

export interface AIProvider {
  explain(input: AIExplainInput): Promise<AIExplanation>;
  isAvailable?(): Promise<boolean>;
}
