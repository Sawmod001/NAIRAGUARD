import { toNairaEquivalent } from "@/domain/fx";

/**
 * NairaEquivalent Card — NG-403
 * Shows USD (truth), estimated NGN, rate, timestamp/source, estimated language.
 * Handles stale (>24h) and unavailable (fx null) safely — USD remains visible per docs/09 fallback.
 */

type FxContext = { rate: number; observedAt: string; source: string } | null;

export function NairaEquivalentCard({ usd, fx }: { usd: number; fx: FxContext }) {
  if (!fx) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
        <div className="text-xs font-semibold uppercase tracking-widest text-amber-700">Naira impact</div>
        <div className="mt-2 text-sm font-medium">USD ${usd.toLocaleString()}</div>
        <div className="mt-1 text-xs text-amber-700">FX unavailable — showing USD only. NGN estimate will return when rate is available.</div>
      </div>
    );
  }

  const isStale = Date.now() - new Date(fx.observedAt).getTime() > 1000 * 60 * 60 * 24;
  const eq = toNairaEquivalent(usd, fx);

  return (
    <div className={`rounded-xl border p-5 ${isStale ? "border-amber-200 bg-amber-50" : "border-zinc-200 bg-white"}`}>
      <div className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Estimated Naira equivalent</div>
      <div className="mt-2 text-xs text-zinc-500">USD (source truth) • NGN is estimate</div>
      <div className="mt-2">
        <div className="text-sm text-zinc-600">USD ${eq.usd.toLocaleString()}</div>
        <div className="text-lg font-semibold">₦{eq.naira.toLocaleString()} <span className="text-xs font-normal text-zinc-500">estimated</span></div>
      </div>
      <div className="mt-2 text-xs text-zinc-500">
        at ₦{eq.rate.toLocaleString()}/USD • {eq.source} • {eq.observedAt.slice(0, 10)}
        {isStale && <span className="ml-2 rounded bg-amber-200 px-1.5 py-0.5 text-amber-800">stale — last known</span>}
      </div>
      <div className="mt-1 text-xs italic text-zinc-500">Not an exact bank charge — uses rate above.</div>
    </div>
  );
}
