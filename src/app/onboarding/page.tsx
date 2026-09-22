import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma/client";
import { ConnectForm } from "./connect-form";

/**
 * Connect hub — NG-ONBOARD-01 (production-first entry)
 * Authenticated only (proxy guards /onboarding). Plain sign-up/sign-in lands
 * here: AWS connection is the primary path with steps explained, and Try Demo
 * is an explicit secondary choice — never the default. Orgs already inside a
 * workspace (demo activity or a live connection) go straight to it.
 */
export default async function OnboardingPage() {
  const session = await auth();
  const userId = (session?.user as unknown as { id?: string })?.id;
  if (!session?.user || !userId) redirect("/sign-in?callbackUrl=/onboarding");

  const membership = await prisma.membership.findFirst({
    where: { userId },
    include: { organization: true },
  });
  if (!membership) redirect("/sign-in?callbackUrl=/onboarding");

  const [activityCount, liveConnection] = await Promise.all([
    prisma.activityEvent.count({ where: { organizationId: membership.organizationId } }),
    prisma.awsConnection.findFirst({
      where: { organizationId: membership.organizationId, status: { not: "DISCONNECTED" } },
      select: { id: true },
    }),
  ]);
  if (activityCount > 0 || liveConnection) redirect("/dashboard");

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fafaf8] px-6 py-16">
      <div className="w-full max-w-2xl rounded-[20px] border border-zinc-200 bg-white p-8 shadow-sm">
        <div className="font-mono text-xs tracking-[0.18em] text-zinc-500">WELCOME TO NAIRAGUARD</div>
        <h1 className="font-display mt-3 text-[32px] font-semibold leading-none tracking-[-0.03em]">
          Connect your AWS account.
          <br />
          See spend in naira context.
        </h1>
        <p className="mt-3 max-w-xl text-[14px] leading-6 text-zinc-600">
          Set up read-only access for {membership.organization.name} in minutes — or explore first with a guided tour.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-[#0a0a0a] p-6 text-white">
            <div className="font-mono text-xs tracking-widest text-zinc-400">01 — CONNECT AWS</div>
            <div className="mt-2 font-semibold">Live costs, read-only</div>
            <ol className="mt-3 space-y-2 text-sm leading-5 text-zinc-400">
              <li><span className="font-mono text-xs text-zinc-500">1.</span> Create the IAM role with the least-privilege guide</li>
              <li><span className="font-mono text-xs text-zinc-500">2.</span> Paste the Role ARN — your External ID is issued</li>
              <li><span className="font-mono text-xs text-zinc-500">3.</span> Run validation, then sync when ready</li>
            </ol>
            <div className="mt-1 text-xs leading-5 text-zinc-500">IAM Role + STS only. No long-lived keys, no write actions.</div>
            <Link
              href="/connections"
              className="mt-4 inline-flex items-center justify-center gap-1 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-zinc-100"
            >
              Go to Connections <span aria-hidden>→</span>
            </Link>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-6">
            <div className="font-mono text-xs tracking-widest text-zinc-500">02 — TRY DEMO</div>
            <div className="mt-2 font-semibold">Explore with a guided dataset</div>
            <div className="mt-1 text-sm leading-5 text-zinc-600">
              One step. A realistic workspace with costs, findings, and naira estimates — no AWS needed.
            </div>
            <div className="mt-4">
              <ConnectForm organizationName={membership.organization.name} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
