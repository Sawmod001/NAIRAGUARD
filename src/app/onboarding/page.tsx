import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma/client";
import { ConnectForm } from "./connect-form";

/**
 * Connect step — NG-DEMO-06
 * Authenticated only (proxy guards /onboarding): Try Demo → Create account / Sign in → Connect to Demo → Workspace.
 * An org with prior activity is already connected → straight to the workspace.
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

  const activityCount = await prisma.activityEvent.count({
    where: { organizationId: membership.organizationId },
  });
  if (activityCount > 0) redirect("/dashboard");

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fafaf8] px-6 py-16">
      <div className="w-full max-w-2xl rounded-[20px] border border-zinc-200 bg-white p-8 shadow-sm">
        <div className="font-mono text-xs tracking-[0.18em] text-zinc-500">WELCOME TO NAIRAGUARD</div>
        <h1 className="font-display mt-3 text-[32px] font-semibold leading-none tracking-[-0.03em]">
          Understand where your
          <br />
          AWS spend goes.
        </h1>
        <p className="mt-3 max-w-xl text-[14px] leading-6 text-zinc-600">
          See costs clearly. Find optimization opportunities. Understand what cloud spend means in estimated naira —
          inside your workspace for {membership.organization.name}.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-[#0a0a0a] p-6 text-white">
            <div className="font-mono text-xs tracking-widest text-zinc-400">01 — WORKSPACE</div>
            <div className="mt-2 font-semibold">Connect to Demo</div>
            <div className="mt-1 text-sm leading-5 text-zinc-400">
              One step. Your workspace, costs, findings, and naira estimates share one model.
            </div>
            <div className="mt-4">
              <ConnectForm organizationName={membership.organization.name} />
            </div>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-6">
            <div className="font-mono text-xs tracking-widest text-zinc-500">02 — LIVE LATER</div>
            <div className="mt-2 font-semibold">Connect AWS when ready</div>
            <div className="mt-1 text-sm leading-5 text-zinc-600">
              Read-only via IAM Role + STS. No long-lived keys. Verify and sync from Connections.
            </div>
            <Link
              href="/connections"
              className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-zinc-900 hover:gap-2"
            >
              How connections work <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
