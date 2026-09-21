import { auth } from "@/auth";
import { prisma } from "@/lib/prisma/client";
import { getDemoDataset } from "@/infrastructure/providers/demo/registry";
import { maskAwsAccountId } from "@/schemas/demo";

export default async function SettingsPage() {
  const session = await auth();
  const userId = (session?.user as unknown as { id?: string })?.id;
  const org = userId ? await prisma.membership.findFirst({ where: { userId }, include: { organization: true } }).then((m) => m?.organization ?? null) : null;
  // NG-DEMO-02: seeded workspace account.
  const account = getDemoDataset("balanced-startup").scenario;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-stone-500">Profile, workspace, and preferences — technical IDs are tucked away in Advanced.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="rounded-2xl border border-stone-200 bg-white p-6">
          <h2 className="font-mono text-xs tracking-widest text-stone-500">PROFILE</h2>
          <div className="mt-3 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-zinc-900 text-white flex items-center justify-center font-semibold">{session?.user?.email?.[0]?.toUpperCase() ?? "U"}</div>
            <div>
              <div className="text-sm font-medium">{session?.user?.email}</div>
              <div className="text-xs text-stone-500">Member since {new Date().toLocaleDateString()} · Secure cookie · Auth.js</div>
            </div>
          </div>
          <div className="mt-4 text-sm">Name <span className="font-medium">{(session?.user as unknown as { name?: string })?.name ?? "—"}</span></div>
          <div className="mt-1 text-xs text-stone-500">Change password and session management — future: email verification.</div>
        </section>

        <section className="rounded-2xl border border-stone-200 bg-white p-6">
          <h2 className="font-mono text-xs tracking-widest text-stone-500">WORKSPACE</h2>
          <div className="mt-2 text-sm font-medium">{org?.name ?? "Your Workspace"}</div>
          <div className="text-xs text-stone-500">Role: Owner · 1 member</div>
          <div className="mt-3 rounded-xl bg-stone-50 p-3 text-xs leading-5 text-stone-600">Team management, roles, and invites are future-ready. Data is always scoped by organization — server-enforced.</div>
        </section>

        <section className="rounded-2xl border border-stone-200 bg-white p-6">
          <h2 className="font-mono text-xs tracking-widest text-stone-500">CONNECTIONS</h2>
          <div className="mt-2 flex items-center justify-between">
            <div className="text-sm">AWS · {account.accountName} · <span className="font-mono">{maskAwsAccountId(account.accountId)}</span></div>
            <a href="/connections" className="rounded-full border border-stone-200 bg-white px-3 py-1 text-xs hover:bg-zinc-50">Manage</a>
          </div>
          <div className="mt-2 text-xs text-stone-500">Live will use IAM Role + STS, no long-lived keys.</div>
        </section>

        <section className="rounded-2xl border border-stone-200 bg-white p-6">
          <h2 className="font-mono text-xs tracking-widest text-stone-500">PREFERENCES</h2>
          <div className="mt-2 grid gap-2 text-sm">
            <div className="flex justify-between"><span>Currency context</span><span className="font-medium">USD + NGN estimate</span></div>
            <div className="flex justify-between"><span>FX source</span><span className="font-medium">recorded rate</span></div>
            <div className="flex justify-between"><span>Timezone</span><span className="font-medium">Africa/Lagos</span></div>
          </div>
        </section>

        <section className="rounded-2xl border border-stone-200 bg-white p-6 md:col-span-2">
          <h2 className="font-mono text-xs tracking-widest text-stone-500">SECURITY</h2>
          <div className="mt-2 text-sm">Sessions: 1 active · httpOnly cookie · CSRF protected</div>
          <div className="text-xs text-stone-500">Never store AWS secrets in the browser.</div>
          <details className="mt-3 text-xs text-stone-500"><summary className="cursor-pointer hover:text-stone-700">Advanced — technical identifiers</summary><div className="mt-2 font-mono text-[11px] leading-5">User: {(session?.user as unknown as { id?: string })?.id?.slice(0,8) ?? "—"}… · Org: {org?.id?.slice(0,8) ?? "—"}… — used for server-side scoping, not shown by default.</div></details>
        </section>
      </div>
    </div>
  );
}
