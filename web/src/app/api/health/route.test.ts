import { afterEach, describe, expect, it } from "vitest";

import { GET } from "./route";

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
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

    const response = await GET();
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

    const response = await GET();
    const payload = await response.json();

    expect(response.status).toBe(503);
    expect(payload.ok).toBe(false);
    expect(payload.reason).toBe("healthcheck_disabled");
  });
});
