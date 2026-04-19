import {
  type CommunityRepositoryBundle,
  type AuditLogEntry,
  type CommunityWorkRecord,
  type CreatorProfileRecord,
  type CuratedSlotRecord,
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
  type AuthRole,
} from "@/features/auth/types";
import { createAuthenticatedSessionContext } from "@/features/auth/session";

export type RecordedLog = {
  level: LogLevel;
  event: string;
  ctx?: unknown;
};

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

export function fakeAdminSession(
  email = "admin@example.com",
  role: AuthRole = "photographer",
): SessionContext {
  return createAuthenticatedSessionContext(
    `account:admin:${role}`,
    role,
    email.toLowerCase(),
  );
}

export function fakeNonAdminSession(
  email = "creator@example.com",
  role: AuthRole = "photographer",
): SessionContext {
  return createAuthenticatedSessionContext(
    `account:creator:${role}`,
    role,
    email.toLowerCase(),
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

export type AdminTestDeps = {
  bundle: CommunityRepositoryBundle;
  metrics: MetricsRegistry;
  logger: Logger;
  capturedLogs: RecordedLog[];
};

export function createAdminTestDeps(
  fixtures: {
    profiles?: CreatorProfileRecord[];
    works?: CommunityWorkRecord[];
    curation?: CuratedSlotRecord[];
    audit?: AuditLogEntry[];
  } = {},
): AdminTestDeps {
  const bundle = createInMemoryCommunityRepositoryBundle({
    profiles: fixtures.profiles ?? [],
    works: fixtures.works ?? [],
    curation: fixtures.curation ?? [],
    audit: fixtures.audit ?? [],
  });
  const metrics = createMetricsRegistry();
  const { logger, records } = createCapturingLogger();
  return { bundle, metrics, logger, capturedLogs: records };
}
