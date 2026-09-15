import "server-only";

import { serverEnvSchema, type ServerEnv } from "@/schemas/env";

/**
 * Server-only environment — NG-003
 * Validates process.env at import time. Never import this in client components.
 * per docs/10_SECURITY.md: secrets never rendered to client.
 */

function getServerEnv(): ServerEnv {
  const parsed = serverEnvSchema.safeParse(process.env);
  if (!parsed.success) {
    const details = parsed.error.issues
      .map((i) => `  - ${i.path.join(".") || "(root)"}: ${i.message}`)
      .join("\n");
    throw new Error(
      `[env] Invalid server environment:\n${details}\n` +
        `Check .env.local against .env.example (docs/18_ENVIRONMENT.md).`
    );
  }
  return parsed.data;
}

// Lazy singleton — parsed once per process
let cached: ServerEnv | null = null;

export function getEnv(): ServerEnv {
  if (!cached) cached = getServerEnv();
  return cached;
}

// Eager export for convenience (validated on first import)
export const env = getEnv();

// Helpers
export function isDemoMode(): boolean {
  return getEnv().APP_MODE === "demo";
}
export function isLiveAiMode(): boolean {
  return getEnv().AI_MODE === "live";
}
export function isLiveFxMode(): boolean {
  return getEnv().FX_MODE === "live";
}
