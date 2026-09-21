import { ForgotPasswordForm } from "./form";

export const dynamic = "force-dynamic";

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-6 py-16">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Reset your password</h1>
          <p className="mt-2 text-sm text-zinc-600">Enter your account email and we’ll send a reset link.</p>
        </div>
        <ForgotPasswordForm />
      </div>
    </main>
  );
}
