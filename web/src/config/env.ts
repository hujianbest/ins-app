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
