import "server-only";

import { auth } from "@clerk/nextjs/server";
import { AppError } from "@/lib/errors/app-error";
import { ErrorCode } from "@/lib/errors/codes";

/**
 * Auth helpers — NG-101
 * Throws AppError(UNAUTHENTICATED) if no session. Use in server components / route handlers / server actions.
 * Never leaks Clerk tokens.
 */

export async function requireAuth(): Promise<{ userId: string }> {
  const session = await auth();
  if (!session.userId) {
    throw new AppError({ code: ErrorCode.UNAUTHENTICATED, message: "Sign in required." });
  }
  return { userId: session.userId };
}

export async function getAuth(): Promise<{ userId: string | null }> {
  const session = await auth();
  return { userId: session.userId ?? null };
}

export async function isAuthenticated(): Promise<boolean> {
  const { userId } = await getAuth();
  return !!userId;
}
