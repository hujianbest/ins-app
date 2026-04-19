// @vitest-environment node
import { describe, expect, it } from "vitest";

import {
  readAdminAccountsConfig,
  readBackupConfig,
  readObservabilityConfig,
  readRecommendationsConfig,
} from "./env";

describe("env / readObservabilityConfig", () => {
  it("returns defaults when no env vars are set", () => {
    const result = readObservabilityConfig({});
    expect(result.config).toEqual({
      logLevel: "info",
      metricsEnabled: false,
      metricsToken: undefined,
      slowQueryMs: 100,
      errorReporterProvider: "noop",
      sentryDsn: undefined,
    });
    expect(result.warnings).toEqual([]);
  });

  it("accepts valid log level overrides", () => {
    const result = readObservabilityConfig({ OBSERVABILITY_LOG_LEVEL: "warn" });
    expect(result.config.logLevel).toBe("warn");
    expect(result.warnings).toEqual([]);
  });

  it("falls back log level when invalid + warns", () => {
    const result = readObservabilityConfig({
      OBSERVABILITY_LOG_LEVEL: "invalid",
    });
    expect(result.config.logLevel).toBe("info");
    expect(result.warnings.some((w) => w.slug === "log-level-invalid")).toBe(true);
  });

  it("throws when METRICS_ENABLED=true but token missing (only hard stop)", () => {
    expect(() =>
      readObservabilityConfig({ OBSERVABILITY_METRICS_ENABLED: "true" }),
    ).toThrow(/OBSERVABILITY_METRICS_TOKEN/);
  });

  it("captures token when METRICS_ENABLED=true and token set", () => {
    const result = readObservabilityConfig({
      OBSERVABILITY_METRICS_ENABLED: "true",
      OBSERVABILITY_METRICS_TOKEN: "abc",
    });
    expect(result.config.metricsEnabled).toBe(true);
    expect(result.config.metricsToken).toBe("abc");
  });

  it("falls back slow query threshold for invalid values", () => {
    for (const bad of ["0", "-50", "abc", "1.5"]) {
      const result = readObservabilityConfig({
        OBSERVABILITY_SLOW_QUERY_MS: bad,
      });
      expect(result.config.slowQueryMs).toBe(100);
      expect(result.warnings.some((w) => w.slug === "slow-query-ms-invalid")).toBe(
        true,
      );
    }
  });

  it("forwards reporter provider + sentry dsn raw", () => {
    const result = readObservabilityConfig({
      ERROR_REPORTER_PROVIDER: "sentry",
      SENTRY_DSN: "https://example/1",
    });
    expect(result.config.errorReporterProvider).toBe("sentry");
    expect(result.config.sentryDsn).toBe("https://example/1");
  });
});

describe("env / readBackupConfig", () => {
  it("returns undefined dir when not set", () => {
    expect(readBackupConfig({})).toEqual({ backupDir: undefined });
  });

  it("forwards backup dir as-is, does not create it", () => {
    expect(readBackupConfig({ SQLITE_BACKUP_DIR: "/tmp/some-path-xyz" })).toEqual({
      backupDir: "/tmp/some-path-xyz",
    });
  });
});

describe("env / readAdminAccountsConfig (Ops Back Office V1)", () => {
  it("returns an empty set when env unset", () => {
    const result = readAdminAccountsConfig({});
    expect(Array.from(result.config.emails)).toEqual([]);
    expect(result.warnings).toEqual([]);
  });

  it("returns an empty set when env is whitespace-only", () => {
    const result = readAdminAccountsConfig({ ADMIN_ACCOUNT_EMAILS: "   " });
    expect(Array.from(result.config.emails)).toEqual([]);
    expect(result.warnings).toEqual([]);
  });

  it("parses CSV with trim + lower + dedup", () => {
    const result = readAdminAccountsConfig({
      ADMIN_ACCOUNT_EMAILS: "Alice@Example.com, bob@example.com,   alice@EXAMPLE.com  ",
    });
    expect(Array.from(result.config.emails).sort()).toEqual([
      "alice@example.com",
      "bob@example.com",
    ]);
    expect(result.warnings).toEqual([]);
  });

  it("drops invalid pieces and emits warning", () => {
    const result = readAdminAccountsConfig({
      ADMIN_ACCOUNT_EMAILS: "carol@example.com,not-an-email,@bad,d@example.com,a@",
    });
    expect(Array.from(result.config.emails).sort()).toEqual([
      "carol@example.com",
      "d@example.com",
    ]);
    expect(
      result.warnings.filter(
        (w) => w.slug === "admin-account-email-invalid",
      ).length,
    ).toBe(3);
  });
});

describe("env / readRecommendationsConfig (Discovery Intelligence V1)", () => {
  it("defaults to relatedEnabled=true with no warnings when env unset", () => {
    const result = readRecommendationsConfig({});
    expect(result.config).toEqual({ relatedEnabled: true });
    expect(result.warnings).toEqual([]);
  });

  it("respects explicit false", () => {
    const result = readRecommendationsConfig({
      RECOMMENDATIONS_RELATED_ENABLED: "false",
    });
    expect(result.config.relatedEnabled).toBe(false);
  });

  it("falls back to true on invalid value with warning", () => {
    const result = readRecommendationsConfig({
      RECOMMENDATIONS_RELATED_ENABLED: "maybe",
    });
    expect(result.config.relatedEnabled).toBe(true);
    expect(
      result.warnings.some(
        (w) => w.slug === "recommendations-related-enabled-invalid",
      ),
    ).toBe(true);
  });
});
