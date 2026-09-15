"use client";

import { useState } from "react";
import { AppNavMobile } from "./app-nav";

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Toggle menu"
        aria-expanded={open}
        className="rounded-md border border-zinc-200 px-3 py-1.5 text-sm"
      >
        Menu
      </button>
      {open && (
        <div className="absolute left-0 right-0 top-[57px] z-20 border-b border-zinc-200 bg-white shadow-sm">
          <AppNavMobile onNavigate={() => setOpen(false)} />
        </div>
      )}
    </div>
  );
}
