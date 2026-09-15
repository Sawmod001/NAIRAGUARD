import type { PrioritizationInput, PrioritizedRecommendation } from "./types";

/**
 * NairaGuard Prioritization Score — NG-304 Deterministic, no AI
 *
 * Formula (documented, explainable):
 *   score = (savingsUsd * 1.0) + (savingsPct * 2.0) + effortBonus + restartPenalty + rollbackBonus
 *   - savingsUsd: primary (dollar impact)
 *   - savingsPct: weight 2 (percentage efficiency)
 *   - effortBonus: Low +20, Medium +0, High -15
 *   - restartPenalty: restartRequired ? -10 : 0
 *   - rollbackBonus: rollbackPossible ? +10 : -5
 *
 * Higher score = higher priority. Tie-break: larger savingsUsd, then externalId lex order (deterministic).
 * Label: "NairaGuard prioritization score" (not AWS).
 */

function effortBonus(effort: PrioritizationInput["effort"]): number {
  if (effort === "Low") return 20;
  if (effort === "Medium") return 0;
  return -15;
}

function computeScore(r: PrioritizationInput): number {
  const savingsUsd = r.estimatedMonthlySavingsUsd ?? 0;
  const pct = r.savingsPercentage ?? 0;
  const s = savingsUsd * 1.0 + pct * 2.0 + effortBonus(r.effort) + (r.restartRequired ? -10 : 0) + (r.rollbackPossible ? 10 : -5);
  return Math.round(s * 100) / 100;
}

function reasonFor(r: PrioritizationInput, score: number): string {
  const parts: string[] = [];
  parts.push(`$${r.estimatedMonthlySavingsUsd}/mo`);
  if (r.savingsPercentage) parts.push(`${r.savingsPercentage}%`);
  parts.push(`${r.effort} effort`);
  if (r.restartRequired) parts.push("restart required");
  if (!r.rollbackPossible) parts.push("rollback limited");
  return `${parts.join(" • ")} → NairaGuard score ${score}`;
}

export function prioritizeRecommendations<T extends PrioritizationInput>(items: T[]): PrioritizedRecommendation<T>[] {
  const scored = items.map((r) => {
    const score = computeScore(r);
    return { ...r, nairaGuardScore: score, reason: reasonFor(r, score) } as PrioritizedRecommendation<T>;
  });

  scored.sort((a, b) => {
    if (b.nairaGuardScore !== a.nairaGuardScore) return b.nairaGuardScore - a.nairaGuardScore;
    if (b.estimatedMonthlySavingsUsd !== a.estimatedMonthlySavingsUsd) return b.estimatedMonthlySavingsUsd - a.estimatedMonthlySavingsUsd;
    return a.externalId.localeCompare(b.externalId);
  });

  return scored.map((r, i) => ({ ...r, rank: i + 1 }));
}

export function getPrioritizationFormula(): string {
  return "NairaGuard score = savingsUsd*1 + savingsPct*2 + effort(Low+20/Med+0/High-15) + restart(-10 if required) + rollback(+10 if possible/-5)";
}
