import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import { AppNav } from "@/components/app/app-nav";
import { MobileMenu } from "@/components/app/mobile-menu";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) {
    redirect("/sign-in");
  }

  const email = session.user.email ?? "—";
  const name = (session.user as unknown as { name?: string | null })?.name ?? null;

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3">
          <div className="flex items-center gap-6">
            <span className="text-sm font-semibold tracking-tight">NairaGuard</span>
            <span className="hidden rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 md:inline">
              Prod
            </span>
            <div className="hidden md:block">
              <AppNav />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right md:block">
              <div className="text-sm font-medium leading-none">{name ?? email}</div>
              <div className="text-xs text-zinc-500">{name ? email : "Authenticated"}</div>
            </div>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/sign-in" });
              }}
            >
              <button type="submit" className="rounded-md border border-zinc-200 px-3 py-1.5 text-sm hover:bg-zinc-50">
                Sign out
              </button>
            </form>
            <MobileMenu />
          </div>
        </div>
        {/* Mobile nav is rendered via MobileMenu portal */}
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
