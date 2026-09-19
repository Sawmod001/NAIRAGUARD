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
  // NG-ORG-01: slug/type/country per 02-AUTH-ORG-DEMO.md (no currency selector)
  const orgName = (name?.trim() || email.split("@")[0] || "Personal") + "'s Workspace";
  const baseSlug = orgName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || "workspace";
  let slug = baseSlug;
  // Ensure uniqueness before transaction (best-effort; transaction will catch race)
  for (let i = 0; i < 5; i++) {
    const candidate = i === 0 ? baseSlug : `${baseSlug}-${i + 1}`;
    const existingOrg = await prisma.organization.findUnique({ where: { slug: candidate } });
    if (!existingOrg) {
      slug = candidate;
      break;
    }
  }
  try {
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({ data: { email, password: hash, name: name?.trim() || null } });
      // Re-check slug uniqueness inside transaction
      let finalSlug = slug;
      for (let i = 0; i < 5; i++) {
        const c = i === 0 ? slug : `${slug}-${i + 1}`;
        const ex = await tx.organization.findUnique({ where: { slug: c } });
        if (!ex) {
          finalSlug = c;
          break;
        }
      }
      // Fallback suffix if still colliding
      const slugExists = await tx.organization.findUnique({ where: { slug: finalSlug } });
      if (slugExists) finalSlug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;
      const org = await tx.organization.create({ data: { name: orgName, slug: finalSlug, type: "workspace", country: "NG" } });
      await tx.membership.create({ data: { userId: user.id, organizationId: org.id, role: "OWNER" } });
      return user;
    });
    return { ok: true, userId: result.id };
  } catch (e) {
    throw new AppError({ code: ErrorCode.DB_FAILURE, message: "Could not create account.", cause: e });
  }
}
