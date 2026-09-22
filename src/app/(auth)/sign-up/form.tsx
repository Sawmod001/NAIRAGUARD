"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { signUp } from "@/lib/auth/actions";
import { safeCallbackUrl } from "@/lib/auth/callback";

export function SignUpForm() {
  const router = useRouter();
  const params = useSearchParams();
  // NG-ONBOARD-01: plain entry lands on the Connect hub, never demo data.
  const callbackUrl = safeCallbackUrl(params.get("callbackUrl"), "/onboarding");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await signUp({ name: name || undefined, email, password, confirmPassword });
    if (!res.ok) {
      setError(res.error);
      setLoading(false);
      return;
    }
    // Auto sign-in after creation (prod: verification dormant — immediate access)
    const si = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (si?.error) {
      setError("Account created. Please sign in.");
      router.push(`/sign-in?callbackUrl=${encodeURIComponent(callbackUrl)}`);
      return;
    }
    // NG-DEMO-06: honor Try Demo → sign-up → Connect step chain.
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium">Name (optional)</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
            placeholder="Ada Lovelace"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
            placeholder="you@company.com"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
            placeholder="≥8 chars, 1 uppercase + 1 number"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Confirm password</label>
          <input
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
        >
          {loading ? "Creating…" : "Create account"}
        </button>
        <p className="text-center text-sm text-zinc-600">
          Have an account?{" "}
          <a
            href={`/sign-in?callbackUrl=${encodeURIComponent(callbackUrl)}`}
            className="font-medium text-black underline"
          >
            Sign in
          </a>
        </p>
        <p className="text-center text-xs text-zinc-500">Verification ready when domain verified — not blocking now.</p>
      </div>
    </form>
  );
}
