"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { connectToDemo } from "@/lib/demo/connect";

export function ConnectForm({ organizationName }: { organizationName: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onConnect() {
    setError(null);
    setLoading(true);
    try {
      const res = await connectToDemo();
      if (!res.ok) {
        setError(res.error);
        setLoading(false);
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={onConnect}
        disabled={loading}
        className="inline-flex w-full items-center justify-center rounded-full bg-[#0a0a0a] px-6 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900"
      >
        {loading ? "Connecting…" : "Connect to Demo"}
      </button>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      <p className="mt-3 text-xs leading-5 text-zinc-500">
        Connects {organizationName} to a production-style workspace. No AWS credentials needed for this step.
      </p>
    </div>
  );
}
