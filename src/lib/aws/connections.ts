"use server";

import { headers } from "next/headers";
import { requireAuth } from "@/lib/auth/helpers";
import { ensurePersonalOrganization } from "@/lib/auth/organization";
import { prisma } from "@/lib/prisma/client";
import { AppError } from "@/lib/errors/app-error";
import { ErrorCode } from "@/lib/errors/codes";
import { checkRateLimit, RatePresets } from "@/lib/rate-limit";
import { canTransition, generateExternalId, type AwsConnectionStatus } from "@/domain/aws/connection";
import { parseRoleArn } from "@/domain/aws/iam";
import { StsValidationError, validateRoleAssumable } from "@/infrastructure/providers/aws/sts";
import { getEnv } from "@/lib/env/server";
import { ensureAwsAccount } from "@/lib/aws/registry";
import { roleArnSchema } from "@/schemas/aws";

/**
 * AWS connection management — NG-AWS-04
 * - Organization always derives from the session (never client input).
 * - A new entry supersedes any non-terminal connection (old → DISCONNECTED first).
 * - External IDs are fresh per connection; the trust policy must carry the latest one.
 * - Shape validation here; STS proof of assumability arrives in NG-AWS-03.
 */

export type ConnectionDTO = {
  id: string;
  status: string;
  roleArn: string | null;
  externalId: string;
  lastValidatedAt: string | null;
  lastError: string | null;
  updatedAt: string;
};

function toDTO(c: {
  id: string;
  status: string;
  roleArn: string | null;
  externalId: string;
  lastValidatedAt: Date | null;
  lastError: string | null;
  updatedAt: Date;
}): ConnectionDTO {
  return {
    id: c.id,
    status: c.status,
    roleArn: c.roleArn,
    externalId: c.externalId,
    lastValidatedAt: c.lastValidatedAt?.toISOString() ?? null,
    lastError: c.lastError,
    updatedAt: c.updatedAt.toISOString(),
  };
}

/** NG-AWS-05: session-scoped read of the workspace's latest connection. */
export async function getConnection(): Promise<{ ok: true; connection: ConnectionDTO | null }> {
  const { userId } = await requireAuth();
  const org = await ensurePersonalOrganization(userId);
  const latest = await prisma.awsConnection.findFirst({
    where: { organizationId: org.id },
    orderBy: { updatedAt: "desc" },
  });
  return { ok: true, connection: latest ? toDTO(latest) : null };
}

async function clientId(prefix: string): Promise<string> {
  try {
    const h = await headers();
    const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? h.get("x-real-ip") ?? "unknown";
    return `${prefix}:${ip}`;
  } catch {
    return `${prefix}:unknown`;
  }
}

export async function createConnection(
  raw: unknown
): Promise<{ ok: true; connection: ConnectionDTO } | { ok: false; error: string; field?: string }> {
  const { userId } = await requireAuth();
  const rl = checkRateLimit(await clientId("action:createConnection"), RatePresets.auth.limit, RatePresets.auth.windowMs);
  if (!rl.allowed) return { ok: false, error: "Too many attempts. Please wait and try again." };

  const parsed = roleArnSchema.safeParse(raw);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    if (!first) return { ok: false, error: "Invalid input." };
    return { ok: false, error: first.message, field: first.path.join(".") || undefined };
  }
  const roleArn = parsed.data.roleArn;

  try {
    const org = await ensurePersonalOrganization(userId);
    const latest = await prisma.awsConnection.findFirst({
      where: { organizationId: org.id },
      orderBy: { updatedAt: "desc" },
    });
    if (latest && latest.status !== "DISCONNECTED") {
      if (!canTransition(latest.status as AwsConnectionStatus, "DISCONNECTED")) {
        return { ok: false, error: "Connection is busy. Try again when the current sync finishes." };
      }
      await prisma.awsConnection.update({ where: { id: latest.id }, data: { status: "DISCONNECTED" } });
    }

    // Unique externalId with retry on collision (unique constraint is the backstop).
    let lastError: unknown = null;
    for (let i = 0; i < 3; i++) {
      try {
        const created = await prisma.awsConnection.create({
          data: { organizationId: org.id, roleArn, externalId: generateExternalId(), status: "PENDING" },
        });
        return { ok: true, connection: toDTO(created) };
      } catch (e) {
        if ((e as { code?: string })?.code === "P2002") {
          lastError = e;
          continue;
        }
        throw e;
      }
    }
    throw new AppError({ code: ErrorCode.DB_FAILURE, message: "Could not create connection. Please try again.", cause: lastError });
  } catch (e) {
    if (e instanceof AppError) throw e;
    throw new AppError({ code: ErrorCode.DB_FAILURE, message: "Could not create connection.", cause: e });
  }
}

const VALIDATABLE_STATUSES: AwsConnectionStatus[] = ["PENDING", "AUTH_FAILED", "PERMISSION_DENIED", "RATE_LIMITED", "ERROR"];

function friendlyValidationMessage(status: string): string {
  if (status === "AUTH_FAILED") return "AWS refused the role. Check the trust policy and External ID, then retry.";
  if (status === "RATE_LIMITED") return "AWS throttled the request. Wait a minute and retry.";
  return "Validation failed unexpectedly. Try again.";
}

/**
 * NG-AWS-03: prove the stored Role ARN is assumable with the workspace External ID.
 * Temporary credentials are used inside the STS wrapper and dropped — never stored.
 */
export async function validateConnection(): Promise<
  { ok: true; connection: ConnectionDTO } | { ok: false; error: string; status?: string }
> {
  const { userId } = await requireAuth();
  const rl = checkRateLimit(await clientId("action:validateConnection"), RatePresets.auth.limit, RatePresets.auth.windowMs);
  if (!rl.allowed) return { ok: false, error: "Too many attempts. Please wait and try again." };

  try {
    const org = await ensurePersonalOrganization(userId);
    const latest = await prisma.awsConnection.findFirst({
      where: { organizationId: org.id },
      orderBy: { updatedAt: "desc" },
    });
    if (!latest || !VALIDATABLE_STATUSES.includes(latest.status as AwsConnectionStatus)) {
      return { ok: false, error: "Nothing to validate right now." };
    }
    if (!latest.roleArn) return { ok: false, error: "No Role ARN on this connection. Enter one first." };
    if (!canTransition(latest.status as AwsConnectionStatus, "VALIDATING")) {
      return { ok: false, error: "Validation already in progress. Try again shortly." };
    }
    await prisma.awsConnection.update({ where: { id: latest.id }, data: { status: "VALIDATING" } });

    try {
      const expectedAccount = parseRoleArn(latest.roleArn)?.accountId;
      const region = getEnv().AWS_REGION ?? "eu-west-1";
      const { accountId } = await validateRoleAssumable({
        roleArn: latest.roleArn,
        externalId: latest.externalId,
        region,
      });
      if (expectedAccount && accountId !== expectedAccount) {
        await prisma.awsConnection.update({
          where: { id: latest.id },
          data: { status: "AUTH_FAILED", lastError: "Assumed role account does not match the stored Role ARN." },
        });
        return { ok: false, error: "AWS refused the role. Check the trust policy and External ID, then retry.", status: "AUTH_FAILED" };
      }
      const connected = await prisma.awsConnection.update({
        where: { id: latest.id },
        data: { status: "CONNECTED", lastValidatedAt: new Date(), lastError: null },
      });
      // NG-AWS-06: validation discovers the account — register it (inventory only;
      // a registry hiccup must not undo a proven connection).
      try {
        await ensureAwsAccount({ organizationId: org.id, accountId });
      } catch (registryError) {
        console.error("[NG-AWS-06] account registry write failed after successful validation:", registryError);
      }
      return { ok: true, connection: toDTO(connected) };
    } catch (e) {
      const status = e instanceof StsValidationError ? e.status : ("ERROR" as const);
      const raw = e instanceof Error ? e.message : "Unknown validation failure.";
      await prisma.awsConnection.update({
        where: { id: latest.id },
        data: { status, lastError: raw.slice(0, 500) },
      });
      return { ok: false, error: friendlyValidationMessage(status), status };
    }
  } catch (e) {
    if (e instanceof AppError) throw e;
    throw new AppError({ code: ErrorCode.DB_FAILURE, message: "Could not validate connection.", cause: e });
  }
}

export async function disconnectConnection(): Promise<{ ok: true } | { ok: false; error: string }> {
  const { userId } = await requireAuth();
  const rl = checkRateLimit(await clientId("action:disconnectConnection"), RatePresets.auth.limit, RatePresets.auth.windowMs);
  if (!rl.allowed) return { ok: false, error: "Too many attempts. Please wait and try again." };

  try {
    const org = await ensurePersonalOrganization(userId);
    const latest = await prisma.awsConnection.findFirst({
      where: { organizationId: org.id },
      orderBy: { updatedAt: "desc" },
    });
    if (!latest || latest.status === "DISCONNECTED") return { ok: false, error: "No active connection." };
    if (!canTransition(latest.status as AwsConnectionStatus, "DISCONNECTED")) {
      return { ok: false, error: "Connection is busy. Try again when the current sync finishes." };
    }
    await prisma.awsConnection.update({ where: { id: latest.id }, data: { status: "DISCONNECTED" } });
    return { ok: true };
  } catch (e) {
    if (e instanceof AppError) throw e;
    throw new AppError({ code: ErrorCode.DB_FAILURE, message: "Could not disconnect.", cause: e });
  }
}
