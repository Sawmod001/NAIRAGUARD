/**
 * FX Domain Types — NG-303
 * Explicit rate/timestamp/source per docs/07:7, never hide USD.
 */

export type FxQuote = {
  rate: number; // USD/NGN e.g. 1550
  observedAt: string; // ISO
  source: string; // e.g. "demo-fixture"
  base?: string; // "USD"
  quote?: string; // "NGN"
};

export type NairaEquivalent = {
  usd: number; // dollars
  naira: number; // naira (estimated) — derived for display
  usdCents: number; // authoritative cents
  nairaKobo: number; // authoritative kobo
  rate: number;
  observedAt: string;
  source: string;
  label: "Estimated Naira equivalent";
};
