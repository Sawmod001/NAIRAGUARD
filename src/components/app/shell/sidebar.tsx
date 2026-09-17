"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignOutButton } from "./sign-out";

const nav = [
  { section: "OVERVIEW", items: [{ href: "/dashboard", label: "Dashboard" }] },
  { section: "FINOPS", items: [{ href: "/costs", label: "Costs" }, { href: "/optimizations", label: "Optimizations" }, { href: "/activity", label: "Activity" }] },
  { section: "ACCOUNT", items: [{ href: "/connections", label: "Connections" }, { href: "/settings", label: "Settings" }] },
] as const;

export function Sidebar({ workspaceName, scenario, onNavigate }: { workspaceName: string; scenario: string; onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <div className="flex h-full flex-col bg-[#0a0a0a] text-white">
      <div className="border-b border-zinc-800 px-5 py-4">
        <div className="font-display text-lg font-semibold tracking-tight">NairaGuard</div>
        <div className="mt-1 font-mono text-[10px] tracking-[0.18em] text-zinc-500">AWS FINOPS · NAIRA-AWARE</div>
        <div className="mt-3 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2.5">
          <div className="text-sm font-medium leading-none">{workspaceName}</div>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-zinc-400">
            <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden />
            Demo · {scenario}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4">
        {nav.map((sec) => (
          <div key={sec.section} className="mb-6">
            <div className="px-3 py-1 font-mono text-[11px] tracking-widest text-zinc-500">{sec.section}</div>
            <div className="mt-1 space-y-1">
              {sec.items.map((it) => {
                const active = pathname === it.href || pathname.startsWith(it.href + "/");
                return (
                  <Link
                    key={it.href}
                    href={it.href}
                    onClick={onNavigate}
                    className={`block rounded-md px-3 py-2 text-sm ${active ? "bg-zinc-800 text-white" : "text-zinc-400 hover:bg-zinc-900 hover:text-white"}`}
                  >
                    {it.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-zinc-800 p-4 space-y-3">
        <div className="rounded-md bg-zinc-900 px-3 py-2">
          <div className="font-mono text-xs tracking-widest text-zinc-500">DEMO ENVIRONMENT</div>
          <div className="text-sm font-medium capitalize">{scenario.replace("-", " ")}</div>
          <div className="text-xs text-zinc-500">Synthetic • No live AWS</div>
        </div>
        <SignOutButton />
      </div>
    </div>
  );
}
