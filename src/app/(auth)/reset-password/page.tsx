import { Suspense } from "react";
import { ResetPasswordForm } from "./form";

export const dynamic = "force-dynamic";

function MissingToken() {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
      <p className="text-sm text-zinc-600">
        This reset link is incomplete. Request a new one from{" "}
        <a href="/forgot-password" className="font-medium text-black underline">
          forgot password
        </a>
        .
      </p>
    </div>
  );
}

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const clean = typeof token === "string" ? token.trim() : "";
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-6 py-16">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Choose a new password</h1>
          <p className="mt-2 text-sm text-zinc-600">Your reset link expires 1 hour after it was sent.</p>
        </div>
        <Suspense fallback={null}>{clean ? <ResetPasswordForm token={clean} /> : <MissingToken />}</Suspense>
      </div>
    </main>
  );
}
