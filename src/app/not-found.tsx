/**
 * Branded 404 — NG-DASH-11
 * Covers marketing routes and any app route without a closer not-found boundary.
 */
export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-6 py-16">
      <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
        <div className="font-mono text-xs tracking-widest text-zinc-500">404 · NOT FOUND</div>
        <h1 className="mt-2 text-xl font-semibold tracking-tight">This page doesn&apos;t exist.</h1>
        <p className="mt-2 text-sm text-zinc-600">The link may be old, or the item was moved or removed.</p>
        <div className="mt-6 flex justify-center gap-3">
          <a href="/" className="rounded-full bg-black px-5 py-2 text-sm font-medium text-white hover:bg-zinc-800">
            Home
          </a>
          <a href="/dashboard" className="rounded-full border border-zinc-300 px-5 py-2 text-sm hover:bg-zinc-50">
            Workspace
          </a>
        </div>
      </div>
    </main>
  );
}
