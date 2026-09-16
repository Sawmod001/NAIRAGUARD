import { OptimizationList } from "@/components/optimizations/optimization-list";
import { OptimizationFilters } from "@/components/optimizations/filters";

export default async function OptimizationsPage({ searchParams }: { searchParams: Promise<{ effort?: string; region?: string; sort?: string }> }) {
  const sp = await searchParams;
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Optimizations</h1>
        <p className="text-sm text-zinc-600">High-value opportunities • deterministic filter/sort</p>
      </div>
      <OptimizationFilters />
      <OptimizationList searchParams={sp} />
    </div>
  );
}
