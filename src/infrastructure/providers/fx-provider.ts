/**
 * FXProvider — NG-201
 * USD/NGN (MVP) conversion boundary per docs/09_FX_SPEC.md
 * Demo (fixture) + future live (external API) share same contract.
 */

export type FxRate = {
  base: string; // "USD"
  quote: string; // "NGN"
  rate: number; // e.g. 1550
  provider: string; // e.g. "demo-fixture" | "exchangerate.fun"
  observedAt: string; // ISO
  expiresAt?: string | null; // ISO
};

export type FxQuery = {
  base?: string; // default USD
  quote?: string; // default NGN
};

export interface FXProvider {
  getRate(query?: FxQuery): Promise<FxRate>;
  getHistory?(query?: FxQuery & { days?: number }): Promise<FxRate[]>;
}
