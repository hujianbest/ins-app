import type { MetricsRegistry } from "@/features/observability/metrics";

/**
 * Single source of truth for the recommendations metrics counter
 * key strings (design §11 I-6). Do NOT inline these strings in
 * orchestration / section code — always go through the helpers
 * below or these constants directly.
 */
export const RECOMMENDATIONS_COUNTER_NAMES = {
  relatedCreatorsCardsRendered:
    "recommendations.related_creators.cards_rendered",
  relatedCreatorsEmpty: "recommendations.related_creators.empty",
  relatedWorksCardsRendered: "recommendations.related_works.cards_rendered",
  relatedWorksEmpty: "recommendations.related_works.empty",
} as const;

export function incrementRelatedCreatorsCardsRendered(
  registry: MetricsRegistry,
  count: number,
): void {
  if (count <= 0) return;
  registry.incrementCounter(
    RECOMMENDATIONS_COUNTER_NAMES.relatedCreatorsCardsRendered,
    undefined,
    count,
  );
}

export function incrementRelatedCreatorsEmpty(registry: MetricsRegistry): void {
  registry.incrementCounter(RECOMMENDATIONS_COUNTER_NAMES.relatedCreatorsEmpty);
}

export function incrementRelatedWorksCardsRendered(
  registry: MetricsRegistry,
  count: number,
): void {
  if (count <= 0) return;
  registry.incrementCounter(
    RECOMMENDATIONS_COUNTER_NAMES.relatedWorksCardsRendered,
    undefined,
    count,
  );
}

export function incrementRelatedWorksEmpty(registry: MetricsRegistry): void {
  registry.incrementCounter(RECOMMENDATIONS_COUNTER_NAMES.relatedWorksEmpty);
}
