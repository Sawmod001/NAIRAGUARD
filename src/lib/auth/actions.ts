"use server";

import bcrypt from "bcryptjs";
import { signUpSchema } from "@/schemas/auth";
import { prisma } from "@/lib/prisma/client";
import { AppError } from "@/lib/errors/app-error";
import { ErrorCode } from "@/lib/errors/codes";

/**
 * Sign-up server action — NG-101 Real Prod
 * - Validates via zod (NG-006) before DB
 * - bcrypt hash (12 rounds), never plaintext/logs
 * - Email verification dormant: create user, do NOT block. When EMAIL_FROM verified, add send.
 */

export async function signUp(raw: unknown): Promise<{ ok: true; userId: string } | { ok: false; error: string; field?: string }> {
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
    const user = await prisma.user.create({
      data: { email, password: hash, name: name?.trim() || null },
    });
    // Dormant: when Resend + EMAIL_FROM verified, create VerificationToken + send email here
    return { ok: true, userId: user.id };
  } catch (e) {
    throw new AppError({ code: ErrorCode.DB_FAILURE, message: "Could not create account.", cause: e });
  }
}
