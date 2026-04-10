import { describe, expect, it } from "vitest";

import { readAppConfig } from "./env";

describe("readAppConfig", () => {
  it("uses safe development defaults", () => {
    const config = readAppConfig({
      NODE_ENV: "development",
    });

    expect(config.appBaseUrl).toBe("http://localhost:3000");
    expect(config.databaseProvider).toBe("sqlite");
    expect(config.sessionCookieSecret).toBe("lens-archive-dev-secret");
    expect(config.sessionCookieSecure).toBe(false);
    expect(config.healthcheckEnabled).toBe(true);
  });

  it("requires APP_BASE_URL in production", () => {
    expect(() =>
      readAppConfig({
        NODE_ENV: "production",
        SESSION_COOKIE_SECRET: "production-secret",
      }),
    ).toThrow("Missing required environment variable: APP_BASE_URL");
  });

  it("requires SESSION_COOKIE_SECRET in production", () => {
    expect(() =>
      readAppConfig({
        NODE_ENV: "production",
        APP_BASE_URL: "https://lens.example.com",
      }),
    ).toThrow("Missing required environment variable: SESSION_COOKIE_SECRET");
  });

  it("reads explicit runtime settings", () => {
    const config = readAppConfig({
      NODE_ENV: "production",
      APP_BASE_URL: "https://lens.example.com",
      ASSET_BASE_URL: "https://cdn.example.com",
      SESSION_COOKIE_SECRET: "production-secret",
      SESSION_COOKIE_SECURE: "true",
      HEALTHCHECK_ENABLED: "false",
      SQLITE_DATABASE_PATH: "/srv/lens/community.sqlite",
    });

    expect(config.appBaseUrl).toBe("https://lens.example.com");
    expect(config.assetBaseUrl).toBe("https://cdn.example.com");
    expect(config.sqliteDatabasePath).toBe("/srv/lens/community.sqlite");
    expect(config.sessionCookieSecure).toBe(true);
    expect(config.healthcheckEnabled).toBe(false);
  });

  it("rejects unsupported database providers", () => {
    expect(() =>
      readAppConfig({
        NODE_ENV: "production",
        APP_BASE_URL: "https://lens.example.com",
        SESSION_COOKIE_SECRET: "production-secret",
        DATABASE_PROVIDER: "postgres",
      }),
    ).toThrow("Unsupported DATABASE_PROVIDER");
  });
});
