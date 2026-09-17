"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  async function handleSignOut() {
    try {
      // Clear sensitive client state so bfcache flash shows no data
      sessionStorage.clear();
      localStorage.clear();
      // Clear any query caches in memory (best-effort)
      if ("caches" in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }
    } catch {}
    await signOut({ callbackUrl: "/sign-in" });
  }
  return (
    <button onClick={handleSignOut} className="w-full rounded-md border border-zinc-700 px-3 py-2 text-sm hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8622C]">
      Sign out
    </button>
  );
}
