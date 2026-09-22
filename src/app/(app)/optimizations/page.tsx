import { OptimizationList } from "@/components/optimizations/optimization-list";
import { OptimizationFilters } from "@/components/optimizations/filters";

export default async function OptimizationsPage({ searchParams }: { searchParams: Promise<{ effort?: string; region?: string; sort?: string; scenario?: string }> }) {
  const sp = await searchParams;
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Optimization opportunities</h1>
        <p className="text-sm text-stone-500">Review recommendations that may reduce your AWS spend. Each row shows source, evidence, and estimated savings — deterministic math, no invented numbers.</p>
        <p className="mt-1 text-xs text-stone-400">USD = provider truth · NGN = estimate at recorded FX rate</p>
      </div>
      <OptimizationFilters />
      <OptimizationList searchParams={sp} />
    </div>
  );
}
