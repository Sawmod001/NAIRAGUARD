import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma/client";
import { AppShell } from "@/components/app/shell/app-shell";
import { headers } from "next/headers";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/sign-in");

  const userId = (session.user as unknown as { id?: string })?.id;
  let workspaceName = "DOVE's Workspace";
  let organizationId: string | null = null;
  if (userId) {
    const m = await prisma.membership.findFirst({ where: { userId }, include: { organization: true } });
    if (m?.organization.name) workspaceName = m.organization.name;
    if (m?.organizationId) organizationId = m.organizationId;
  }

  // First-run: new org with zero activity → send to onboarding (production UX §4)
  // Exclude onboarding itself to avoid loop; allow explicit ?skipOnboarding
  const hdrs = await headers();
  const pathname = hdrs.get("x-pathname") ?? "";
  // Fallback: check via next header alternative
  const url = hdrs.get("x-url") ?? "";
  const isOnboarding = pathname.includes("/onboarding") || url.includes("/onboarding");
  if (organizationId && !isOnboarding) {
    try {
      const count = await prisma.activityEvent.count({ where: { organizationId } });
      if (count === 0) {
        // Only redirect if user hasn't explicitly dismissed — use cookie check via header
        const cookie = hdrs.get("cookie") ?? "";
        const hasDismissed = cookie.includes("ng_onboarded=1");
        if (!hasDismissed) redirect("/onboarding");
      }
    } catch {
      // DB unavailable → do not block app shell
    }
  }

  // Demo scenario — later from org preference, for now Balanced Startup
  const scenario = "Balanced Startup";

  return (
    <AppShell workspaceName={workspaceName} scenario={scenario}>
      <div className="mx-auto max-w-[1280px] p-6 md:p-8">{children}</div>
    </AppShell>
  );
}
