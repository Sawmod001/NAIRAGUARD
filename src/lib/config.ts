/**
 * NairaGuard Config Facade — NG-003
 * Thin facade over validated env for application layers.
 * Keeps domain/application code decoupled from process.env.
 */

import { getEnv, isDemoMode, isLiveAiMode, isLiveFxMode } from "@/lib/env/server";
import { getClientEnvSafe } from "@/lib/env/client";

export const config = {
  get appMode() {
    return getEnv().APP_MODE;
  },
  get aiMode() {
    return getEnv().AI_MODE;
  },
  get fxMode() {
    return getEnv().FX_MODE;
  },
  get isDemo() {
    return isDemoMode();
  },
  get isLiveAi() {
    return isLiveAiMode();
  },
  get isLiveFx() {
    return isLiveFxMode();
  },
  get databaseUrl() {
    return getEnv().DATABASE_URL;
  },
  get appUrl() {
    return getClientEnvSafe().NEXT_PUBLIC_APP_URL ?? getEnv().NEXT_PUBLIC_APP_URL;
  },
} as const;
