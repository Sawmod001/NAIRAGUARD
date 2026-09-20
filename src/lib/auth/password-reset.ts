"use server";

import bcrypt from "bcryptjs";
import { createHash, randomBytes } from "crypto";
import { headers } from "next/headers";
import { forgotPasswordSchema, resetPasswordSchema } from "@/schemas/auth";
import { prisma } from "@/lib/prisma/client";
import { AppError } from "@/lib/errors/app-error";
import { ErrorCode } from "@/lib/errors/codes";
import { checkRateLimit, RatePresets } from "@/lib/rate-limit";

/**
 * Password reset — NG-AUTH-05
 * - Generic responses: never reveal whether an email is registered (anti-enumeration).
 * - Token stored as sha256 hash, single-use, 1h expiry.
 * - bcrypt hash (12 rounds) for the new password, never plaintext/logs.
 * - Email sending dormant until EMAIL_FROM verified: token logged server-side only in dev.
 */

const RESET_TTL_MS = 60 * 60 * 1000; // 1 hour
const GENERIC_OK = "If an account exists for that email, a reset link has been sent.";

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

async function clientIp(): Promise<string> {
  try {
    const h = await headers();
    return h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? h.get("x-real-ip") ?? "unknown";
  } catch {
    return "unknown";
  }
}

export async function requestPasswordReset(
  raw: unknown
): Promise<{ ok: true; message: string } | { ok: false; error: string; field?: string }> {
  const ip = await clientIp();
  const rl = checkRateLimit(`action:requestPasswordReset:${ip}`, RatePresets.auth.limit, RatePresets.auth.windowMs);
  if (!rl.allowed) return { ok: false, error: "Too many attempts. Please wait and try again." };

  const parsed = forgotPasswordSchema.safeParse(raw);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    if (!first) return { ok: false, error: "Invalid input." };
    return { ok: false, error: first.message, field: first.path.join(".") || undefined };
  }
  const { email } = parsed.data;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    // Anti-enumeration: same response whether or not the user exists.
    if (!user) return { ok: true, message: GENERIC_OK };

    // Invalidate prior unused tokens for this email (single active token).
    await prisma.passwordResetToken.updateMany({
      where: { email, usedAt: null },
      data: { usedAt: new Date() },
    });

    const token = randomBytes(32).toString("hex");
    const tokenHash = hashToken(token);
    await prisma.passwordResetToken.create({
      data: { email, tokenHash, expires: new Date(Date.now() + RESET_TTL_MS) },
    });

    // Email dormant: EMAIL_FROM not verified → no email sent. Log server-side only.
    if (!process.env.EMAIL_FROM) {
      console.log(`[NG-AUTH-05] password reset requested for ${email} — token (dev only, email dormant)`);
      if (process.env.NODE_ENV !== "production") {
        console.log(`[NG-AUTH-05] reset link: /reset-password?token=${token}`);
      }
    } else {
      // When domain verified: send email containing /reset-password?token=... here.
      console.log(`[NG-AUTH-05] password reset token created for ${email} (email send pending EMAIL setup)`);
    }

    return { ok: true, message: GENERIC_OK };
  } catch (e) {
    throw new AppError({ code: ErrorCode.DB_FAILURE, message: "Could not process reset request.", cause: e });
  }
}

export async function resetPassword(
  raw: unknown
): Promise<{ ok: true } | { ok: false; error: string; field?: string }> {
  const ip = await clientIp();
  const rl = checkRateLimit(`action:resetPassword:${ip}`, RatePresets.auth.limit, RatePresets.auth.windowMs);
  if (!rl.allowed) return { ok: false, error: "Too many attempts. Please wait and try again." };

  const parsed = resetPasswordSchema.safeParse(raw);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    if (!first) return { ok: false, error: "Invalid input." };
    return { ok: false, error: first.message, field: first.path.join(".") || undefined };
  }
  const { token, password } = parsed.data;
  const tokenHash = hashToken(token);

  try {
    const record = await prisma.passwordResetToken.findUnique({ where: { tokenHash } });
    if (!record || record.usedAt || record.expires.getTime() < Date.now()) {
      return { ok: false, error: "Reset link is invalid or has expired. Request a new one." };
    }
    const user = await prisma.user.findUnique({ where: { email: record.email } });
    if (!user) {
      // Token valid but user gone — consume token, generic error.
      await prisma.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } });
      return { ok: false, error: "Reset link is invalid or has expired. Request a new one." };
    }
    const hash = await bcrypt.hash(password, 12);
    await prisma.$transaction([
      prisma.user.update({ where: { id: user.id }, data: { password: hash } }),
      prisma.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
      prisma.passwordResetToken.updateMany({ where: { email: record.email, usedAt: null }, data: { usedAt: new Date() } }),
    ]);
    return { ok: true };
  } catch (e) {
    if (e instanceof AppError) throw e;
    throw new AppError({ code: ErrorCode.DB_FAILURE, message: "Could not reset password.", cause: e });
  }
}
