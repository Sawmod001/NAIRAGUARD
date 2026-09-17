"use client";
import { useState } from "react";

export function SpendChart({ daily, total }: { daily: { date: string; amount: number }[]; total: number }) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const max = Math.max(...daily.map((d) => d.amount), 1);
  const ticks = [max, max * 0.66, max * 0.33, 0];
  return (
    <div className="relative">
      {/* y-axis + grid */}
      <div className="absolute left-0 top-0 bottom-6 flex w-full flex-col justify-between py-1 text-[11px] text-[#6B6B6E]">
        {ticks.map((t, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-12 text-right tabular-nums">${Math.round(t).toLocaleString()}</span>
            <span className="h-px flex-1 bg-[#E7E5E2]" />
          </div>
        ))}
      </div>
      <div className="ml-14 flex h-32 items-end gap-[3px] pt-2" role="img" aria-label={`Daily spend total $${total.toLocaleString()}`}>
        {daily.map((d, idx) => {
          const h = max ? (d.amount / max) * 100 : 0;
          const isHover = hoverIdx === idx;
          return (
            <div
              key={d.date}
              className={`flex-1 rounded-t transition-colors ${isHover ? "bg-[#E8622C]" : "bg-[#0E0E0F]/15 hover:bg-[#0E0E0F]/25"}`}
              style={{ height: `${h}%` }}
              onMouseEnter={() => setHoverIdx(idx)}
              onMouseLeave={() => setHoverIdx(null)}
              title={`${d.date} $${d.amount.toFixed(2)}`}
            />
          );
        })}
      </div>
      {hoverIdx !== null && (
        <div className="pointer-events-none absolute left-14 top-0 rounded-md border border-[#E7E5E2] bg-white px-2 py-1 text-xs shadow">
          {daily[hoverIdx]!.date} · ${daily[hoverIdx]!.amount.toFixed(2)}
        </div>
      )}
      <div className="ml-14 mt-2 flex justify-between text-[11px] text-[#6B6B6E]">
        <span>{daily[0]?.date}</span><span>{daily[daily.length - 1]?.date}</span>
      </div>
    </div>
  );
}
