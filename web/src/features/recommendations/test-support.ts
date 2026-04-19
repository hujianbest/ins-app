import {
  type CommunityRepositoryBundle,
  type CommunityWorkRecord,
  type CreatorProfileRecord,
} from "@/features/community/types";
import { createInMemoryCommunityRepositoryBundle } from "@/features/community/test-support";
import {
  type Logger,
  type LogLevel,
} from "@/features/observability/logger";
import {
  type MetricsRegistry,
  createMetricsRegistry,
} from "@/features/observability/metrics";

export type RecordedLog = { level: LogLevel; event: string; ctx?: unknown };

export function createCapturingLogger(): {
  logger: Logger;
  records: RecordedLog[];
} {
  const records: RecordedLog[] = [];
  const push = (level: LogLevel, event: string, ctx?: unknown) =>
    records.push({ level, event, ctx });

  return {
    records,
    logger: {
      debug(event, ctx) {
        push("debug", event, ctx);
      },
      info(event, ctx) {
        push("info", event, ctx);
      },
      warn(event, ctx) {
        push("warn", event, ctx);
      },
      error(event, ctx) {
        push("error", event, ctx);
      },
    },
  };
}

export type RecommendationsTestDeps = {
  bundle: CommunityRepositoryBundle;
  metrics: MetricsRegistry;
  logger: Logger;
  capturedLogs: RecordedLog[];
};

export function createRecommendationsTestDeps(fixtures: {
  profiles: CreatorProfileRecord[];
  works: CommunityWorkRecord[];
}): RecommendationsTestDeps {
  const bundle = createInMemoryCommunityRepositoryBundle({
    profiles: fixtures.profiles,
    works: fixtures.works,
  });
  const metrics = createMetricsRegistry();
  const { logger, records } = createCapturingLogger();
  return { bundle, metrics, logger, capturedLogs: records };
}

let creatorSeq = 0;

export function fakeCreatorProfile(
  overrides: Partial<CreatorProfileRecord> & { slug?: string } = {},
): CreatorProfileRecord {
  const slug = overrides.slug ?? `creator-${++creatorSeq}`;
  return {
    id: `photographer:${slug}`,
    role: "photographer",
    slug,
    name: `Creator ${slug}`,
    city: "shanghai",
    shootingFocus: "portrait",
    discoveryContext: "",
    externalHandoffUrl: "",
    tagline: "",
    bio: "",
    publishedAt: "2026-04-19T00:00:00.000Z",
    updatedAt: "2026-04-19T00:00:00.000Z",
    ...overrides,
  };
}

let workSeq = 0;

export function fakeWork(
  overrides: Partial<CommunityWorkRecord> & { id?: string } = {},
): CommunityWorkRecord {
  const id = overrides.id ?? `work-${++workSeq}`;
  return {
    id,
    ownerProfileId: "photographer:owner",
    ownerRole: "photographer",
    ownerSlug: "owner",
    ownerName: "Owner",
    status: "published",
    title: `Work ${id}`,
    category: "portrait",
    description: "",
    detailNote: "",
    coverAsset: "",
    publishedAt: "2026-04-19T00:00:00.000Z",
    updatedAt: "2026-04-19T00:00:00.000Z",
    ...overrides,
  };
}
