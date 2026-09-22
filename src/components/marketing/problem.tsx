import { Reveal } from "@/components/ui/reveal";

export function Problem() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-[1280px] px-6 py-16 md:py-20">
        <div className="grid gap-8 md:grid-cols-[0.9fr_1.1fr]">
          <Reveal>
            <div className="font-mono text-xs tracking-[0.2em] text-zinc-500">THE CLOUD COST PROBLEM</div>
            <h2 className="font-display mt-3 text-[clamp(28px,4vw,44px)] font-semibold leading-[0.95] tracking-tight">Your infrastructure runs in AWS. Your business runs in naira.</h2>
            <div className="mt-6 overflow-hidden rounded-xl border border-zinc-200">
              <img src="/istockphoto-2214940115-612x612.jpg" alt="Business team discussing budget" className="h-64 w-full object-cover" />
              <div className="bg-zinc-900 px-3 py-2 font-mono text-xs tracking-widest text-white">HUMAN • BUDGET DECISION</div>
            </div>
          </Reveal>
          <div>
            <p className="text-sm leading-6 text-zinc-600">Cloud infrastructure is easy to deploy and difficult to understand financially. Usage grows, resources stay idle, services become over-provisioned, and the bill arrives in USD. For Nigerian teams, that number changes meaning when the naira moves.</p>
            <div className="mt-6 grid grid-cols-2 gap-4 border-t border-zinc-200 pt-6 text-sm">
              <div>
                <div className="font-mono text-xs tracking-widest text-zinc-500">USD</div>
                <div className="font-display text-lg font-semibold">AWS BILL</div>
                <div className="mt-1 h-px bg-black" />
                <div className="mt-2 text-xs text-zinc-600">Spread across services</div>
              </div>
              <div>
                <div className="font-mono text-xs tracking-widest text-orange-600">NGN</div>
                <div className="font-display text-lg font-semibold">BUSINESS BUDGET</div>
                <div className="mt-1 h-px bg-orange-500" />
                <div className="mt-2 text-xs text-zinc-600">Needs local context</div>
              </div>
            </div>
            <div className="mt-6 flex justify-center font-mono text-xs tracking-widest text-zinc-400">↓ USD → HIDDEN WASTE → NGN ↓</div>
            <div className="mt-6 rounded-xl border border-orange-200 bg-orange-50 p-4 text-sm text-zinc-700">Spend is spread • Waste invisible until investigated • Pricing evidence hard to interpret • USD needs local context</div>
          </div>
        </div>
      </div>
    </section>
  );
}
