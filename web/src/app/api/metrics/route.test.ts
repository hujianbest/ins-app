// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  installFreshMetricsRegistry,
  installInMemoryLogger,
  resetObservabilityForTesting,
} from "@/features/observability/init";
import { recordBusinessAction } from "@/features/observability/metrics";

import { GET } from "./route";

const originalEnv = { ...process.env };

beforeEach(() => {
  installInMemoryLogger({ level: "debug" });
  installFreshMetricsRegistry();
});

afterEach(() => {
  process.env = { ...originalEnv };
  resetObservabilityForTesting();
});

function setEnv(overrides: Record<string, string | undefined>) {
  process.env = {
    ...originalEnv,
    NODE_ENV: "test",
    APP_BASE_URL: "http://localhost:3000",
    SESSION_COOKIE_SECRET: "test-secret",
    SQLITE_DATABASE_PATH: ":memory:",
    HEALTHCHECK_ENABLED: "true",
    ...overrides,
  };
  for (const [k, v] of Object.entries(overrides)) {
    if (v === undefined) {
      delete process.env[k];
    }
  }
}

describe("GET /api/metrics", () => {
  it("returns 404 when OBSERVABILITY_METRICS_ENABLED is not true", async () => {
    setEnv({
      OBSERVABILITY_METRICS_ENABLED: "false",
      OBSERVABILITY_METRICS_TOKEN: "ignored",
    });
    const res = await GET(new Request("http://localhost/api/metrics"));
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body).toEqual({ error: "not_found" });
  });

  it("returns 404 when both env vars are missing", async () => {
    setEnv({
      OBSERVABILITY_METRICS_ENABLED: undefined,
      OBSERVABILITY_METRICS_TOKEN: undefined,
    });
    const res = await GET(new Request("http://localhost/api/metrics"));
    expect(res.status).toBe(404);
  });

  it("returns 401 when enabled but Authorization header missing", async () => {
    setEnv({
      OBSERVABILITY_METRICS_ENABLED: "true",
      OBSERVABILITY_METRICS_TOKEN: "secret-token",
    });
    const res = await GET(new Request("http://localhost/api/metrics"));
    expect(res.status).toBe(401);
  });

  it("returns 401 when Authorization header has wrong token", async () => {
    setEnv({
      OBSERVABILITY_METRICS_ENABLED: "true",
      OBSERVABILITY_METRICS_TOKEN: "secret-token",
    });
    const res = await GET(
      new Request("http://localhost/api/metrics", {
        headers: { Authorization: "Bearer wrong-token" },
      }),
    );
    expect(res.status).toBe(401);
  });

  it("returns 200 + JSON snapshot with full schema when enabled + correct token", async () => {
    setEnv({
      OBSERVABILITY_METRICS_ENABLED: "true",
      OBSERVABILITY_METRICS_TOKEN: "secret-token",
    });
    const res = await GET(
      new Request("http://localhost/api/metrics", {
        headers: { Authorization: "Bearer secret-token" },
      }),
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.http.requests_total).toBe(0);
    expect(body.sqlite.queries_total).toBe(0);
    expect(body.business).toEqual({});
    expect(body.http.request_duration_ms).toEqual(
      expect.objectContaining({ count: 0 }),
    );
  });

  it("reflects business action accumulation in snapshot", async () => {
    setEnv({
      OBSERVABILITY_METRICS_ENABLED: "true",
      OBSERVABILITY_METRICS_TOKEN: "secret-token",
    });

    const registry = installFreshMetricsRegistry();
    recordBusinessAction(registry, "work_publish", "success");
    recordBusinessAction(registry, "work_publish", "success");
    recordBusinessAction(registry, "work_publish", "failure");

    const res = await GET(
      new Request("http://localhost/api/metrics", {
        headers: { Authorization: "Bearer secret-token" },
      }),
    );
    const body = await res.json();
    expect(body.business.work_publish).toEqual({ success: 2, failure: 1 });
  });

  it("never echoes Authorization or token in response body", async () => {
    setEnv({
      OBSERVABILITY_METRICS_ENABLED: "true",
      OBSERVABILITY_METRICS_TOKEN: "secret-token-xyz",
    });
    const res = await GET(
      new Request("http://localhost/api/metrics", {
        headers: { Authorization: "Bearer secret-token-xyz" },
      }),
    );
    const text = await res.text();
    expect(text).not.toContain("secret-token-xyz");
    expect(text).not.toContain("Authorization");
    expect(text).not.toContain("Bearer ");
  });
});
