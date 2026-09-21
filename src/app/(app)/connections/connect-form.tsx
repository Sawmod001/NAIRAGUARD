"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createConnection, disconnectConnection, validateConnection, type ConnectionDTO } from "@/lib/aws/connections";
import { CopyBlock } from "@/components/ui/copy-block";

/** Manual validation run — NG-AWS-03. Runs after the trust policy carries the External ID. */
export function ValidateButton() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onValidate() {
    setError(null);
    setLoading(true);
    try {
      const res = await validateConnection();
      setLoading(false);
      if (!res.ok) {
        setError(res.error);
        router.refresh();
        return;
      }
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={onValidate}
        disabled={loading}
        className="rounded-full bg-zinc-900 px-5 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
      >
        {loading ? "Validating with AWS…" : "Run validation"}
      </button>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}

/** Role ARN entry — NG-AWS-04. Shape-checked here, STS-verified in NG-AWS-03. */
export function ConnectForm() {
  const router = useRouter();
  const [roleArn, setRoleArn] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<ConnectionDTO | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await createConnection({ roleArn });
      if (!res.ok) {
        setError(res.error);
        setLoading(false);
        return;
      }
      setCreated(res.connection);
      setLoading(false);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  if (created) {
    return (
      <div className="space-y-3">
        <p className="text-sm leading-6 text-stone-600">
          Connection recorded as <span className="font-medium">PENDING</span>. Paste this External ID into the
          role&apos;s trust policy, then validation will run in the next update.
        </p>
        <CopyBlock label="WORKSPACE EXTERNAL ID" value={created.externalId} />
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mt-4 space-y-3">
      <div>
        <label className="text-xs font-medium text-stone-700">Role ARN</label>
        <input
          type="text"
          required
          value={roleArn}
          onChange={(e) => setRoleArn(e.target.value)}
          placeholder="arn:aws:iam::123456789012:role/NairaGuardReadOnly"
          className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 font-mono text-xs focus:border-black focus:outline-none"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="rounded-full bg-zinc-900 px-5 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
      >
        {loading ? "Saving…" : "Connect AWS"}
      </button>
    </form>
  );
}

export function DisconnectButton() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onDisconnect() {
    setError(null);
    setLoading(true);
    try {
      const res = await disconnectConnection();
      if (!res.ok) {
        setError(res.error);
        setLoading(false);
        return;
      }
      setLoading(false);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={onDisconnect}
        disabled={loading}
        className="rounded-full border border-stone-200 bg-white px-4 py-1.5 text-xs font-medium hover:bg-zinc-50 disabled:opacity-50"
      >
        {loading ? "Disconnecting…" : "Disconnect"}
      </button>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
