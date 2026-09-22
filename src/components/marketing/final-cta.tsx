export function FinalCTA() {
  return (
    <section className="bg-black text-white">
      <div className="mx-auto max-w-[1280px] px-6 py-16 text-center">
        <div className="font-mono text-xs tracking-[0.2em] text-zinc-500">YOUR CLOUD BILL HAS A STORY</div>
        <h2 className="font-display mx-auto mt-3 max-w-2xl text-4xl font-semibold tracking-tight">See it clearly. Find what matters.</h2>
        <p className="mx-auto mt-3 max-w-xl text-sm text-zinc-400">Start with a guided tour — realistic workflow, Naira context.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <a href="/onboarding" className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-black hover:bg-zinc-100">Try Demo</a>
          <a href="/sign-in" className="rounded-full border border-zinc-700 px-6 py-3 text-sm hover:bg-zinc-900">Sign in</a>
        </div>
      </div>
    </section>
  );
}
