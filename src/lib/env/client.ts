import { clientEnvSchema, type ClientEnv } from "@/schemas/env";

/**
 * Client-safe environment — NG-003
 * Only NEXT_PUBLIC_ vars are allowed. Never expose secrets.
 * This module is safe to import in client components.
 */

function getClientEnv(): ClientEnv {
  // Client bundle only sees NEXT_PUBLIC_ vars; process.env on client is replaced at build.
  const raw: Record<string, string | undefined> = {
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  };
  const parsed = clientEnvSchema.safeParse(raw);
  if (!parsed.success) {
    const details = parsed.error.issues
      .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    throw new Error(`[env] Invalid client environment:\n${details}`);
  }
  return parsed.data;
}

let cached: ClientEnv | null = null;

export function getClientEnvSafe(): ClientEnv {
  if (!cached) cached = getClientEnv();
  return cached;
}

export const clientEnv = getClientEnvSafe();
