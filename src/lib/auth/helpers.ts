import "server-only";

import { auth } from "@/auth";
import { AppError } from "@/lib/errors/app-error";
import { ErrorCode } from "@/lib/errors/codes";

/**
 * App-owned auth helpers — server-enforced (docs/10_SECURITY).
 * Throw AppError(UNAUTHENTICATED) so handlers map to 401 safely.
 */

export async function requireAuth(): Promise<{ userId: string; email: string | null }> {
  const session = await auth();
  const userId = (session?.user as unknown as { id?: string })?.id ?? session?.user?.email ?? null;
  if (!session?.user || !userId) {
    throw new AppError({ code: ErrorCode.UNAUTHENTICATED, message: "Sign in required." });
  }
  return { userId: String(userId), email: session.user.email ?? null };
}

export async function getAuth(): Promise<{ userId: string | null; email: string | null }> {
  const session = await auth();
  const userId = (session?.user as unknown as { id?: string })?.id ?? null;
  if (!session?.user) return { userId: null, email: null };
  return { userId: userId ? String(userId) : null, email: session.user.email ?? null };
}

export async function isAuthenticated(): Promise<boolean> {
  const { userId } = await getAuth();
  return !!userId;
}
