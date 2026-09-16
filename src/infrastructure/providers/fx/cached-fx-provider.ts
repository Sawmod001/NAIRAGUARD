import type { FXProvider, FxRate } from "../fx-provider";
import { DemoFXProvider } from "../demo/fx-provider";

/**
 * CachedFXProvider — NG-704
 * Prevents per-render fetches, exposes timestamp, stale vs live, USD fallback.
 * In-memory TTL cache (1h) + last-known fallback. Never fabricates rate.
 */

type Cached = { rate: FxRate; cachedAt: number };

const TTL_MS = 1000 * 60 * 60; // 1h
let memory: Cached | null = null;

export class CachedFXProvider implements FXProvider {
  constructor(private readonly live: FXProvider, private readonly demo: FXProvider = new DemoFXProvider()) {}

  async getRate(): Promise<FxRate> {
    const now = Date.now();

    // 1. Fresh cache
    if (memory && now - memory.cachedAt < TTL_MS && memory.rate.expiresAt && new Date(memory.rate.expiresAt).getTime() > now) {
      return { ...memory.rate, provider: memory.rate.provider + " (cached)" };
    }

    // 2. Try live
    try {
      const liveRate = await this.live.getRate();
      memory = { rate: liveRate, cachedAt: now };
      return liveRate;
    } catch {
      // 3. Last-known (even if expired) with stale marker
      if (memory) {
        return { ...memory.rate, provider: memory.rate.provider + " (stale)" };
      }
      // 4. Demo fixture — USD still works per docs/09 fallback
      const demoRate = await this.demo.getRate();
      return { ...demoRate, provider: demoRate.provider + " (demo-fallback)" };
    }
  }

  /** Expose staleness for UI */
  static isStale(rate: FxRate): boolean {
    if (!rate.expiresAt) return Date.now() - new Date(rate.observedAt).getTime() > TTL_MS;
    return new Date(rate.expiresAt).getTime() < Date.now();
  }

  static clearCache(): void {
    memory = null;
  }
}
