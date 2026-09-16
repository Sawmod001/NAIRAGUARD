"use client";

import { useState, useMemo } from "react";

/**
 * Interactive Visualization — NG-904 Meaningful, not decorative
 * Scenario + FX slider shows USD → NGN impact, deterministic calc, communicates product value.
 * No heavy deps, accessible, respects reduced motion.
 */

const scenarios = [
  { id: "balanced-startup", label: "Balanced", spend: 1378, savings: 138 },
  { id: "waste-heavy-startup", label: "Waste-heavy", spend: 2136, savings: 260 },
  { id: "ec2-heavy-startup", label: "EC2-heavy", spend: 3070, savings: 340 },
  { id: "storage-heavy-startup", label: "Storage", spend: 2306, savings: 180 },
  { id: "fx-pressure", label: "FX Pressure", spend: 1557, savings: 95 },
] as const;

export function InteractiveViz() {
  const [scenarioId, setScenarioId] = useState<string>("balanced-startup");
  const [fx, setFx] = useState<number>(1550);

  const scen = useMemo(() => scenarios.find((s) => s.id === scenarioId) ?? scenarios[0]!, [scenarioId]);
  const nairaSpend = useMemo(() => Math.round(scen.spend * fx), [scen, fx]);
  const nairaSavings = useMemo(() => Math.round(scen.savings * fx), [scen, fx]);

  return (
    <section className="mx-auto max-w-6xl rounded-2xl border border-zinc-200 bg-zinc-50 p-6 md:p-8">
      <div className="text-xs uppercase tracking-widest text-zinc-500">Interactive • Product value</div>
      <h3 className="mt-2 text-lg font-semibold">See Naira impact shift with scenario & FX</h3>
      <p className="text-sm text-zinc-600">USD truth × rate = estimated NGN. Deterministic, not AI.</p>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div>
          <label className="text-xs font-medium">Scenario</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {scenarios.map((s) => (
              <button
                key={s.id}
                onClick={() => setScenarioId(s.id)}
                aria-pressed={scenarioId === s.id}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium ${scenarioId === s.id ? "bg-black text-white border-black" : "bg-white hover:bg-zinc-100"}`}
              >
                {s.label}
              </button>
            ))}
          </div>
          <div className="mt-4">
            <label className="text-xs font-medium">FX rate: ₦{fx.toLocaleString()}/USD</label>
            <input type="range" min={1400} max={1700} step={10} value={fx} onChange={(e) => setFx(Number(e.target.value))} className="mt-2 w-full" aria-label="FX rate slider" />
            <div className="flex justify-between text-xs text-zinc-500">
              <span>1,400</span>
              <span>1,700</span>
            </div>
          </div>
        </div>

        <div className="grid gap-3">
          <div className="rounded-xl border border-zinc-200 bg-white p-4">
            <div className="text-xs text-zinc-500">Total spend • USD</div>
            <div className="text-xl font-semibold">${scen.spend.toLocaleString()}</div>
            <div className="text-sm font-medium text-orange-600">₦{nairaSpend.toLocaleString()} estimated</div>
          </div>
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <div className="text-xs text-emerald-700">Potential savings</div>
            <div className="text-xl font-semibold text-emerald-700">${scen.savings.toLocaleString()}/mo</div>
            <div className="text-sm font-medium text-emerald-700">₦{nairaSavings.toLocaleString()} est.</div>
          </div>
        </div>
      </div>
    </section>
  );
}
