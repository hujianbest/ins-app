import { existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

import { getAppConfig, readBackupConfig, readObservabilityConfig } from "@/config/env";
import {
  createReadonlyCommunityRepositoryBundle,
  getCommunityRuntimeInfo,
} from "@/features/community/runtime";
import { wrapRouteHandler } from "@/features/observability/server-boundary";

export const dynamic = "force-dynamic";

type HealthBackupCacheEntry = { value: string | null; expires: number; signature: string };

const BACKUP_CACHE_TTL_MS = 5_000;
let backupLastAtCache: HealthBackupCacheEntry | undefined;

function readObservabilityHealthSummary() {
  const result = readObservabilityConfig();
  return {
    loggerEnabled: true,
    metricsEnabled: result.config.metricsEnabled,
    errorReporter: result.config.errorReporterProvider,
  };
}

function readBackupHealthSummary() {
  const { backupDir } = readBackupConfig();
  if (!backupDir) {
    return { ready: false, lastBackupAt: null };
  }

  let exists = false;
  try {
    exists = existsSync(backupDir);
  } catch {
    return { ready: false, lastBackupAt: null };
  }

  if (!exists) {
    return { ready: false, lastBackupAt: null };
  }

  const cacheKey = backupDir;
  if (
    backupLastAtCache &&
    backupLastAtCache.signature === cacheKey &&
    Date.now() < backupLastAtCache.expires
  ) {
    return { ready: true, lastBackupAt: backupLastAtCache.value };
  }

  let lastAtIso: string | null = null;
  try {
    const entries = readdirSync(backupDir);
    let latestMs = 0;
    for (const name of entries) {
      if (!/^community-.*\.sqlite$/.test(name)) continue;
      try {
        const stat = statSync(join(backupDir, name));
        if (stat.mtimeMs > latestMs) {
          latestMs = stat.mtimeMs;
          lastAtIso = new Date(stat.mtime).toISOString();
        }
      } catch {
        /* skip unreadable entry */
      }
    }
  } catch {
    /* ready stays true, lastBackupAt null */
  }

  backupLastAtCache = {
    value: lastAtIso,
    expires: Date.now() + BACKUP_CACHE_TTL_MS,
    signature: cacheKey,
  };

  return { ready: true, lastBackupAt: lastAtIso };
}

async function healthHandler(): Promise<Response> {
  const config = getAppConfig();

  const observability = readObservabilityHealthSummary();
  const backup = readBackupHealthSummary();

  if (!config.healthcheckEnabled) {
    return Response.json(
      {
        ok: false,
        reason: "healthcheck_disabled",
        observability,
        backup,
      },
      { status: 503 },
    );
  }

  const runtime = getCommunityRuntimeInfo();

  try {
    const bundle = createReadonlyCommunityRepositoryBundle();
    bundle.close();

    return Response.json({
      ok: true,
      service: "lens-archive",
      environment: config.nodeEnv,
      runtime,
      observability,
      backup,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown healthcheck failure";

    return Response.json(
      {
        ok: false,
        reason: "repository_unavailable",
        error: message,
        runtime,
        observability,
        backup,
      },
      { status: 503 },
    );
  }
}

export const GET = wrapRouteHandler("health", async (_request: Request) => {
  void _request;
  return healthHandler();
});
