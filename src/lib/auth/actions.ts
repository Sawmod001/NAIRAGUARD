"use server";

import bcrypt from "bcryptjs";
import { headers } from "next/headers";
import { signUpSchema } from "@/schemas/auth";
import { prisma } from "@/lib/prisma/client";
import { AppError } from "@/lib/errors/app-error";
import { ErrorCode } from "@/lib/errors/codes";
import { checkRateLimit, RatePresets } from "@/lib/rate-limit";

/**
 * Sign-up server action — NG-101 Real Prod
 * - Validates via zod (NG-006) before DB
 * - bcrypt hash (12 rounds), never plaintext/logs
 * - Email verification dormant: create user, do NOT block. When EMAIL_FROM verified, add send.
 */

export async function signUp(raw: unknown): Promise<{ ok: true; userId: string } | { ok: false; error: string; field?: string }> {
  // Rate limit per IP on sign-up (§2)
  try {
    const h = await headers();
    const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? h.get("x-real-ip") ?? "unknown";
    const rl = checkRateLimit(`action:signUp:${ip}`, RatePresets.auth.limit, RatePresets.auth.windowMs);
    if (!rl.allowed) return { ok: false, error: "Too many attempts. Please wait and try again." };
  } catch {}

  const parsed = signUpSchema.safeParse(raw);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    if (!first) return { ok: false, error: "Invalid input." };
    return { ok: false, error: first.message, field: first.path.join(".") || undefined };
  }
  const { email, password, name } = parsed.data;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { ok: false, error: "Email already registered.", field: "email" };
  }
  const hash = await bcrypt.hash(password, 12);
  try {
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({ data: { email, password: hash, name: name?.trim() || null } });
      const orgName = (name?.trim() || email.split("@")[0] || "Personal") + "'s Workspace";
      const org = await tx.organization.create({ data: { name: orgName } });
      await tx.membership.create({ data: { userId: user.id, organizationId: org.id, role: "owner" } });
      return user;
    });
    return { ok: true, userId: result.id };
  } catch (e) {
    throw new AppError({ code: ErrorCode.DB_FAILURE, message: "Could not create account.", cause: e });
  }
}
