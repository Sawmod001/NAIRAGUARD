"use client";

export default function DashboardError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="rounded-[8px] border border-[#E7E5E2] bg-[#FFFFFF] p-6">
      <div className="font-mono text-xs tracking-widest text-[#6B6B6E]">DASHBOARD</div>
      <h2 className="mt-2 text-sm font-semibold text-[#0E0E0F]">We couldn&apos;t refresh your AWS cost data.</h2>
      <p className="mt-1 text-sm text-[#6B6B6E]">Your previous data is still available. The connection may need attention.</p>
      <p className="mt-1 text-xs text-[#6B6B6E]">{error.message ? `Detail: ${error.message}` : "Try again or check connection."}</p>
      <div className="mt-4 flex gap-2">
        <button onClick={reset} className="rounded-full bg-[#0E0E0F] px-4 py-1.5 text-sm font-medium text-white hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8622C]">
          Retry
        </button>
        <a href="/connections" className="rounded-full border border-[#E7E5E2] px-4 py-1.5 text-sm hover:bg-[#FAFAF9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8622C]">
          Check connection
        </a>
      </div>
    </div>
  );
}
