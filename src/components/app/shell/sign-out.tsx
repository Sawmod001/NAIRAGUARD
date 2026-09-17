"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button onClick={() => signOut({ callbackUrl: "/sign-in" })} className="w-full rounded-md border border-zinc-700 px-3 py-2 text-sm hover:bg-zinc-800">
      Sign out
    </button>
  );
}
