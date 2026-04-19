import type {
  CommunityRole,
} from "@/features/community/types";

export type RecommendationSection =
  | "related_creators"
  | "related_works";

/**
 * Stable identity field consumed by `rankCandidates` for the
 * `targetKey` asc tie-breaker. For creators it is `${role}:${slug}`;
 * for works it is `workId`. Always set by the orchestration mapping
 * layer so that `scoring.ts` / `rankCandidates` stays
 * dimensionless.
 */
export type CreatorSignals = {
  targetKey: string;
  role: CommunityRole;
  slug: string;
  city: string;
  shootingFocus: string;
  /**
   * Always non-empty after orchestration mapping; falls back to
   * `record.publishedAt ?? ""` per design §11 I-12 to preserve
   * deterministic FR-007 tie-breaker even when the underlying
   * record has no `updatedAt`.
   */
  updatedAt: string;
};

export type WorkSignals = {
  targetKey: string;
  workId: string;
  ownerProfileId: string;
  ownerCity: string;
  ownerShootingFocus: string;
  category: string;
  updatedAt: string;
};

export type RankedCandidate<TSignals> = {
  candidate: TSignals;
  score: number;
  breakdown: Record<string, number>;
};

export type RelatedCreatorCard = {
  role: CommunityRole;
  slug: string;
  name: string;
  city: string;
  shootingFocus: string;
  heroAsset: string | undefined;
};

export type RelatedWorkCard = {
  workId: string;
  title: string;
  category: string;
  ownerName: string;
  ownerRole: CommunityRole;
  ownerSlug: string;
  coverAsset: string;
};

export type RelatedSectionResult<TCard> =
  | { kind: "rendered"; cards: TCard[] }
  | { kind: "empty"; reason: "no-candidates" | "soft-fail" };
