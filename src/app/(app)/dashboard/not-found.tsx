export default function DashboardNotFound() {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-8 text-center">
      <h2 className="text-sm font-semibold">No dashboard data</h2>
      <p className="mt-1 text-sm text-zinc-600">No cost data available for this period.</p>
    </div>
  );
}
