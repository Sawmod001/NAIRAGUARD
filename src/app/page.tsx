import { Hero } from "@/components/marketing/hero";
import { Story } from "@/components/marketing/story";
import { InteractiveViz } from "@/components/marketing/interactive-viz";

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-zinc-900">
      <header className="border-b border-zinc-200">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="text-sm font-semibold">NairaGuard</span>
          <nav className="flex gap-4 text-sm">
            <a href="/sign-in" className="hover:text-orange-600">Sign in</a>
            <a href="/sign-up" className="rounded-md bg-black px-3 py-1.5 text-white hover:bg-zinc-800">Sign up</a>
          </nav>
        </div>
      </header>
      <Hero />
      <Story />
      <div className="mx-auto max-w-6xl px-6">
        <InteractiveViz />
      </div>
      <div className="mx-auto max-w-5xl px-6 py-16">

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-zinc-200 p-5">
            <div className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
              Architecture
            </div>
            <div className="mt-2 text-sm leading-6 text-zinc-700">
              Presentation → Application → Domain → Infrastructure. Provider abstractions keep
              Demo and Live AWS interchangeable.
            </div>
          </div>
          <div className="rounded-xl border border-zinc-200 p-5">
            <div className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
              Foundation
            </div>
            <div className="mt-2 text-sm leading-6 text-zinc-700">
              NG-001 initialized: Next.js App Router, TypeScript strict, Tailwind, lint/typecheck.
              No auth, no DB, no providers — by design.
            </div>
          </div>
          <div className="rounded-xl border border-zinc-200 p-5">
            <div className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
              Next
            </div>
            <div className="mt-2 text-sm leading-6 text-zinc-700">
              NG-002 → architecture skeleton. Then env/config, Prisma, and provider contracts.
            </div>
          </div>
        </div>

        <div className="mt-10 rounded-xl bg-zinc-900 px-6 py-4 text-sm text-zinc-100">
          <span className="font-mono text-xs uppercase tracking-widest text-zinc-400">
            Local
          </span>
          <div className="mt-1 font-mono">http://localhost:3000</div>
          <div className="mt-1 text-xs text-zinc-400">
            Financial truth = provider data + deterministic calculations. AI explains, never invents.
          </div>
        </div>
      </div>
      <footer className="border-t border-zinc-200 py-6 text-center text-xs text-zinc-500">
        <a href="/privacy" className="hover:text-black">Privacy</a> • <a href="/terms" className="hover:text-black">Terms</a> • <span className="text-orange-600">●</span> NairaGuard
      </footer>
    </main>
  );
}
