import { auth } from "@/auth";
import { prisma } from "@/lib/prisma/client";

export default async function SettingsPage() {
  const session = await auth();
  const userId = (session?.user as unknown as { id?: string })?.id;
  const org = userId ? await prisma.membership.findFirst({ where: { userId }, include: { organization: true } }).then((m) => m?.organization ?? null) : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-zinc-500">Manage your workspace and preferences.</p>
      </div>

      <div className="grid gap-6">
        <section className="rounded-xl border border-zinc-200 bg-white p-6">
          <h2 className="font-mono text-xs tracking-widest text-zinc-500">PROFILE</h2>
          <div className="mt-3 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-zinc-900 text-white flex items-center justify-center font-semibold">{session?.user?.email?.[0]?.toUpperCase() ?? "U"}</div>
            <div>
              <div className="text-sm font-medium">{session?.user?.email}</div>
              <div className="text-xs text-zinc-500">Member since {new Date().toLocaleDateString()}</div>
            </div>
          </div>
          <div className="mt-4 text-sm">Name: <span className="font-medium">{(session?.user as unknown as { name?: string })?.name ?? "—"}</span></div>
        </section>

        <section className="rounded-xl border border-zinc-200 bg-white p-6">
          <h2 className="font-mono text-xs tracking-widest text-zinc-500">WORKSPACE</h2>
          <div className="mt-2 text-sm font-medium">{org?.name ?? "DOVE's Workspace"}</div>
          <div className="text-xs text-zinc-500">Role: Owner • {org ? "1 member" : "—"}</div>
          <div className="mt-3 rounded-md bg-zinc-50 p-3 text-xs text-zinc-600">Workspace settings • Members • Roles — future team management ready.</div>
        </section>

        <section className="rounded-xl border border-zinc-200 bg-white p-6">
          <h2 className="font-mono text-xs tracking-widest text-zinc-500">CONNECTIONS</h2>
          <div className="mt-2 flex items-center justify-between">
            <div className="text-sm">AWS • Not connected</div>
            <a href="/connections" className="rounded-full border border-zinc-200 px-3 py-1 text-xs hover:bg-zinc-50">Manage</a>
          </div>
        </section>

        <section className="rounded-xl border border-zinc-200 bg-white p-6">
          <h2 className="font-mono text-xs tracking-widest text-zinc-500">PREFERENCES</h2>
          <div className="mt-2 grid gap-2 text-sm">
            <div className="flex justify-between"><span>Currency</span><span className="font-medium">NGN</span></div>
            <div className="flex justify-between"><span>Timezone</span><span className="font-medium">Africa/Lagos</span></div>
            <div className="flex justify-between"><span>Notifications</span><span className="font-medium">On</span></div>
          </div>
        </section>

        <section className="rounded-xl border border-zinc-200 bg-white p-6">
          <h2 className="font-mono text-xs tracking-widest text-zinc-500">SECURITY</h2>
          <div className="text-sm">Password • ••••••••</div>
          <div className="text-xs text-zinc-500">Sessions: 1 active • Secure cookie • Auth.js</div>
        </section>
      </div>
    </div>
  );
}
