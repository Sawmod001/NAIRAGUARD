import { auth } from "@/auth";

export default async function DashboardPage() {
  const session = await auth();
  return (
    <div>
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="mt-2 text-sm text-zinc-600">
        Protected • Signed in as <span className="font-medium text-black">{session?.user?.email}</span>
      </p>
      <p className="mt-4 text-sm text-zinc-500">Demo Mode ready — no AWS credentials needed. Auth is Prod.</p>
    </div>
  );
}
