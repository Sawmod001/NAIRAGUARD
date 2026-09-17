"use client";

import { useRouter, useSearchParams } from "next/navigation";

const scenarios = [
  { id: "balanced-startup", label: "Balanced Startup" },
  { id: "waste-heavy-startup", label: "Waste Heavy" },
  { id: "ec2-heavy-startup", label: "EC2 Heavy" },
  { id: "fx-pressure", label: "FX Pressure" },
] as const;

export function DemoScenarioSwitcher() {
  const router = useRouter();
  const params = useSearchParams();
  const current = params.get("scenario") ?? "balanced-startup";
  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-xs tracking-widest text-zinc-500">DEMO</span>
      <select
        value={current}
        onChange={(e) => {
          const sp = new URLSearchParams(params.toString());
          sp.set("scenario", e.target.value);
          router.push(`?${sp.toString()}`);
        }}
        className="rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1 text-sm text-white"
      >
        {scenarios.map((s) => (
          <option key={s.id} value={s.id}>
            {s.label}
          </option>
        ))}
      </select>
    </div>
  );
}
