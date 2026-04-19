import { getProfileHeroAssetRef } from "@/features/showcase/sample-data";
import type {
  CommunityRepositoryBundle,
  CommunityRole,
  CreatorProfileRecord,
} from "@/features/community/types";
import {
  type Logger,
} from "@/features/observability/logger";
import {
  type MetricsRegistry,
} from "@/features/observability/metrics";

import { getRecommendationsConfig } from "./config";
import {
  incrementRelatedCreatorsCardsRendered,
  incrementRelatedCreatorsEmpty,
} from "./metrics";
import { rankCandidates, scoreCreator } from "./scoring";
import { CARDS_LIMIT } from "./signals";
import type {
  CreatorSignals,
  RelatedCreatorCard,
  RelatedSectionResult,
} from "./types";

export type GetRelatedCreatorsDeps = {
  bundle?: CommunityRepositoryBundle;
  metrics?: MetricsRegistry;
  logger?: Logger;
  /** Override flag for tests; falls back to env-derived value. */
  flagEnabled?: boolean;
};

export type RelatedCreatorsSeed = {
  role: CommunityRole;
  slug: string;
};

function profileToSignals(profile: CreatorProfileRecord): CreatorSignals {
  return {
    targetKey: `${profile.role}:${profile.slug}`,
    role: profile.role,
    slug: profile.slug,
    city: profile.city,
    shootingFocus: profile.shootingFocus,
    // I-12: deterministic fallback so FR-007 tie-breaker is stable
    // even when the underlying record has no updatedAt.
    updatedAt: profile.updatedAt ?? profile.publishedAt ?? "",
  };
}

function profileToCard(profile: CreatorProfileRecord): RelatedCreatorCard {
  return {
    role: profile.role,
    slug: profile.slug,
    name: profile.name,
    city: profile.city,
    shootingFocus: profile.shootingFocus,
    heroAsset: getProfileHeroAssetRef(profile.role, profile.slug),
  };
}

/**
 * Get the rule-based "related creators" section model for a public
 * creator page. Returns:
 *   - `null` when the feature flag is disabled (caller renders no section)
 *   - `{ kind: "rendered", cards }` when matching candidates exist
 *   - `{ kind: "empty", reason }` for stable empty state
 *
 * Reads the candidate pool exactly once (FR-008 #3) and is fully
 * dependency-injectable for tests (NFR-005 / NFR-004).
 */
export async function getRelatedCreators(
  seed: RelatedCreatorsSeed,
  deps: GetRelatedCreatorsDeps = {},
): Promise<RelatedSectionResult<RelatedCreatorCard> | null> {
  const flagEnabled =
    deps.flagEnabled ?? getRecommendationsConfig().relatedEnabled;
  if (!flagEnabled) {
    return null;
  }

  const bundle = deps.bundle ?? (await loadDefaultBundle());
  const metrics = deps.metrics;
  const logger = deps.logger;

  const seedKey = `${seed.role}:${seed.slug}`;
  const startedAt = performance.now();

  let candidatePool: CreatorProfileRecord[];
  try {
    candidatePool = await bundle.profiles.listPublicProfiles();
  } catch (error) {
    logger?.warn("recommendations.section.failed", {
      module: "recommendations",
      error,
    });
    if (metrics) incrementRelatedCreatorsEmpty(metrics);
    return { kind: "empty", reason: "soft-fail" };
  }

  try {
    const sameRoleCandidates = candidatePool.filter(
      (profile) => profile.role === seed.role,
    );
    const seedProfile = sameRoleCandidates.find(
      (profile) => profile.slug === seed.slug,
    );
    const seedSignals: CreatorSignals = seedProfile
      ? profileToSignals(seedProfile)
      : {
          targetKey: seedKey,
          role: seed.role,
          slug: seed.slug,
          city: "",
          shootingFocus: "",
          updatedAt: "",
        };

    const candidateSignals = sameRoleCandidates.map(profileToSignals);

    const ranked = rankCandidates(seedSignals, candidateSignals, scoreCreator, {
      limit: CARDS_LIMIT,
      isSelf: (signals) => signals.targetKey === seedKey,
    });

    if (ranked.length === 0) {
      if (metrics) incrementRelatedCreatorsEmpty(metrics);
      logger?.info("recommendations.section.rendered", {
        module: "recommendations",
        durationMs: Math.round(performance.now() - startedAt),
      });
      return { kind: "empty", reason: "no-candidates" };
    }

    const cards = ranked.map((entry) => {
      const profile = sameRoleCandidates.find(
        (p) => `${p.role}:${p.slug}` === entry.candidate.targetKey,
      );
      // Safety: if the lookup ever fails (should not happen because
      // we just derived signals from `sameRoleCandidates`), fall back
      // to a minimal card so the page still renders.
      if (!profile) {
        return {
          role: entry.candidate.role,
          slug: entry.candidate.slug,
          name: entry.candidate.slug,
          city: entry.candidate.city,
          shootingFocus: entry.candidate.shootingFocus,
          heroAsset: undefined,
        } satisfies RelatedCreatorCard;
      }
      return profileToCard(profile);
    });

    if (metrics) {
      incrementRelatedCreatorsCardsRendered(metrics, cards.length);
    }
    logger?.info("recommendations.section.rendered", {
      module: "recommendations",
      durationMs: Math.round(performance.now() - startedAt),
    });

    return { kind: "rendered", cards };
  } catch (error) {
    logger?.warn("recommendations.section.failed", {
      module: "recommendations",
      error,
    });
    if (metrics) incrementRelatedCreatorsEmpty(metrics);
    return { kind: "empty", reason: "soft-fail" };
  }
}

async function loadDefaultBundle(): Promise<CommunityRepositoryBundle> {
  const { getDefaultCommunityRepositoryBundle } = await import(
    "@/features/community/runtime"
  );
  return getDefaultCommunityRepositoryBundle();
}
