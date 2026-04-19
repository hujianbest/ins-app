import { join } from "node:path";

export type AppConfigEnv = Record<string, string | undefined>;

export type DatabaseProvider = "sqlite";

export type AppConfig = {
  nodeEnv: "development" | "production" | "test";
  isProduction: boolean;
  appBaseUrl: string;
  databaseProvider: DatabaseProvider;
  sqliteDatabasePath: string;
  assetBaseUrl: string;
  sessionCookieSecret: string;
  sessionCookieSecure: boolean;
  healthcheckEnabled: boolean;
};

export type StorageConfig = Pick<
  AppConfig,
  "databaseProvider" | "sqliteDatabasePath"
>;

const defaultSqliteDatabasePath = join(
  process.cwd(),
  ".data",
  "community.sqlite",
);

function normalizeNodeEnv(value: string | undefined): AppConfig["nodeEnv"] {
  if (value === "production" || value === "test") {
    return value;
  }

  return "development";
}

function readBoolean(
  value: string | undefined,
  fallback: boolean,
): boolean {
  if (value === undefined) {
    return fallback;
  }

  const normalized = value.trim().toLowerCase();

  if (normalized === "true") {
    return true;
  }

  if (normalized === "false") {
    return false;
  }

  throw new Error(`Expected boolean environment value, received: ${value}`);
}

function readUrl(
  env: AppConfigEnv,
  name: string,
  fallback: string | undefined,
): string {
  const value = env[name]?.trim() || fallback;

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  try {
    return new URL(value).toString().replace(/\/$/, "");
  } catch {
    throw new Error(`Environment variable ${name} must be a valid absolute URL.`);
  }
}

function readString(
  env: AppConfigEnv,
  name: string,
  fallback: string | undefined,
): string {
  const value = env[name]?.trim() || fallback;

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function readAppConfig(env: AppConfigEnv = process.env): AppConfig {
  const nodeEnv = normalizeNodeEnv(env.NODE_ENV);
  const isProduction = nodeEnv === "production";
  const storageConfig = readStorageConfig(env);
  const appBaseUrl = readUrl(
    env,
    "APP_BASE_URL",
    isProduction ? undefined : "http://localhost:3000",
  );
  const assetBaseUrl = readUrl(env, "ASSET_BASE_URL", appBaseUrl);
  const sessionCookieSecret = readString(
    env,
    "SESSION_COOKIE_SECRET",
    isProduction ? undefined : "lens-archive-dev-secret",
  );
  const sessionCookieSecure = readBoolean(
    env.SESSION_COOKIE_SECURE,
    isProduction,
  );
  const healthcheckEnabled = readBoolean(env.HEALTHCHECK_ENABLED, true);

  return {
    nodeEnv,
    isProduction,
    appBaseUrl,
    ...storageConfig,
    assetBaseUrl,
    sessionCookieSecret,
    sessionCookieSecure,
    healthcheckEnabled,
  };
}

export function getAppConfig(): AppConfig {
  return readAppConfig();
}

export function readStorageConfig(env: AppConfigEnv = process.env): StorageConfig {
  const databaseProvider = (env.DATABASE_PROVIDER?.trim() ||
    "sqlite") as DatabaseProvider;

  if (databaseProvider !== "sqlite") {
    throw new Error(
      `Unsupported DATABASE_PROVIDER: ${databaseProvider}.`,
    );
  }

  return {
    databaseProvider,
    sqliteDatabasePath:
      env.SQLITE_DATABASE_PATH?.trim() || defaultSqliteDatabasePath,
  };
}

export function getStorageConfig(): StorageConfig {
  return readStorageConfig();
}

// ---------------------------------------------------------------------------
// Phase 2 — Observability & Ops V1 env extensions (FR-006)
// Defaults and degradation rules per spec §6 FR-006 + design §11/§12.
// Failures are degradation-with-warning; the only hard-stop is
// OBSERVABILITY_METRICS_ENABLED=true without OBSERVABILITY_METRICS_TOKEN.
// ---------------------------------------------------------------------------

export type LogLevelLiteral = "debug" | "info" | "warn" | "error";

const VALID_LOG_LEVELS: ReadonlySet<string> = new Set([
  "debug",
  "info",
  "warn",
  "error",
]);

export type ObservabilityConfig = {
  logLevel: LogLevelLiteral;
  metricsEnabled: boolean;
  metricsToken: string | undefined;
  slowQueryMs: number;
  errorReporterProvider: string;
  sentryDsn: string | undefined;
};

export type BackupConfig = {
  backupDir: string | undefined;
};

export type ConfigWarning = {
  slug: string;
  message: string;
};

export type ObservabilityConfigResult = {
  config: ObservabilityConfig;
  warnings: ConfigWarning[];
};

export function readObservabilityConfig(
  env: AppConfigEnv = process.env,
): ObservabilityConfigResult {
  const warnings: ConfigWarning[] = [];

  const rawLevel = env.OBSERVABILITY_LOG_LEVEL?.trim().toLowerCase();
  let logLevel: LogLevelLiteral = "info";
  if (rawLevel) {
    if (VALID_LOG_LEVELS.has(rawLevel)) {
      logLevel = rawLevel as LogLevelLiteral;
    } else {
      warnings.push({
        slug: "log-level-invalid",
        message: `OBSERVABILITY_LOG_LEVEL="${rawLevel}" is not one of debug/info/warn/error; falling back to info.`,
      });
    }
  }

  const rawMetricsEnabled = env.OBSERVABILITY_METRICS_ENABLED?.trim().toLowerCase();
  const metricsEnabled = rawMetricsEnabled === "true";
  const metricsToken = env.OBSERVABILITY_METRICS_TOKEN?.trim();

  if (metricsEnabled && (!metricsToken || metricsToken.length === 0)) {
    throw new Error(
      "OBSERVABILITY_METRICS_ENABLED=true requires OBSERVABILITY_METRICS_TOKEN to be set; refusing to expose /api/metrics without auth.",
    );
  }

  const rawSlow = env.OBSERVABILITY_SLOW_QUERY_MS?.trim();
  let slowQueryMs = 100;
  if (rawSlow !== undefined && rawSlow !== "") {
    const parsed = Number(rawSlow);
    if (
      !Number.isFinite(parsed) ||
      !Number.isInteger(parsed) ||
      parsed <= 0
    ) {
      warnings.push({
        slug: "slow-query-ms-invalid",
        message: `OBSERVABILITY_SLOW_QUERY_MS="${rawSlow}" is not a positive integer; falling back to 100ms.`,
      });
    } else {
      slowQueryMs = parsed;
    }
  }

  const rawProvider = env.ERROR_REPORTER_PROVIDER?.trim().toLowerCase();
  const errorReporterProvider =
    rawProvider && rawProvider.length > 0 ? rawProvider : "noop";
  const sentryDsn = env.SENTRY_DSN?.trim() || undefined;

  return {
    config: {
      logLevel,
      metricsEnabled,
      metricsToken: metricsToken && metricsToken.length > 0 ? metricsToken : undefined,
      slowQueryMs,
      errorReporterProvider,
      sentryDsn,
    },
    warnings,
  };
}

export function readBackupConfig(env: AppConfigEnv = process.env): BackupConfig {
  const raw = env.SQLITE_BACKUP_DIR?.trim();
  return { backupDir: raw && raw.length > 0 ? raw : undefined };
}

export function getObservabilityConfig(): ObservabilityConfig {
  return readObservabilityConfig().config;
}

export function getBackupConfig(): BackupConfig {
  return readBackupConfig();
}

// ---------------------------------------------------------------------------
// Phase 2 — Discovery Intelligence V1 env extensions (FR-004 / FR-006)
// Defaults and degradation rules per spec FR-004 + design §9.9 / §11.
// Failures are degradation-with-warning; nothing is a hard-stop.
// ---------------------------------------------------------------------------

export type RecommendationsConfig = {
  relatedEnabled: boolean;
};

export type RecommendationsConfigResult = {
  config: RecommendationsConfig;
  warnings: ConfigWarning[];
};

export function readRecommendationsConfig(
  env: AppConfigEnv = process.env,
): RecommendationsConfigResult {
  const warnings: ConfigWarning[] = [];

  const raw = env.RECOMMENDATIONS_RELATED_ENABLED?.trim().toLowerCase();
  let relatedEnabled = true;
  if (raw !== undefined && raw !== "") {
    if (raw === "true") {
      relatedEnabled = true;
    } else if (raw === "false") {
      relatedEnabled = false;
    } else {
      warnings.push({
        slug: "recommendations-related-enabled-invalid",
        message: `RECOMMENDATIONS_RELATED_ENABLED="${env.RECOMMENDATIONS_RELATED_ENABLED}" is not "true"/"false"; falling back to true.`,
      });
    }
  }

  return { config: { relatedEnabled }, warnings };
}

export function getRecommendationsConfig(): RecommendationsConfig {
  return readRecommendationsConfig().config;
}
