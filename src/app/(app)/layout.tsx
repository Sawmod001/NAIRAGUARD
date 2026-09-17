import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma/client";
import { AppShell } from "@/components/app/shell/app-shell";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/sign-in");

  const userId = (session.user as unknown as { id?: string })?.id;
  let workspaceName = "DOVE's Workspace";
  if (userId) {
    const m = await prisma.membership.findFirst({ where: { userId }, include: { organization: true } });
    if (m?.organization.name) workspaceName = m.organization.name;
  }

  // Demo scenario — later from org preference, for now Balanced Startup
  const scenario = "Balanced Startup";

  return (
    <AppShell workspaceName={workspaceName} scenario={scenario}>
      <div className="mx-auto max-w-[1280px] p-6 md:p-8">{children}</div>
    </AppShell>
  );
}
