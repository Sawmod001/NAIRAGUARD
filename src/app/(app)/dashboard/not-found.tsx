export default function DashboardNotFound() {
  return (
    <div className="rounded-[8px] border border-[#E7E5E2] bg-[#FFFFFF] p-8 text-center">
      <div className="font-mono text-xs tracking-widest text-[#6B6B6E]">DASHBOARD</div>
      <h2 className="mt-2 text-sm font-semibold text-[#0E0E0F]">No spend recorded yet for this period.</h2>
      <p className="mt-1 text-sm text-[#6B6B6E]">When NairaGuard receives cost data, your spend, trend and drivers will appear here.</p>
      <div className="mt-4 flex justify-center gap-2">
        <a href="/onboarding" className="rounded-full bg-[#0E0E0F] px-4 py-1.5 text-sm font-medium text-white hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8622C]">
          Review workspace
        </a>
        <a href="/connections" className="rounded-full border border-[#E7E5E2] px-4 py-1.5 text-sm hover:bg-[#FAFAF9]">
          Connect AWS
        </a>
      </div>
    </div>
  );
}
