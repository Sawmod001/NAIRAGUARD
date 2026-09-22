import Link from "next/link";

/** Missing recommendation — NG-DASH-11. Rendered when detail lookup finds nothing. */
export default function OptimizationNotFound() {
  return (
    <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-8 text-center">
      <div className="font-mono text-xs tracking-widest text-stone-500">RECOMMENDATION NOT FOUND</div>
      <h2 className="mt-2 text-lg font-semibold tracking-tight">This opportunity isn&apos;t in the workspace.</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-stone-600">
        It may belong to another dataset, or a newer sync replaced it. The list always reflects current findings.
      </p>
      <Link
        href="/optimizations"
        className="mt-5 inline-block rounded-full bg-zinc-900 px-5 py-2 text-sm font-medium text-white hover:bg-zinc-700"
      >
        Back to opportunities
      </Link>
    </div>
  );
}
