import { Suspense } from "react";
import { SignInForm } from "./form";

export const dynamic = "force-dynamic";

export default function SignInPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-6 py-16">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Sign in to NairaGuard</h1>
          <p className="mt-2 text-sm text-zinc-600">Secure session • Workspace ready after login</p>
        </div>
        <Suspense fallback={null}>
          <SignInForm />
        </Suspense>
      </div>
    </main>
  );
}
