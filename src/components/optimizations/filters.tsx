"use client";

import { useRouter, useSearchParams } from "next/navigation";

export function OptimizationFilters() {
  const router = useRouter();
  const params = useSearchParams();

  function set(key: string, value: string) {
    const sp = new URLSearchParams(params.toString());
    if (!value) sp.delete(key);
    else sp.set(key, value);
    router.push(`/optimizations?${sp.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-2">
      <select aria-label="Filter by effort" defaultValue={params.get("effort") ?? ""} onChange={(e) => set("effort", e.target.value)} className="rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-sm">
        <option value="">All effort</option>
        <option value="Low">Low</option>
        <option value="Medium">Medium</option>
        <option value="High">High</option>
      </select>
      <select aria-label="Filter by region" defaultValue={params.get("region") ?? ""} onChange={(e) => set("region", e.target.value)} className="rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-sm">
        <option value="">All regions</option>
        <option value="eu-west-1">eu-west-1</option>
        <option value="us-east-1">us-east-1</option>
      </select>
      <select aria-label="Sort" defaultValue={params.get("sort") ?? "savings"} onChange={(e) => set("sort", e.target.value)} className="rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-sm">
        <option value="savings">Highest savings</option>
        <option value="percentage">Savings %</option>
        <option value="effort">Lowest effort</option>
      </select>
    </div>
  );
}
