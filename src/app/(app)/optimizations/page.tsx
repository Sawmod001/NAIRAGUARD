import { OptimizationList } from "@/components/optimizations/optimization-list";

export default async function OptimizationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Optimizations</h1>
        <p className="text-sm text-zinc-600">High-value opportunities • USD + estimated NGN • prioritized</p>
      </div>
      <OptimizationList />
    </div>
  );
}
