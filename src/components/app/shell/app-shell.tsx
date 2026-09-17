"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";

export function AppShell({ workspaceName, scenario, children }: { workspaceName: string; scenario: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Desktop sidebar */}
      <div className="hidden md:fixed md:inset-y-0 md:flex md:w-[260px]">
        <Sidebar workspaceName={workspaceName} scenario={scenario} />
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-[260px] bg-[#0a0a0a]">
            <Sidebar workspaceName={workspaceName} scenario={scenario} onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}

      <div className="md:pl-[260px]">
        <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-zinc-800 bg-[#0a0a0a] px-6 py-3 md:hidden">
          <button onClick={() => setOpen((v) => !v)} aria-label="Toggle menu" className="rounded-lg border border-zinc-700 px-3 py-1.5 text-sm text-white">
            Menu
          </button>
          <span className="font-display font-semibold text-white">NairaGuard</span>
          <span className="ml-auto text-xs text-zinc-400">{workspaceName}</span>
        </div>
        <div className="bg-[#fafaf8] text-stone-900 min-h-[calc(100vh-57px)]">{children}</div>
      </div>
    </div>
  );
}
