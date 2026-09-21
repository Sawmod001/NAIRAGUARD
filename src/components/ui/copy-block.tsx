"use client";

import { useState } from "react";

/** Copyable pre-formatted block (IAM JSON). Client-only; never receives secrets. */
export function CopyBlock({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // Clipboard unavailable (permissions) — select manually via the visible text.
      setCopied(false);
      return;
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="overflow-hidden rounded-xl border border-stone-200">
      <div className="flex items-center justify-between bg-stone-50 px-3 py-2">
        <span className="font-mono text-[10px] tracking-widest text-stone-500">{label}</span>
        <button
          type="button"
          onClick={onCopy}
          className="rounded-full border border-stone-200 bg-white px-3 py-1 text-xs font-medium hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900"
        >
          {copied ? "Copied ✓" : "Copy"}
        </button>
      </div>
      <pre className="max-h-72 overflow-auto bg-[#0E0E0F] p-4 font-mono text-[11px] leading-5 text-zinc-200">{value}</pre>
    </div>
  );
}
