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
});
