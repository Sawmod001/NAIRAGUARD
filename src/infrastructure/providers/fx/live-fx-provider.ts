import type { FXProvider, FxRate } from "../fx-provider";
import { AppError } from "@/lib/errors/app-error";
import { ErrorCode } from "@/lib/errors/codes";

/**
 * LiveFXProvider — NG-703
 * Isolated behind FXProvider, credentials server-only (process.env.FX_PROVIDER_URL/KEY), failure handled, source/timestamp retained.
 * Example API: exchangerate.fun (no key) or currencyapi.com (key). Fetch at service boundary, not per render.
 */

export class LiveFXProvider implements FXProvider {
  constructor(private readonly base: string = "USD", private readonly quote: string = "NGN") {}

  async getRate(): Promise<FxRate> {
    const url = process.env.FX_PROVIDER_URL;
    const key = process.env.FX_PROVIDER_API_KEY;

    // Demo fallback if no live URL configured — caller can catch and fallback to cache/Demo per NG-704
    if (!url) {
      throw new AppError({ code: ErrorCode.FX_UNAVAILABLE, message: "Live FX URL not configured." });
    }

    const endpoint = new URL(url);
    // Support both exchangerate.fun and currencyapi style — keep generic
    if (!endpoint.searchParams.has("base") && this.base) endpoint.searchParams.set("base", this.base);
    if (key) endpoint.searchParams.set("apikey", key);

    try {
      const res = await fetch(endpoint.toString(), { cache: "no-store" });
      if (!res.ok) throw new Error(`FX ${res.status}`);
      const data = (await res.json()) as unknown;

      // Try common shapes: { rates: { NGN: 1550 } } or { data: { NGN: { value: 1550 } } }
      const rate = extractRate(data, this.quote);
      if (!rate || !isFinite(rate)) throw new Error("Invalid FX payload");

      return {
        base: this.base,
        quote: this.quote,
        rate,
        provider: endpoint.hostname,
        observedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 1000 * 60 * 60).toISOString(), // 1h
      };
    } catch (e: unknown) {
      throw new AppError({ code: ErrorCode.FX_UNAVAILABLE, message: "Live FX unavailable.", cause: e });
    }
  }
}

function extractRate(data: unknown, quote: string): number | null {
  if (!data || typeof data !== "object") return null;
  const d = data as Record<string, unknown>;
  // { rates: { NGN: 1550 } }
  if (d.rates && typeof d.rates === "object") {
    const r = (d.rates as Record<string, unknown>)[quote];
    if (typeof r === "number") return r;
  }
  // { data: { NGN: { value: 1550 } } }
  if (d.data && typeof d.data === "object") {
    const q = (d.data as Record<string, unknown>)[quote];
    if (q && typeof q === "object" && "value" in q) {
      const v = (q as Record<string, unknown>).value;
      if (typeof v === "number") return v;
    }
  }
  // { NGN: 1550 }
  if (typeof d[quote] === "number") return d[quote] as number;
  return null;
}
