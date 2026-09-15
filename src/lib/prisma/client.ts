import { PrismaClient } from "@prisma/client";

/**
 * Prisma Client Singleton — NG-004
 * Prevents multiple clients in Next.js dev HMR per docs/12_CODING_STANDARDS.md
 * and Prisma Next.js best practice (avoid exhausting connections).
 *
 * Usage:
 *   import { prisma } from "@/lib/prisma/client";
 *   await prisma.healthCheck.findMany();
 *
 * Connection: DATABASE_URL from validated env (src/lib/env). In Demo mode
 * the app boots without DB; only `pnpm db:migrate` / runtime DB calls require it.
 */

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    // log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
