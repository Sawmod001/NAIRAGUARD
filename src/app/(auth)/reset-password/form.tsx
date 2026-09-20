"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { resetPassword } from "@/lib/auth/password-reset";

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await resetPassword({ token, password, confirmPassword });
      if (!res.ok) {
        setError(res.error);
        setLoading(false);
        return;
      }
      router.push("/sign-in?reset=1");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium">New password</label>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
            placeholder="At least 8 characters, 1 uppercase, 1 number"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Confirm new password</label>
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
          {loading ? "Resetting…" : "Reset password"}
        </button>
        <p className="text-center text-sm text-zinc-600">
          <a href="/sign-in" className="font-medium text-black underline">
            Back to sign in
          </a>
        </p>
      </div>
    </form>
  );
}
