/**
 * Shared workspace skeleton — NG-DASH-11
 * Renders on navigation for app routes without their own loading UI
 * (dashboard keeps its specific skeleton). Pure markup, no data reads.
 */
export default function AppLoading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading workspace">
      <div>
        <div className="h-7 w-48 animate-pulse rounded-md bg-stone-200" />
        <div className="mt-2 h-4 w-72 animate-pulse rounded-md bg-stone-100" />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="rounded-2xl border border-stone-200 bg-white p-5">
            <div className="h-3 w-24 animate-pulse rounded bg-stone-100" />
            <div className="mt-3 h-8 w-32 animate-pulse rounded bg-stone-200" />
            <div className="mt-2 h-3 w-40 animate-pulse rounded bg-stone-100" />
          </div>
        ))}
      </div>
      <div className="rounded-2xl border border-stone-200 bg-white p-5">
        <div className="h-3 w-32 animate-pulse rounded bg-stone-100" />
        <div className="mt-4 space-y-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-10 animate-pulse rounded-lg bg-stone-100" />
          ))}
        </div>
      </div>
    </div>
  );
}
