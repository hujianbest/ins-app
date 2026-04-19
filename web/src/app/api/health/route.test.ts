// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  installInMemoryLogger,
  resetObservabilityForTesting,
} from "@/features/observability/init";
import { TRACE_HEADER } from "@/features/observability/server-boundary";
import { isValidTraceId } from "@/features/observability/trace";

import { GET } from "./route";

const originalEnv = { ...process.env };

beforeEach(() => {
  installInMemoryLogger({ level: "debug" });
});

afterEach(() => {
  process.env = { ...originalEnv };
  resetObservabilityForTesting();
});

describe("GET /api/health", () => {
  it("returns runtime status when enabled", async () => {
    process.env = {
      ...originalEnv,
      NODE_ENV: "test",
      APP_BASE_URL: "http://localhost:3000",
      SESSION_COOKIE_SECRET: "test-secret",
      SQLITE_DATABASE_PATH: ":memory:",
      HEALTHCHECK_ENABLED: "true",
    };

    const response = await GET(new Request("http://localhost/api/health"));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.ok).toBe(true);
    expect(payload.runtime.databaseProvider).toBe("sqlite");
    expect(payload.runtime.databasePath).toBe(":memory:");
  });

  it("returns 503 when disabled", async () => {
    process.env = {
      ...originalEnv,
      NODE_ENV: "test",
      APP_BASE_URL: "http://localhost:3000",
      SESSION_COOKIE_SECRET: "test-secret",
      SQLITE_DATABASE_PATH: ":memory:",
      HEALTHCHECK_ENABLED: "false",
    };

    const response = await GET(new Request("http://localhost/api/health"));
    const payload = await response.json();

    expect(response.status).toBe(503);
    expect(payload.ok).toBe(false);
    expect(payload.reason).toBe("healthcheck_disabled");
  });

  it("attaches an x-trace-id response header that inherits a valid inbound header", async () => {
    process.env = {
      ...originalEnv,
      NODE_ENV: "test",
      APP_BASE_URL: "http://localhost:3000",
      SESSION_COOKIE_SECRET: "test-secret",
      SQLITE_DATABASE_PATH: ":memory:",
      HEALTHCHECK_ENABLED: "true",
    };

    const inbound = "health-walking-skeleton";
    const response = await GET(
      new Request("http://localhost/api/health", {
        headers: { [TRACE_HEADER]: inbound },
      }),
    );

    expect(response.headers.get(TRACE_HEADER)).toBe(inbound);
  });

  it("generates a valid x-trace-id when no inbound header is present", async () => {
    process.env = {
      ...originalEnv,
      NODE_ENV: "test",
      APP_BASE_URL: "http://localhost:3000",
      SESSION_COOKIE_SECRET: "test-secret",
      SQLITE_DATABASE_PATH: ":memory:",
      HEALTHCHECK_ENABLED: "true",
    };

    const response = await GET(new Request("http://localhost/api/health"));
    const traceId = response.headers.get(TRACE_HEADER);
    expect(traceId).toBeTruthy();
    expect(isValidTraceId(traceId as string)).toBe(true);
  });

  it("includes observability + backup namespaces with safe defaults when nothing configured", async () => {
    process.env = {
      ...originalEnv,
      NODE_ENV: "test",
      APP_BASE_URL: "http://localhost:3000",
      SESSION_COOKIE_SECRET: "test-secret",
      SQLITE_DATABASE_PATH: ":memory:",
      HEALTHCHECK_ENABLED: "true",
    };

    const response = await GET(new Request("http://localhost/api/health"));
    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.observability).toEqual({
      loggerEnabled: true,
      metricsEnabled: false,
      errorReporter: "noop",
    });
    expect(payload.backup).toEqual({ ready: false, lastBackupAt: null });
  });

  it("flips metricsEnabled when env says so but never echoes the token", async () => {
    process.env = {
      ...originalEnv,
      NODE_ENV: "test",
      APP_BASE_URL: "http://localhost:3000",
      SESSION_COOKIE_SECRET: "test-secret",
      SQLITE_DATABASE_PATH: ":memory:",
      HEALTHCHECK_ENABLED: "true",
      OBSERVABILITY_METRICS_ENABLED: "true",
      OBSERVABILITY_METRICS_TOKEN: "ultra-secret-zzz",
    };

    const response = await GET(new Request("http://localhost/api/health"));
    const text = await response.text();
    const payload = JSON.parse(text);
    expect(payload.observability.metricsEnabled).toBe(true);
    expect(text).not.toContain("ultra-secret-zzz");
  });

  it("backup.ready is true when SQLITE_BACKUP_DIR exists", async () => {
    const { mkdtempSync, rmSync } = await import("node:fs");
    const { tmpdir } = await import("node:os");
    const { join } = await import("node:path");
    const dir = mkdtempSync(join(tmpdir(), "t50-health-backup-"));
    try {
      process.env = {
        ...originalEnv,
        NODE_ENV: "test",
        APP_BASE_URL: "http://localhost:3000",
        SESSION_COOKIE_SECRET: "test-secret",
        SQLITE_DATABASE_PATH: ":memory:",
        HEALTHCHECK_ENABLED: "true",
        SQLITE_BACKUP_DIR: dir,
      };

      const response = await GET(new Request("http://localhost/api/health"));
      const payload = await response.json();
      expect(payload.backup.ready).toBe(true);
      expect(payload.backup.lastBackupAt).toBeNull();
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("backup.lastBackupAt reflects the newest community-*.sqlite mtime", async () => {
    const { mkdtempSync, writeFileSync, rmSync, utimesSync, statSync } =
      await import("node:fs");
    const { tmpdir } = await import("node:os");
    const { join } = await import("node:path");
    const dir = mkdtempSync(join(tmpdir(), "t50-health-backup-mtime-"));
    try {
      const older = join(dir, "community-20260101000000.sqlite");
      const newer = join(dir, "community-20260102000000.sqlite");
      writeFileSync(older, "old");
      writeFileSync(newer, "new");
      const olderTime = new Date("2026-01-01T00:00:00Z");
      const newerTime = new Date("2026-01-02T00:00:00Z");
      utimesSync(older, olderTime, olderTime);
      utimesSync(newer, newerTime, newerTime);

      process.env = {
        ...originalEnv,
        NODE_ENV: "test",
        APP_BASE_URL: "http://localhost:3000",
        SESSION_COOKIE_SECRET: "test-secret",
        SQLITE_DATABASE_PATH: ":memory:",
        HEALTHCHECK_ENABLED: "true",
        SQLITE_BACKUP_DIR: dir,
      };

      const response = await GET(new Request("http://localhost/api/health"));
      const payload = await response.json();
      expect(payload.backup.ready).toBe(true);
      expect(payload.backup.lastBackupAt).toBe(
        new Date(statSync(newer).mtime).toISOString(),
      );
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
