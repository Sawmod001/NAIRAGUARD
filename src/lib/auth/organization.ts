import { prisma } from "@/lib/prisma/client";

/**
 * Organization helpers — NG-103
 * Tenant boundary per docs/05_DATA_MODEL.md
 * Ensures every user has a personal organization (idempotent).
 */

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || "workspace";
}

export async function generateOrganizationSlug(name: string): Promise<string> {
  const base = slugify(name);
  for (let i = 0; i < 10; i++) {
    const candidate = i === 0 ? base : `${base}-${i + 1}`;
    const existing = await prisma.organization.findUnique({ where: { slug: candidate } });
    if (!existing) return candidate;
  }
  return `${base}-${Math.random().toString(36).slice(2, 6)}`;
}

export async function ensurePersonalOrganization(userId: string, email?: string | null, name?: string | null) {
  // Check existing membership
  const existing = await prisma.membership.findFirst({ where: { userId }, include: { organization: true } });
  if (existing) return existing.organization;

  const orgName = (name?.trim() || email?.split("@")[0] || "Personal") + "'s Workspace";
  const slug = await generateOrganizationSlug(orgName);
  return await prisma.$transaction(async (tx) => {
    // Double-check inside transaction for race
    const recheck = await tx.membership.findFirst({ where: { userId } });
    if (recheck) {
      const org = await tx.organization.findUnique({ where: { id: recheck.organizationId } });
      if (org) return org;
    }
    const org = await tx.organization.create({ data: { name: orgName, slug, type: "workspace", country: "NG" } });
    await tx.membership.create({ data: { userId, organizationId: org.id, role: "OWNER" } });
    return org;
  });
}

export async function getUserOrganizations(userId: string) {
  const memberships = await prisma.membership.findMany({
    where: { userId },
    include: { organization: true },
  });
  return memberships.map((m) => m.organization);
}

export async function getCurrentOrganization(userId: string) {
  const m = await prisma.membership.findFirst({ where: { userId }, include: { organization: true } });
  return m?.organization ?? null;
}
