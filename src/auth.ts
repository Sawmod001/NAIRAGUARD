import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { prisma } from "@/lib/prisma/client";

/**
 * Auth.js v5 — NG-101 Real Prod
 * Prisma/Postgres + DB sessions (httpOnly secure cookie)
 * Credentials (email+password) with bcrypt. Email verification dormant: EMAIL_FROM not set → no block.
 * When domain verified, set EMAIL_FROM + enable requireEmailVerification flag.
 */

// Dormant verification — flip when domain ready
const requireEmailVerification = false;

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "database" },
  trustHost: true,
  secret: process.env.AUTH_SECRET,
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;
        const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
        if (!user?.password) return null;
        if (requireEmailVerification && !user.emailVerified) return null;
        const ok = await bcrypt.compare(password, user.password);
        if (!ok) return null;
        // NG-103: ensure personal organization exists (idempotent, for users created before NG-103)
        const existingMembership = await prisma.membership.findFirst({ where: { userId: user.id } });
        if (!existingMembership) {
          const orgName = (user.name?.trim() || user.email.split("@")[0] || "Personal") + "'s Workspace";
          const org = await prisma.organization.create({ data: { name: orgName } });
          await prisma.membership.create({ data: { userId: user.id, organizationId: org.id, role: "owner" } });
        }
        return { id: user.id, email: user.email, name: user.name ?? undefined };
      },
    }),
  ],
  callbacks: {
    // Keep session user id available
    async session({ session, user }) {
      if (session.user && user) {
        (session.user as unknown as { id: string }).id = user.id;
      }
      return session;
    },
  },
  pages: {
    signIn: "/sign-in",
  },
});
