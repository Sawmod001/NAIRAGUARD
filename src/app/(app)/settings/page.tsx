import { auth } from "@/auth";

export default async function SettingsPage() {
  const session = await auth();
  return (
    <div>
      <h1 className="text-2xl font-semibold">Settings</h1>
      <p className="mt-2 text-sm text-zinc-600">Shell placeholder — profile & org settings in NG-103+.</p>
      <div className="mt-6 rounded-xl border border-zinc-200 bg-white p-5">
        <div className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Profile</div>
        <div className="mt-2 text-sm">Email: <span className="font-medium">{session?.user?.email}</span></div>
      </div>
    </div>
  );
}
