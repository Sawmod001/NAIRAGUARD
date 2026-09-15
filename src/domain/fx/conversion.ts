import type { FxQuote, NairaEquivalent } from "./types";

/**
 * Naira Conversion — NG-303 Deterministic
 * NGN = USD × rate  (docs/07:2, docs/01:110)
 * Keeps USD, adds estimated NGN, explicit rate/timestamp/source.
 */

export function toNairaEquivalent(usd: number, fx: FxQuote): NairaEquivalent {
  if (!isFinite(usd) || !isFinite(fx.rate)) throw new Error("Invalid conversion input");
  return {
    usd: Math.round(usd * 100) / 100,
    naira: Math.round(usd * fx.rate * 100) / 100,
    rate: fx.rate,
    observedAt: fx.observedAt,
    source: fx.source,
    label: "Estimated Naira equivalent",
  };
}

export function convertUsdToNgn(usd: number, rate: number): number {
  return Math.round(usd * rate * 100) / 100;
}

/** For display: always show USD + estimated NGN + rate context. */
export function formatNairaEquivalent(eq: NairaEquivalent): string {
  return `Estimated Naira equivalent: ₦${eq.naira.toLocaleString()} at ₦${eq.rate.toLocaleString()}/USD (${eq.source}, ${eq.observedAt.slice(0, 10)}) — USD $${eq.usd.toLocaleString()}`;
}
