import {
  RELATED_CREATORS_WEIGHTS,
  RELATED_WORKS_WEIGHTS,
  type RelatedCreatorsWeights,
  type RelatedWorksWeights,
  CARDS_LIMIT,
} from "./signals";
import type {
  CreatorSignals,
  RankedCandidate,
  WorkSignals,
} from "./types";

export type ScoreOutput = {
  score: number;
  breakdown: Record<string, number>;
};

function nonEmpty(value: string | undefined): boolean {
  return typeof value === "string" && value.length > 0;
}

function fieldsMatch(a: string, b: string): boolean {
  return nonEmpty(a) && nonEmpty(b) && a === b;
}

export function scoreCreator(
  seed: CreatorSignals,
  candidate: CreatorSignals,
  weights: RelatedCreatorsWeights | { city: number; shootingFocus: number } = RELATED_CREATORS_WEIGHTS,
): ScoreOutput {
  const cityHit = fieldsMatch(seed.city, candidate.city) ? 1 : 0;
  const focusHit = fieldsMatch(seed.shootingFocus, candidate.shootingFocus)
    ? 1
    : 0;

  const cityContrib = weights.city * cityHit;
  const focusContrib = weights.shootingFocus * focusHit;
  const score = cityContrib + focusContrib;

  return {
    score,
    breakdown: {
      city: cityContrib,
      shootingFocus: focusContrib,
    },
  };
}

export function scoreWork(
  seed: WorkSignals,
  candidate: WorkSignals,
  weights:
    | RelatedWorksWeights
    | { sameOwner: number; ownerCity: number; category: number } = RELATED_WORKS_WEIGHTS,
): ScoreOutput {
  const sameOwnerHit = fieldsMatch(seed.ownerProfileId, candidate.ownerProfileId)
    ? 1
    : 0;
  const sameOwnerCityHit = fieldsMatch(seed.ownerCity, candidate.ownerCity)
    ? 1
    : 0;
  const sameCategoryHit = fieldsMatch(seed.category, candidate.category) ? 1 : 0;

  const sameOwnerContrib = weights.sameOwner * sameOwnerHit;
  const ownerCityContrib = weights.ownerCity * sameOwnerCityHit;
  const categoryContrib = weights.category * sameCategoryHit;

  const score = sameOwnerContrib + ownerCityContrib + categoryContrib;

  return {
    score,
    breakdown: {
      sameOwner: sameOwnerContrib,
      ownerCity: ownerCityContrib,
      category: categoryContrib,
    },
  };
}

type RankableSignals = { targetKey: string; updatedAt: string };

export type RankOptions<TSignals> = {
  limit?: number;
  isSelf?: (candidate: TSignals) => boolean;
};

/**
 * Stable, deterministic ranking. Sort key:
 *   1. score desc (primary)
 *   2. updatedAt desc (first tie-breaker per FR-007)
 *   3. targetKey asc (final tie-breaker per FR-007)
 *
 * Designed to satisfy I-1 (pure / deterministic) and I-7 (self
 * filtering is the orchestrator's responsibility — passed in via
 * `options.isSelf`).
 */
export function rankCandidates<TSignals extends RankableSignals>(
  seed: TSignals,
  candidates: TSignals[],
  scoreFn: (s: TSignals, c: TSignals) => ScoreOutput,
  options: RankOptions<TSignals> = {},
): RankedCandidate<TSignals>[] {
  const limit = options.limit ?? CARDS_LIMIT;
  const isSelf = options.isSelf ?? (() => false);

  const scored: RankedCandidate<TSignals>[] = [];
  for (const candidate of candidates) {
    if (isSelf(candidate)) continue;
    const { score, breakdown } = scoreFn(seed, candidate);
    scored.push({ candidate, score, breakdown });
  }

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    // updatedAt desc — empty strings sort last so candidates with
    // missing updatedAt do not preempt newer entries.
    if (a.candidate.updatedAt !== b.candidate.updatedAt) {
      if (a.candidate.updatedAt === "") return 1;
      if (b.candidate.updatedAt === "") return -1;
      return a.candidate.updatedAt > b.candidate.updatedAt ? -1 : 1;
    }
    if (a.candidate.targetKey !== b.candidate.targetKey) {
      return a.candidate.targetKey < b.candidate.targetKey ? -1 : 1;
    }
    return 0;
  });

  return scored.slice(0, limit);
}
