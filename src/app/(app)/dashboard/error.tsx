"use client";

export default function DashboardError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-6">
      <h2 className="text-sm font-semibold text-red-800">Could not load dashboard</h2>
      <p className="mt-1 text-sm text-red-700">{error.message || "Something went wrong."}</p>
      <button onClick={reset} className="mt-4 rounded-md bg-red-700 px-4 py-1.5 text-sm font-medium text-white hover:bg-red-800">
        Retry
      </button>
    </div>
  );
}
