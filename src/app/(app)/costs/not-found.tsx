/**
 * Empty costs workspace — NG-ONBOARD-01
 * Rendered when the org has neither a live connection nor demo activity,
 * instead of provider figures nobody chose. Matches the dashboard empty state.
 */
export default function CostsNotFound() {
  return (
    <div className="rounded-[8px] border border-[#E7E5E2] bg-[#FFFFFF] p-8 text-center">
      <div className="font-mono text-xs tracking-widest text-[#6B6B6E]">COSTS</div>
      <h2 className="mt-2 text-sm font-semibold text-[#0E0E0F]">No cost data in this workspace yet.</h2>
      <p className="mt-1 text-sm text-[#6B6B6E]">Connect an AWS account for live spend, or explore with a guided dataset first.</p>
      <div className="mt-4 flex justify-center gap-2">
        <a href="/connections" className="rounded-full bg-[#0E0E0F] px-4 py-1.5 text-sm font-medium text-white hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8622C]">
          Connect AWS
        </a>
        <a href="/onboarding" className="rounded-full border border-[#E7E5E2] px-4 py-1.5 text-sm hover:bg-[#FAFAF9]">
          Try Demo
        </a>
      </div>
    </div>
  );
}
