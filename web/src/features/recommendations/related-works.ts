import type {
  CommunityRepositoryBundle,
  CommunityWorkRecord,
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
  incrementRelatedWorksCardsRendered,
  incrementRelatedWorksEmpty,
} from "./metrics";
import { rankCandidates, scoreWork } from "./scoring";
import { CARDS_LIMIT } from "./signals";
import type {
  RelatedSectionResult,
  RelatedWorkCard,
  WorkSignals,
} from "./types";

export type GetRelatedWorksDeps = {
  bundle?: CommunityRepositoryBundle;
  metrics?: MetricsRegistry;
  logger?: Logger;
  flagEnabled?: boolean;
};

export type RelatedWorksSeed = {
  workId: string;
};

function workToSignals(
  work: CommunityWorkRecord,
  ownerProfileById: Map<string, CreatorProfileRecord>,
): WorkSignals {
  const owner = ownerProfileById.get(work.ownerProfileId);
  return {
    targetKey: work.id,
    workId: work.id,
    ownerProfileId: work.ownerProfileId,
    ownerCity: owner?.city ?? "",
    ownerShootingFocus: owner?.shootingFocus ?? "",
    category: work.category,
    // I-12: deterministic fallback so FR-007 tie-breaker stays stable.
    updatedAt: work.updatedAt ?? work.publishedAt ?? "",
  };
}

function workToCard(work: CommunityWorkRecord): RelatedWorkCard {
  return {
    workId: work.id,
    title: work.title,
    category: work.category,
    ownerName: work.ownerName,
    ownerRole: work.ownerRole,
    ownerSlug: work.ownerSlug,
    coverAsset: work.coverAsset,
  };
}

/**
 * Get the rule-based "related works" section model for a public
 * work-detail page. Returns:
 *   - `null` when the feature flag is disabled
 *   - `{ kind: "rendered", cards }` when matching candidates exist
 *   - `{ kind: "empty", reason }` for stable empty state
 *
 * Reads `listPublicWorks` and `listPublicProfiles` exactly once each
 * (FR-008 #3) and builds an in-memory `ownerProfileById` map so
 * candidate scoring never N×repository-reads owner profile.
 */
export async function getRelatedWorks(
  seed: RelatedWorksSeed,
  deps: GetRelatedWorksDeps = {},
): Promise<RelatedSectionResult<RelatedWorkCard> | null> {
  const flagEnabled =
    deps.flagEnabled ?? getRecommendationsConfig().relatedEnabled;
  if (!flagEnabled) {
    return null;
  }

  const bundle = deps.bundle ?? (await loadDefaultBundle());
  const metrics = deps.metrics;
  const logger = deps.logger;

  const startedAt = performance.now();

  let publicWorks: CommunityWorkRecord[];
  let allProfiles: CreatorProfileRecord[];
  try {
    [publicWorks, allProfiles] = await Promise.all([
      bundle.works.listPublicWorks(),
      bundle.profiles.listPublicProfiles(),
    ]);
  } catch (error) {
    logger?.warn("recommendations.section.failed", {
      module: "recommendations",
      error,
    });
    if (metrics) incrementRelatedWorksEmpty(metrics);
    return { kind: "empty", reason: "soft-fail" };
  }

  try {
    const ownerProfileById = new Map<string, CreatorProfileRecord>();
    for (const profile of allProfiles) {
      ownerProfileById.set(profile.id, profile);
    }

    const seedRecord = publicWorks.find((work) => work.id === seed.workId);
    const seedSignals: WorkSignals = seedRecord
      ? workToSignals(seedRecord, ownerProfileById)
      : {
          targetKey: seed.workId,
          workId: seed.workId,
          ownerProfileId: "",
          ownerCity: "",
          ownerShootingFocus: "",
          category: "",
          updatedAt: "",
        };

    const candidateSignals = publicWorks.map((work) =>
      workToSignals(work, ownerProfileById),
    );

    const ranked = rankCandidates(seedSignals, candidateSignals, scoreWork, {
      limit: CARDS_LIMIT,
      isSelf: (signals) => signals.targetKey === seed.workId,
    });

    if (ranked.length === 0) {
      if (metrics) incrementRelatedWorksEmpty(metrics);
      logger?.info("recommendations.section.rendered", {
        module: "recommendations",
        durationMs: Math.round(performance.now() - startedAt),
      });
      return { kind: "empty", reason: "no-candidates" };
    }

    const cards = ranked.map((entry) => {
      const work = publicWorks.find((w) => w.id === entry.candidate.workId);
      if (!work) {
        return {
          workId: entry.candidate.workId,
          title: entry.candidate.workId,
          category: entry.candidate.category,
          ownerName: "",
          ownerRole: "photographer" as const,
          ownerSlug: "",
          coverAsset: "",
        } satisfies RelatedWorkCard;
      }
      return workToCard(work);
    });

    if (metrics) {
      incrementRelatedWorksCardsRendered(metrics, cards.length);
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
    if (metrics) incrementRelatedWorksEmpty(metrics);
    return { kind: "empty", reason: "soft-fail" };
  }
}

async function loadDefaultBundle(): Promise<CommunityRepositoryBundle> {
  const { getDefaultCommunityRepositoryBundle } = await import(
    "@/features/community/runtime"
  );
  return getDefaultCommunityRepositoryBundle();
}
