import { performance } from "node:perf_hooks";

import type {
  AuthenticatedSessionContext,
  SessionContext,
} from "@/features/auth/types";
import type { CommunityRepositoryBundle } from "@/features/community/types";
import { AppError } from "@/features/observability/errors";
import { getObservability } from "@/features/observability/init";
import type { Logger } from "@/features/observability/logger";
import type { MetricsRegistry } from "@/features/observability/metrics";

/**
 * Phase 2 — Threaded Messaging V1 (FR-002 / FR-003 / FR-004 + I-2 / I-3 / I-5).
 *
 * Context handed to messaging server-action callbacks. The session
 * is guaranteed to be `authenticated` (runMessagingAction throws
 * `unauthenticated` for guests before invoking fn).
 */
export type MessagingActionContext = {
  session: AuthenticatedSessionContext;
  bundle: CommunityRepositoryBundle;
  metrics: MetricsRegistry;
  logger: Logger;
};

export type RunMessagingActionOptions<T> = {
  actionName: string;
  fn: (ctx: MessagingActionContext) => Promise<T> | T;
  /** Test injection points; default to runtime defaults. */
  session?: SessionContext;
  bundle?: CommunityRepositoryBundle;
  metrics?: MetricsRegistry;
  logger?: Logger;
  /** Test helper field accepted via `...deps` spread; ignored. */
  capturedLogs?: unknown;
};

type WithTransaction = <U>(fn: () => Promise<U> | U) => Promise<U>;

function bundleWithTransaction(
  bundle: CommunityRepositoryBundle,
): WithTransaction {
  const candidate = (bundle as Partial<{ withTransaction: WithTransaction }>)
    .withTransaction;
  if (typeof candidate === "function") {
    return candidate.bind(bundle);
  }
  return async <U>(fn: () => Promise<U> | U) => fn();
}

async function loadDefaultSession(): Promise<SessionContext> {
  const { getSessionContext } = await import("@/features/auth/session");
  return getSessionContext();
}

async function loadDefaultBundle(): Promise<CommunityRepositoryBundle> {
  const { getDefaultCommunityRepositoryBundle } = await import(
    "@/features/community/runtime"
  );
  return getDefaultCommunityRepositoryBundle();
}

/**
 * Phase 2 — Threaded Messaging V1 (NFR-002 / NFR-003 / NFR-004).
 *
 * Messaging server-action helper. Gates on authenticated session
 * (guest → `unauthenticated` AppError), wraps `fn` inside a single
 * sqlite transaction (in-memory bundle falls back to direct
 * invocation), and emits an `messaging.action.completed` /
 * `messaging.action.failed` structured log. NEVER puts message body
 * or recipient email into log context (NFR-002 / I-5).
 */
export async function runMessagingAction<T>(
  opts: RunMessagingActionOptions<T>,
): Promise<T> {
  const session = opts.session ?? (await loadDefaultSession());
  if (session.status !== "authenticated") {
    throw new AppError({
      code: "unauthenticated",
      message: "Login required.",
      status: 401,
    });
  }

  const observability =
    opts.bundle || opts.metrics || opts.logger ? null : getObservability();
  const bundle = opts.bundle ?? (await loadDefaultBundle());
  const metrics =
    opts.metrics ?? observability?.metrics ?? getObservability().metrics;
  const logger = opts.logger ?? observability?.logger ?? getObservability().logger;

  const ctx: MessagingActionContext = {
    session,
    bundle,
    metrics,
    logger,
  };

  const tx = bundleWithTransaction(bundle);
  const startedAt = performance.now();

  try {
    const result = await tx<T>(() => Promise.resolve(opts.fn(ctx)));
    logger.info("messaging.action.completed", {
      module: "messaging",
      actionName: opts.actionName,
      durationMs: Math.round(performance.now() - startedAt),
    });
    return result;
  } catch (error) {
    logger.warn("messaging.action.failed", {
      module: "messaging",
      actionName: opts.actionName,
      error,
    });
    throw error;
  }
}
