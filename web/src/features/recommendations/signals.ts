/**
 * Weight tables for the rule-based recommendations scoring core.
 *
 * Invariants (SRS §8.3, design §11):
 *   - RELATED_CREATORS_WEIGHTS.city >= RELATED_CREATORS_WEIGHTS.shootingFocus > 0
 *   - RELATED_WORKS_WEIGHTS.sameOwner > RELATED_WORKS_WEIGHTS.ownerCity
 *     >= RELATED_WORKS_WEIGHTS.category > 0
 *   - Each weight table sums to <= 1.0 so total score stays in [0, 1].
 *
 * Adjusting these constants is the single chokepoint for tuning
 * recommendation behaviour without touching the orchestration layer.
 */
export const RELATED_CREATORS_WEIGHTS = {
  city: 0.6,
  shootingFocus: 0.4,
} as const;

export const RELATED_WORKS_WEIGHTS = {
  sameOwner: 0.55,
  ownerCity: 0.3,
  category: 0.15,
} as const;

export const CARDS_LIMIT = 4 as const;

export type RelatedCreatorsWeights = typeof RELATED_CREATORS_WEIGHTS;
export type RelatedWorksWeights = typeof RELATED_WORKS_WEIGHTS;
