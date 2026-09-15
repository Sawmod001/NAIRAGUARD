export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-7 w-40 rounded bg-zinc-200" />
      <div className="grid gap-4 md:grid-cols-3">
        <div className="h-24 rounded-xl border border-zinc-200 bg-white p-5" />
        <div className="h-24 rounded-xl border border-zinc-200 bg-white p-5" />
        <div className="h-24 rounded-xl border border-zinc-200 bg-white p-5" />
      </div>
      <div className="h-48 rounded-xl border border-zinc-200 bg-white p-6" />
      <div className="h-32 rounded-xl border border-zinc-200 bg-white p-6" />
    </div>
  );
}
