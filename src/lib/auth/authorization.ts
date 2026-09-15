import { auth } from "@/auth";
import { prisma } from "@/lib/prisma/client";
import { AppError } from "@/lib/errors/app-error";
import { ErrorCode } from "@/lib/errors/codes";

/**
 * Authorization — NG-104 Server-side tenant isolation
 * UI hiding ≠ security (docs/10_SECURITY). Every read/write must verify membership.
 * Never trust organizationId from browser — check membership.
 */

export async function requireAuthWithOrg(): Promise<{ userId: string; email: string | null; organizationId: string; organizationName: string }> {
  const session = await auth();
  const userId = (session?.user as unknown as { id?: string })?.id ?? null;
  if (!session?.user || !userId) {
    throw new AppError({ code: ErrorCode.UNAUTHENTICATED, message: "Sign in required." });
  }
  const membership = await prisma.membership.findFirst({
    where: { userId: String(userId) },
    include: { organization: true },
  });
  if (!membership) {
    throw new AppError({ code: ErrorCode.TENANT_FORBIDDEN, message: "No organization. Contact support." });
  }
  return {
    userId: String(userId),
    email: session.user.email ?? null,
    organizationId: membership.organizationId,
    organizationName: membership.organization.name,
  };
}

/** Assert caller is member of given organization — throws TENANT_FORBIDDEN otherwise. */
export async function assertMembership(userId: string, organizationId: string): Promise<void> {
  const m = await prisma.membership.findFirst({ where: { userId, organizationId } });
  if (!m) {
    throw new AppError({ code: ErrorCode.TENANT_FORBIDDEN, message: "Access denied to organization." });
  }
}

/** Require membership — returns org or throws. */
export async function requireOrganization(userId: string, organizationId: string) {
  await assertMembership(userId, organizationId);
  const org = await prisma.organization.findUnique({ where: { id: organizationId } });
  if (!org) throw new AppError({ code: ErrorCode.NOT_FOUND, message: "Organization not found." });
  return org;
}

/** All org ids caller can access — for scoping queries. */
export async function getAuthorizedOrganizationIds(userId: string): Promise<string[]> {
  const ms = await prisma.membership.findMany({ where: { userId }, select: { organizationId: true } });
  return ms.map((m) => m.organizationId);
}

/** Tenant-scoped query guard — ensure organizationId is in caller's memberships. */
export async function scopedOrganizationId(userId: string, requestedId?: string | null): Promise<string> {
  const ids = await getAuthorizedOrganizationIds(userId);
  if (ids.length === 0) throw new AppError({ code: ErrorCode.TENANT_FORBIDDEN, message: "No organization." });
  if (!requestedId) return ids[0]!;
  if (!ids.includes(requestedId)) {
    throw new AppError({ code: ErrorCode.TENANT_FORBIDDEN, message: "Access denied to organization." });
  }
  return requestedId;
}
