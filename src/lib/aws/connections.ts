"use server";

import { headers } from "next/headers";
import { requireAuth } from "@/lib/auth/helpers";
import { ensurePersonalOrganization } from "@/lib/auth/organization";
import { prisma } from "@/lib/prisma/client";
import { AppError } from "@/lib/errors/app-error";
import { ErrorCode } from "@/lib/errors/codes";
import { checkRateLimit, RatePresets } from "@/lib/rate-limit";
import { canTransition, generateExternalId, type AwsConnectionStatus } from "@/domain/aws/connection";
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
  updatedAt: string;
};

function toDTO(c: { id: string; status: string; roleArn: string | null; externalId: string; updatedAt: Date }): ConnectionDTO {
  return { id: c.id, status: c.status, roleArn: c.roleArn, externalId: c.externalId, updatedAt: c.updatedAt.toISOString() };
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
