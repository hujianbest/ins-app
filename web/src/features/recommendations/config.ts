import {
  type AppConfigEnv,
  type RecommendationsConfig,
  type RecommendationsConfigResult,
  getRecommendationsConfig,
  readRecommendationsConfig,
} from "@/config/env";

/**
 * Re-export the env-layer recommendations config helpers so feature
 * code only needs to import from `@/features/recommendations/config`
 * (per design §9.9). Keeping the canonical parser in env.ts allows
 * the same `ConfigWarning` reporting protocol used by
 * `readObservabilityConfig`.
 */
export type { RecommendationsConfig, RecommendationsConfigResult };

export function readRecommendationsConfigFor(
  env: AppConfigEnv,
): RecommendationsConfigResult {
  return readRecommendationsConfig(env);
}

export { readRecommendationsConfig, getRecommendationsConfig };
