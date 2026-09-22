"use client";

import { useEffect } from "react";

/**
 * Shared workspace error boundary — NG-DASH-11
 * Catches render/data failures for app routes without their own error UI
 * (dashboard keeps its specific boundary). Retry first, then navigate away.
 */
export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[workspace-error]", error.message, error.digest ?? "");
  }, [error]);

  return (
    <div className="rounded-2xl border border-red-200 bg-white p-8 text-center">
      <div className="font-mono text-xs tracking-widest text-red-500">WORKSPACE ERROR</div>
      <h2 className="mt-2 text-lg font-semibold tracking-tight">This view failed to load.</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-stone-600">
        Your persisted snapshots and findings are untouched — retry, or continue elsewhere in the workspace.
      </p>
      <div className="mt-5 flex justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-full bg-zinc-900 px-5 py-2 text-sm font-medium text-white hover:bg-zinc-700"
        >
          Retry
        </button>
        <a href="/dashboard" className="rounded-full border border-stone-200 px-5 py-2 text-sm hover:bg-zinc-50">
          Dashboard
        </a>
      </div>
    </div>
  );
}
