import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

// NG-101: Protected application boundary. All routes under (app) require auth.
// NG-102 will expand this into full shell (nav + shell). Keep minimal now.

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const hasClerkKeys =
    !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && !!process.env.CLERK_SECRET_KEY;

  // Allow build/Demo without keys — middleware already no-ops. In production, missing keys = misconfig.
  if (!hasClerkKeys) {
    return <>{children}</>;
  }

  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }
  return <>{children}</>;
}
