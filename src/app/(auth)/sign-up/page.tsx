import { Suspense } from "react";
import { SignUpForm } from "./form";

export const dynamic = "force-dynamic";

export default function SignUpPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-6 py-16">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Create your NairaGuard account</h1>
          <p className="mt-2 text-sm text-zinc-600">Prod auth • No AWS credentials needed</p>
        </div>
        <Suspense fallback={null}>
          <SignUpForm />
        </Suspense>
      </div>
    </main>
  );
}
