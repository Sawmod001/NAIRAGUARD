"use client";

import { useState } from "react";

export function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800 bg-black text-white">
      <div className="mx-auto flex max-w-[1280px] items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="font-display text-[22px] font-semibold tracking-tight">NairaGuard</span>
          <span className="hidden text-xs tracking-widest text-zinc-400 md:inline">AWS FINOPS, BUILT WITH NAIRA IN MIND.</span>
        </div>
        <nav aria-label="Primary" className="hidden items-center gap-6 text-sm md:flex">
          <a href="#product" className="text-zinc-300 hover:text-white">Product</a>
          <a href="#how" className="text-zinc-300 hover:text-white">How it works</a>
          <a href="#demo" className="text-zinc-300 hover:text-white">Demo</a>
          <a href="#why" className="text-zinc-300 hover:text-white">Why NairaGuard</a>
          <a href="/sign-in" className="text-zinc-300 hover:text-white">Sign in</a>
          <a href="/onboarding" className="rounded-full bg-white px-4 py-2 font-medium text-black hover:bg-zinc-100">Try Demo</a>
        </nav>
        <button onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-label="Toggle menu" className="rounded-md border border-zinc-700 px-3 py-1.5 text-sm md:hidden">
          Menu
        </button>
      </div>
      {open && (
        <div className="border-t border-zinc-800 bg-black px-6 py-4 md:hidden">
          <nav className="flex flex-col gap-3 text-sm">
            <a href="#product" onClick={() => setOpen(false)}>Product</a>
            <a href="#how" onClick={() => setOpen(false)}>How it works</a>
            <a href="#demo" onClick={() => setOpen(false)}>Demo</a>
            <a href="/sign-in">Sign in</a>
            <a href="/onboarding" className="rounded-full bg-white px-4 py-2 text-center font-medium text-black">Try Demo</a>
          </nav>
        </div>
      )}
    </header>
  );
}
