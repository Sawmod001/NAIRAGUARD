import { z } from "zod";

/**
 * NairaGuard Environment Schemas — NG-003
 * Validates server/client env separation per docs/18_ENVIRONMENT.md + docs/10_SECURITY.md
 *
 * Modes:
 *  APP_MODE=demo | aws
 *  AI_MODE=mock | live
 *  FX_MODE=demo | live
 *
 * Demo Mode must not require AWS credentials.
 */

// --- Enums ---
export const appModeSchema = z.enum(["demo", "aws"]).default("demo");
export const aiModeSchema = z.enum(["mock", "live"]).default("mock");
export const fxModeSchema = z.enum(["demo", "live"]).default("demo");

// --- Helpers ---
const optionalUrl = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v === "" ? undefined : v))
  .pipe(z.string().url().optional());

const optionalNonEmpty = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v === "" ? undefined : v));

// --- Client (NEXT_PUBLIC_ only) — no auth secrets per docs/10 ---
export const clientEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v === "" ? undefined : v))
    .pipe(z.string().url().optional())
    .or(z.literal("").transform(() => undefined)),
});

// --- Server ---
export const serverEnvSchema = z
  .object({
    // Modes
    APP_MODE: appModeSchema,
    AI_MODE: aiModeSchema,
    FX_MODE: fxModeSchema,
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

    // Database — required only when APP_MODE=aws or in production with real DB
    // For NG-003 we keep it optional so Demo boots without DB.
    DATABASE_URL: optionalNonEmpty,

    // Auth — Auth.js (server-only, no NEXT_PUBLIC_)
    AUTH_SECRET: optionalNonEmpty,
    AUTH_URL: optionalUrl,
    RESEND_API_KEY: optionalNonEmpty,
    EMAIL_FROM: optionalNonEmpty,

    // AI provider — required only when AI_MODE=live
    AI_PROVIDER_API_KEY: optionalNonEmpty,
    AI_PROVIDER_MODEL: optionalNonEmpty,

    // FX provider — required only when FX_MODE=live
    FX_PROVIDER_API_KEY: optionalNonEmpty,
    FX_PROVIDER_URL: optionalUrl,

    // App URL (server copy)
    NEXT_PUBLIC_APP_URL: optionalNonEmpty,
  })
  .superRefine((val, ctx) => {
    if (val.AI_MODE === "live" && !val.AI_PROVIDER_API_KEY) {
      // Soft warning via validation — not hard fail for NG-003 to keep Demo+live AI opt-in.
      // We add an issue only if strictly required; here we allow missing but document requirement.
      // Uncomment to enforce:
      // ctx.addIssue({ code: z.ZodIssueCode.custom, message: "AI_PROVIDER_API_KEY required when AI_MODE=live", path: ["AI_PROVIDER_API_KEY"] });
    }
    if (val.FX_MODE === "live" && !val.FX_PROVIDER_URL && !val.FX_PROVIDER_API_KEY) {
      // Same: FX live can work with free provider (docs/09) — keep optional for now.
    }
    if (val.APP_MODE === "aws" && !val.DATABASE_URL) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "DATABASE_URL required when APP_MODE=aws",
        path: ["DATABASE_URL"],
      });
    }
  });

export type AppMode = z.infer<typeof appModeSchema>;
export type AiMode = z.infer<typeof aiModeSchema>;
export type FxMode = z.infer<typeof fxModeSchema>;
export type ServerEnv = z.infer<typeof serverEnvSchema>;
export type ClientEnv = z.infer<typeof clientEnvSchema>;
