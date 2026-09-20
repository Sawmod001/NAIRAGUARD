import type { FxQuote, NairaEquivalent } from "./types";

/**
 * Naira Conversion — NG-303 Deterministic
 * NGN = USD × rate  (docs/07:2, docs/01:110)
 * Keeps USD, adds estimated NGN, explicit rate/timestamp/source.
 */

function toCents(usd: number) { return Math.round(usd * 100); }

export function toNairaEquivalent(usd: number, fx: FxQuote): NairaEquivalent {
  if (!isFinite(usd) || !isFinite(fx.rate)) throw new Error("Invalid conversion input");
  const usdCents = toCents(usd);
  // NGN kobo = usdCents * rate (since usdCents/100 * rate *100)
  const nairaKobo = Math.round(usdCents * fx.rate);
  return {
    usd: Math.round(usdCents) / 100,
    naira: Math.round(nairaKobo) / 100,
    usdCents,
    nairaKobo,
    rate: fx.rate,
    observedAt: fx.observedAt,
    source: fx.source,
    label: "Estimated Naira equivalent",
  };
}

export function toNairaEquivalentFromCents(usdCents: number, fx: FxQuote): NairaEquivalent {
  if (!Number.isInteger(usdCents) || !isFinite(fx.rate)) throw new Error("Invalid conversion input");
  const nairaKobo = Math.round(usdCents * fx.rate);
  return {
    usd: Math.round(usdCents) / 100,
    naira: Math.round(nairaKobo) / 100,
    usdCents,
    nairaKobo,
    rate: fx.rate,
    observedAt: fx.observedAt,
    source: fx.source,
    label: "Estimated Naira equivalent",
  };
}

export function convertUsdToNgn(usd: number, rate: number): number {
  return Math.round(usd * rate * 100) / 100;
}

export function convertCentsToKobo(usdCents: number, rate: number): number {
  return Math.round(usdCents * rate);
}

/**
 * Display label for an FX source — NG-DEMO-07.
 * Provider contracts keep raw ids (e.g. "demo-fixture"); public UI shows neutral provenance.
 */
export function displayFxSource(source: string): string {
  return source === "demo-fixture" ? "recorded rate" : source;
}

/** For display: always show USD + estimated NGN + rate context. */
export function formatNairaEquivalent(eq: NairaEquivalent): string {
  return `Estimated Naira equivalent: ₦${eq.naira.toLocaleString()} at ₦${eq.rate.toLocaleString()}/USD (${eq.source}, ${eq.observedAt.slice(0, 10)}) — USD $${eq.usd.toLocaleString()}`;
}
