import { auth } from "@/auth";
import { prisma } from "@/lib/prisma/client";

export default async function SettingsPage() {
  const session = await auth();
  const userId = (session?.user as unknown as { id?: string })?.id;
  const org = userId
    ? await prisma.membership
        .findFirst({ where: { userId }, include: { organization: true } })
        .then((m) => m?.organization ?? null)
    : null;

  return (
    <div>
      <h1 className="text-2xl font-semibold">Settings</h1>
      <p className="mt-2 text-sm text-zinc-600">Tenant boundary — NG-103 ensures user → organization → membership.</p>
      <div className="mt-6 grid gap-4">
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <div className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Profile</div>
          <div className="mt-2 text-sm">Email: <span className="font-medium">{session?.user?.email}</span></div>
          <div className="text-sm text-zinc-500">User ID: {userId ?? "—"}</div>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <div className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Organization (tenant)</div>
          <div className="mt-2 text-sm">Name: <span className="font-medium">{org?.name ?? "—"}</span></div>
          <div className="text-sm text-zinc-500">ID: {org?.id ?? "—"}</div>
          <div className="mt-2 text-xs text-zinc-500">Owned via Membership (owner). Queries must be scoped by organizationId (docs/05).</div>
        </div>
      </div>
    </div>
  );
}
