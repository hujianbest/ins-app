export type {
  CreatorSignals,
  WorkSignals,
  RankedCandidate,
  RelatedCreatorCard,
  RelatedWorkCard,
  RelatedSectionResult,
  RecommendationSection,
} from "./types";

export {
  CARDS_LIMIT,
  RELATED_CREATORS_WEIGHTS,
  RELATED_WORKS_WEIGHTS,
} from "./signals";

export {
  rankCandidates,
  scoreCreator,
  scoreWork,
  type ScoreOutput,
  type RankOptions,
} from "./scoring";

export {
  RECOMMENDATIONS_COUNTER_NAMES,
  incrementRelatedCreatorsCardsRendered,
  incrementRelatedCreatorsEmpty,
  incrementRelatedWorksCardsRendered,
  incrementRelatedWorksEmpty,
} from "./metrics";

export {
  getRecommendationsConfig,
  readRecommendationsConfig,
  type RecommendationsConfig,
} from "./config";
