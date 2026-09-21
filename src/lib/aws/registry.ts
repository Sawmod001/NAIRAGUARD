"use server";

import { prisma } from "@/lib/prisma/client";
import { isValidAwsAccountId } from "@/domain/aws/registry";

/**
 * AWS inventory registry — NG-AWS-06
 * Idempotent, server-side only. Callers pass an already-authorized
 * organizationId (from the session); nothing here trusts client input.
 * Multi-account ready: one workspace may own many AWS orgs → many accounts.
 */

export async function ensureDefaultAwsOrganization(organizationId: string): Promise<{ id: string }> {
  const existing = await prisma.awsOrganization.findFirst({
    where: { organizationId, awsOrgId: null },
    select: { id: true },
  });
  if (existing) return existing;
  return await prisma.awsOrganization.create({
    data: { organizationId },
    select: { id: true },
  });
}

export async function ensureAwsAccount(input: {
  organizationId: string;
  accountId: string;
  name?: string | null;
  awsOrganizationId?: string | null;
}): Promise<{ id: string; accountId: string }> {
  const accountId = input.accountId.trim();
  if (!isValidAwsAccountId(accountId)) {
    throw new Error(`Refusing to register malformed AWS account id.`);
  }
  const awsOrganizationId = input.awsOrganizationId ?? (await ensureDefaultAwsOrganization(input.organizationId)).id;
  return await prisma.awsAccount.upsert({
    where: { organizationId_accountId: { organizationId: input.organizationId, accountId } },
    update: {
      ...(input.name ? { name: input.name } : {}),
      awsOrganizationId,
    },
    create: {
      organizationId: input.organizationId,
      accountId,
      name: input.name ?? null,
      awsOrganizationId,
    },
    select: { id: true, accountId: true },
  });
}

export async function listAwsAccounts(organizationId: string): Promise<{ id: string; accountId: string; name: string | null }[]> {
  return await prisma.awsAccount.findMany({
    where: { organizationId },
    orderBy: { createdAt: "asc" },
    select: { id: true, accountId: true, name: true },
  });
}
