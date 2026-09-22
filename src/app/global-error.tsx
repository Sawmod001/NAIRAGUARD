"use client";

/**
 * Root failure surface — NG-DASH-11
 * Catches what route-level boundaries cannot (layout failures). Offers a way
 * back; never strands the user on a blank page.
 */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-zinc-50 px-6">
        <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
          <div className="font-mono text-xs tracking-widest text-zinc-500">SOMETHING WENT WRONG</div>
          <h1 className="mt-2 text-xl font-semibold tracking-tight">NairaGuard hit an unexpected error.</h1>
          <p className="mt-2 text-sm text-zinc-600">Your workspace data is safe — this is a rendering failure, not data loss.</p>
          <div className="mt-6 flex justify-center gap-3">
            <button
              type="button"
              onClick={reset}
              className="rounded-full bg-black px-5 py-2 text-sm font-medium text-white hover:bg-zinc-800"
            >
              Try again
            </button>
            <a href="/" className="rounded-full border border-zinc-300 px-5 py-2 text-sm hover:bg-zinc-50">
              Home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
