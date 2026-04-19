import { performance } from "node:perf_hooks";

import { getAdminAccountEmails } from "@/config/env";
import { getSessionContext } from "@/features/auth/session";

import { createAdminCapabilityPolicy } from "./admin-policy";
import type {
  SessionContext,
} from "@/features/auth/types";

import type { AdminCapabilityPolicy } from "./admin-policy";
import { AppError } from "@/features/observability/errors";
import { getObservability } from "@/features/observability/init";
import type { Logger } from "@/features/observability/logger";
import type { MetricsRegistry } from "@/features/observability/metrics";
import type { CommunityRepositoryBundle } from "@/features/community/types";
import { getDefaultCommunityRepositoryBundle } from "@/features/community/runtime";

/**
 * Phase 2 — Ops Back Office V1 (FR-001 / I-3 / I-4).
 *
 * Context handed to admin server-action callbacks. Carries the
 * already-validated capability so callbacks never need to re-derive
 * "is admin" or pull email from somewhere else.
 */
export type AdminActionContext = {
  session: SessionContext;
  capability: AdminCapabilityPolicy & { isAdmin: true; email: string };
  bundle: CommunityRepositoryBundle;
  metrics: MetricsRegistry;
  logger: Logger;
};

export type RunAdminActionOptions<T> = {
  actionName: string;
  fn: (ctx: AdminActionContext) => Promise<T> | T;
  /**
   * Optional dep injections; production code lets these default to
   * the real implementations, tests inject in-memory equivalents.
   */
  session?: SessionContext;
  adminEmails?: ReadonlySet<string>;
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

/**
 * Phase 2 — Ops Back Office V1 (FR-001 / FR-005 / I-3 / I-4).
 *
 * Admin server-action helper. Gates on admin policy, runs `fn`
 * inside a single sqlite transaction (in-memory bundle falls back
 * to direct invocation), and emits an `admin.action.completed` /
 * `admin.action.failed` structured log. Counter increments are the
 * caller's responsibility (counter key ≠ actionName 1:1).
 *
 * NEVER includes `actorEmail` in log fields (NFR-002 / I-7);
 * `actorEmail` only ever lands in `audit_log.actor_email`.
 */
export async function runAdminAction<T>(
  opts: RunAdminActionOptions<T>,
): Promise<T> {
  const session = opts.session ?? (await getSessionContext());
  const adminEmails = opts.adminEmails ?? getAdminAccountEmails();
  const capability = createAdminCapabilityPolicy(session, adminEmails);

  if (!capability.isAdmin || !capability.email) {
    throw new AppError({
      code: "forbidden_admin_only",
      message: "Admin only.",
      status: 403,
    });
  }

  const observability = opts.bundle || opts.metrics || opts.logger
    ? null
    : getObservability();
  const bundle = opts.bundle ?? getDefaultCommunityRepositoryBundle();
  const metrics = opts.metrics ?? observability?.metrics ?? getObservability().metrics;
  const logger = opts.logger ?? observability?.logger ?? getObservability().logger;

  const ctx: AdminActionContext = {
    session,
    capability: { isAdmin: true, email: capability.email },
    bundle,
    metrics,
    logger,
  };

  const tx = bundleWithTransaction(bundle);
  const startedAt = performance.now();

  try {
    const result = await tx<T>(() => Promise.resolve(opts.fn(ctx)));
    logger.info("admin.action.completed", {
      module: "admin",
      actionName: opts.actionName,
      durationMs: Math.round(performance.now() - startedAt),
    });
    return result;
  } catch (error) {
    logger.warn("admin.action.failed", {
      module: "admin",
      actionName: opts.actionName,
      error,
    });
    throw error;
  }
}
