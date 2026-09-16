import type { FXProvider, FxRate } from "../fx-provider";
import fs from "fs";
import path from "path";

/**
 * DemoFXProvider — NG-702
 * Fixed fixture rates, clearly marked, configurable via data/fx/demo-rates.json or data/scenarios.
 * App never hardcodes FX — consumes via FXProvider.
 */

type DemoRatesFile = { base: string; quote: string; rates: { date: string; rate: number }[]; note: string };

function loadDemoRates(): DemoRatesFile {
  const p = path.join(process.cwd(), "data", "fx", "demo-rates.json");
  return JSON.parse(fs.readFileSync(p, "utf8")) as DemoRatesFile;
}

export class DemoFXProvider implements FXProvider {
  constructor(private readonly scenarioId?: string) {}

  async getRate(): Promise<FxRate> {
    // If scenario specified, use its fx; else use latest demo-rates.json
    if (this.scenarioId) {
      try {
        const scen = JSON.parse(fs.readFileSync(path.join(process.cwd(), "data", "scenarios", `${this.scenarioId}.json`), "utf8"));
        if (scen.fx) {
          return {
            base: "USD",
            quote: "NGN",
            rate: scen.fx.usdNgn,
            provider: scen.fx.provider ?? "demo-fixture",
            observedAt: scen.fx.observedAt,
            expiresAt: null,
          };
        }
      } catch {}
    }
    const file = loadDemoRates();
    const latest = file.rates[file.rates.length - 1]!;
    return {
      base: file.base,
      quote: file.quote,
      rate: latest.rate,
      provider: "demo-fixture",
      observedAt: new Date(latest.date).toISOString(),
      expiresAt: null,
    };
  }

  async getHistory(): Promise<FxRate[]> {
    const file = loadDemoRates();
    return file.rates.map((r) => ({
      base: file.base,
      quote: file.quote,
      rate: r.rate,
      provider: "demo-fixture",
      observedAt: new Date(r.date).toISOString(),
      expiresAt: null,
    }));
  }
}
