"use client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

type Props = { daily: { date: string; amount: number }[]; total: number };

export function SpendChart({ daily, total }: Props) {
  const data = daily.map((d) => ({ date: d.date, amount: d.amount }));
  const max = Math.max(...daily.map((d) => d.amount), 0);
  const tickFormatter = (v: number) => `$${Math.round(v).toLocaleString()}`;

  return (
    <div role="img" aria-label={`Daily spend total $${total.toLocaleString()}`}>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
          <CartesianGrid stroke="#E7E5E2" vertical={false} strokeDasharray="0" />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#6B6B6E" }} axisLine={false} tickLine={false} minTickGap={24} />
          <YAxis width={56} tick={{ fontSize: 11, fill: "#6B6B6E" }} axisLine={false} tickLine={false} tickFormatter={tickFormatter} domain={[0, max * 1.1 || 10]} ticks={[0, Math.round(max * 0.33), Math.round(max * 0.66), Math.round(max)]} />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.[0]) return null;
              const p = payload[0] as { payload: { date: string; amount: number }; value: number };
              return (
                <div className="rounded-[8px] border border-[#E7E5E2] bg-[#FFFFFF] px-3 py-2 text-xs shadow">
                  <div className="font-mono text-[#6B6B6E]">{p.payload.date}</div>
                  <div className="font-medium text-[#0E0E0F] tabular-nums">${p.value.toFixed(2)}</div>
                </div>
              );
            }}
          />
          <Bar dataKey="amount" fill="#0E0E0F" fillOpacity={0.15} activeBar={{ fill: "#E8622C", fillOpacity: 1 }} radius={[4, 4, 0, 0]} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-1 flex justify-between text-[11px] text-[#6B6B6E]">
        <span>{daily[0]?.date}</span>
        <span>{daily[daily.length - 1]?.date}</span>
      </div>
    </div>
  );
}
