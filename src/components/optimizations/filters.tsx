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
      <select defaultValue={params.get("effort") ?? ""} onChange={(e) => set("effort", e.target.value)} className="rounded-md border border-zinc-200 px-2 py-1 text-sm">
        <option value="">All effort</option>
        <option value="Low">Low</option>
        <option value="Medium">Medium</option>
        <option value="High">High</option>
      </select>
      <select defaultValue={params.get("region") ?? ""} onChange={(e) => set("region", e.target.value)} className="rounded-md border border-zinc-200 px-2 py-1 text-sm">
        <option value="">All regions</option>
        <option value="eu-west-1">eu-west-1</option>
        <option value="us-east-1">us-east-1</option>
      </select>
      <select defaultValue={params.get("sort") ?? "savings"} onChange={(e) => set("sort", e.target.value)} className="rounded-md border border-zinc-200 px-2 py-1 text-sm">
        <option value="savings">Highest savings</option>
        <option value="percentage">Savings %</option>
        <option value="effort">Effort</option>
      </select>
    </div>
  );
}
