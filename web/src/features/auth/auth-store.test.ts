import { mkdtempSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

import { afterEach, describe, expect, it } from "vitest";

import {
  authenticateAuthAccount,
  createAuthSession,
  registerAuthAccount,
  resolveAuthSession,
  revokeAuthSession,
} from "./auth-store";

const originalEnv = { ...process.env };

function createDatabasePath() {
  const directory = mkdtempSync(join(tmpdir(), "lens-auth-"));

  return join(directory, "community.sqlite");
}

afterEach(() => {
  process.env = { ...originalEnv };
});

describe("auth-store", () => {
  it("registers and authenticates an account", () => {
    const databasePath = createDatabasePath();

    const account = registerAuthAccount(
      {
        email: "Creator@example.com",
        password: "strong-pass-123",
        primaryRole: "photographer",
      },
      { databasePath },
    );

    const authenticated = authenticateAuthAccount(
      {
        email: "creator@example.com",
        password: "strong-pass-123",
      },
      { databasePath },
    );

    expect(account.email).toBe("creator@example.com");
    expect(account.primaryRole).toBe("photographer");
    expect(authenticated?.id).toBe(account.id);
  });

  it("rejects duplicate emails", () => {
    const databasePath = createDatabasePath();

    registerAuthAccount(
      {
        email: "creator@example.com",
        password: "strong-pass-123",
        primaryRole: "model",
      },
      { databasePath },
    );

    expect(() =>
      registerAuthAccount(
        {
          email: "creator@example.com",
          password: "strong-pass-456",
          primaryRole: "photographer",
        },
        { databasePath },
      ),
    ).toThrow("duplicate_email");
  });

  it("creates, resolves, and revokes sessions", () => {
    process.env = {
      ...originalEnv,
      NODE_ENV: "test",
      APP_BASE_URL: "http://localhost:3000",
      SESSION_COOKIE_SECRET: "test-secret",
      SQLITE_DATABASE_PATH: ":memory:",
    };

    const databasePath = createDatabasePath();
    const account = registerAuthAccount(
      {
        email: "creator@example.com",
        password: "strong-pass-123",
        primaryRole: "model",
      },
      { databasePath },
    );

    const session = createAuthSession(account, { databasePath });

    expect(resolveAuthSession(session.token, { databasePath })?.accountId).toBe(
      account.id,
    );

    revokeAuthSession(session.token, { databasePath });

    expect(resolveAuthSession(session.token, { databasePath })).toBeNull();
  });
});
