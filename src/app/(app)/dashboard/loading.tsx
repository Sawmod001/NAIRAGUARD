export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-7 w-40 rounded bg-[#E7E5E2]" />
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <div className="h-28 rounded-[8px] border border-[#E7E5E2] bg-white p-5" />
        <div className="h-28 rounded-[8px] border border-[#E7E5E2] bg-white p-5" />
        <div className="h-28 rounded-[8px] border border-[#E7E5E2] bg-white p-5" />
        <div className="h-28 rounded-[8px] border border-[#E7E5E2] bg-white p-5" />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="h-64 rounded-[8px] border border-[#E7E5E2] bg-white p-6 lg:col-span-2" />
        <div className="h-64 rounded-[8px] border border-[#E7E5E2] bg-white p-6" />
      </div>
      <div className="h-32 rounded-[8px] border border-[#E7E5E2] bg-white p-6" />
    </div>
  );
}
