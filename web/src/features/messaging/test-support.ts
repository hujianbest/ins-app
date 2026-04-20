import {
  type CommunityRepositoryBundle,
  type CommunityWorkRecord,
  type CreatorProfileRecord,
  type DiscoveryEventRecord,
  type WorkCommentRecord,
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
import {
  type SessionContext,
} from "@/features/auth/types";
import { createAuthenticatedSessionContext } from "@/features/auth/session";

import { resolveCallerProfileId } from "./identity";

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

export function fakePhotographerSession(slug = "sample-photographer"): SessionContext {
  return createAuthenticatedSessionContext(
    `account:test:photographer:${slug}`,
    "photographer",
    `${slug}@test.lens-archive.local`,
  );
}

export function fakeModelSession(slug = "sample-model"): SessionContext {
  return createAuthenticatedSessionContext(
    `account:test:model:${slug}`,
    "model",
    `${slug}@test.lens-archive.local`,
  );
}

export function fakeGuestSession(): SessionContext {
  return {
    status: "guest",
    isAuthenticated: false,
    accountId: null,
    primaryRole: null,
  };
}

export type MessagingTestDeps = {
  bundle: CommunityRepositoryBundle;
  metrics: MetricsRegistry;
  logger: Logger;
  capturedLogs: RecordedLog[];
};

export function createMessagingTestDeps(
  fixtures: {
    profiles?: CreatorProfileRecord[];
    works?: CommunityWorkRecord[];
    comments?: WorkCommentRecord[];
    discoveryEvents?: DiscoveryEventRecord[];
  } = {},
): MessagingTestDeps {
  const bundle = createInMemoryCommunityRepositoryBundle({
    profiles: fixtures.profiles ?? [],
    works: fixtures.works ?? [],
    comments: fixtures.comments ?? [],
  });
  // Pre-populate discovery events directly into the bundle's repository
  // by sequential record() calls so test-support's discovery
  // implementation stays in sync with system-notifications listing
  // semantics. (V1 in-memory bundle's discovery.record is currently
  // a stub returning a constructed record without persistence; tests
  // that need discovery events will use a richer fake.)
  void fixtures.discoveryEvents;
  const metrics = createMetricsRegistry();
  const { logger, records } = createCapturingLogger();
  return { bundle, metrics, logger, capturedLogs: records };
}

export { resolveCallerProfileId };
