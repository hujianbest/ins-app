import { randomBytes, scryptSync, timingSafeEqual, createHmac } from "node:crypto";
import { existsSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { DatabaseSync } from "node:sqlite";

import { getAppConfig, getStorageConfig } from "@/config/env";

import type { AuthRole, SessionAccountId } from "./types";

type OpenAuthDatabaseOptions = {
  databasePath?: string;
};

type StoredAccountRow = {
  id: SessionAccountId;
  email: string;
  password_hash: string;
  primary_role: AuthRole;
  created_at: string;
};

export type AuthAccount = {
  id: SessionAccountId;
  email: string;
  primaryRole: AuthRole;
  createdAt: string;
};

export type AuthSession = {
  token: string;
  accountId: SessionAccountId;
  primaryRole: AuthRole;
  /**
   * Phase 2 — Ops Back Office V1 (ADR-4): lowercase account email,
   * mirrored from `auth_accounts.email` so callers can derive admin
   * status without an additional sqlite query.
   */
  email: string;
  expiresAt: string;
};

function ensureParentDirectory(databasePath: string) {
  if (databasePath === ":memory:") {
    return;
  }

  mkdirSync(dirname(databasePath), { recursive: true });
}

function openAuthDatabase(
  options: OpenAuthDatabaseOptions = {},
) {
  const databasePath =
    options.databasePath ?? getStorageConfig().sqliteDatabasePath;

  ensureParentDirectory(databasePath);

  const database = new DatabaseSync(databasePath, {
    timeout: 1000,
  });

  database.exec(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS auth_accounts (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      primary_role TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS auth_sessions (
      id TEXT PRIMARY KEY,
      account_id TEXT NOT NULL,
      token_hash TEXT NOT NULL UNIQUE,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY(account_id) REFERENCES auth_accounts(id) ON DELETE CASCADE
    );
  `);

  return {
    database,
    databasePath,
    close() {
      database.close();
    },
  };
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function validateEmail(email: string) {
  if (!email.includes("@") || email.startsWith("@") || email.endsWith("@")) {
    throw new Error("invalid_email");
  }
}

function validatePassword(password: string) {
  if (password.length < 8) {
    throw new Error("weak_password");
  }
}

function buildAccountId(role: AuthRole): SessionAccountId {
  return `account:${randomBytes(8).toString("hex")}:${role}`;
}

function mapAccountRow(row: StoredAccountRow): AuthAccount {
  return {
    id: row.id,
    email: row.email,
    primaryRole: row.primary_role,
    createdAt: row.created_at,
  };
}

function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = scryptSync(password, salt, 64).toString("hex");

  return `${salt}:${derivedKey}`;
}

function verifyPassword(password: string, passwordHash: string) {
  const [salt, expectedHash] = passwordHash.split(":");

  if (!salt || !expectedHash) {
    return false;
  }

  const derivedKey = scryptSync(password, salt, 64);
  const expectedBuffer = Buffer.from(expectedHash, "hex");

  return (
    expectedBuffer.length === derivedKey.length &&
    timingSafeEqual(expectedBuffer, derivedKey)
  );
}

function hashSessionToken(token: string) {
  const secret = getAppConfig().sessionCookieSecret;

  return createHmac("sha256", secret).update(token).digest("hex");
}

export function registerAuthAccount(
  input: {
    email: string;
    password: string;
    primaryRole: AuthRole;
  },
  options: OpenAuthDatabaseOptions = {},
): AuthAccount {
  const databaseHandle = openAuthDatabase(options);

  try {
    const email = normalizeEmail(input.email);

    validateEmail(email);
    validatePassword(input.password);

    const existingAccount = databaseHandle.database
      .prepare(`SELECT * FROM auth_accounts WHERE email = ?`)
      .get(email) as StoredAccountRow | undefined;

    if (existingAccount) {
      throw new Error("duplicate_email");
    }

    const account: AuthAccount = {
      id: buildAccountId(input.primaryRole),
      email,
      primaryRole: input.primaryRole,
      createdAt: new Date().toISOString(),
    };

    databaseHandle.database
      .prepare(
        `
          INSERT INTO auth_accounts (
            id,
            email,
            password_hash,
            primary_role,
            created_at
          ) VALUES (?, ?, ?, ?, ?)
        `,
      )
      .run(
        account.id,
        account.email,
        hashPassword(input.password),
        account.primaryRole,
        account.createdAt,
      );

    return account;
  } finally {
    databaseHandle.close();
  }
}

export function authenticateAuthAccount(
  input: {
    email: string;
    password: string;
  },
  options: OpenAuthDatabaseOptions = {},
): AuthAccount | null {
  const databaseHandle = openAuthDatabase(options);

  try {
    const email = normalizeEmail(input.email);
    const row = databaseHandle.database
      .prepare(`SELECT * FROM auth_accounts WHERE email = ?`)
      .get(email) as StoredAccountRow | undefined;

    if (!row) {
      return null;
    }

    return verifyPassword(input.password, row.password_hash)
      ? mapAccountRow(row)
      : null;
  } finally {
    databaseHandle.close();
  }
}

export function createAuthSession(
  account: AuthAccount,
  options: OpenAuthDatabaseOptions = {},
): AuthSession {
  const databaseHandle = openAuthDatabase(options);

  try {
    const token = randomBytes(32).toString("hex");
    const createdAt = new Date();
    const expiresAt = new Date(createdAt.getTime() + 1000 * 60 * 60 * 24 * 30);

    databaseHandle.database
      .prepare(
        `
          INSERT INTO auth_sessions (
            id,
            account_id,
            token_hash,
            expires_at,
            created_at
          ) VALUES (?, ?, ?, ?, ?)
        `,
      )
      .run(
        randomBytes(12).toString("hex"),
        account.id,
        hashSessionToken(token),
        expiresAt.toISOString(),
        createdAt.toISOString(),
      );

    return {
      token,
      accountId: account.id,
      primaryRole: account.primaryRole,
      email: account.email,
      expiresAt: expiresAt.toISOString(),
    };
  } finally {
    databaseHandle.close();
  }
}

export function resolveAuthSession(
  token: string,
  options: OpenAuthDatabaseOptions = {},
): AuthSession | null {
  const databaseHandle = openAuthDatabase(options);

  try {
    const sessionRow = databaseHandle.database
      .prepare(
        `
          SELECT
            auth_sessions.account_id,
            auth_sessions.expires_at,
            auth_accounts.primary_role,
            auth_accounts.email
          FROM auth_sessions
          INNER JOIN auth_accounts
            ON auth_accounts.id = auth_sessions.account_id
          WHERE auth_sessions.token_hash = ?
        `,
      )
      .get(hashSessionToken(token)) as
      | {
          account_id: SessionAccountId;
          expires_at: string;
          primary_role: AuthRole;
          email: string;
        }
      | undefined;

    if (!sessionRow) {
      return null;
    }

    if (new Date(sessionRow.expires_at).getTime() <= Date.now()) {
      revokeAuthSession(token, options);
      return null;
    }

    return {
      token,
      accountId: sessionRow.account_id,
      primaryRole: sessionRow.primary_role,
      email: sessionRow.email,
      expiresAt: sessionRow.expires_at,
    };
  } finally {
    databaseHandle.close();
  }
}

export function revokeAuthSession(
  token: string,
  options: OpenAuthDatabaseOptions = {},
) {
  const databaseHandle = openAuthDatabase(options);

  try {
    databaseHandle.database
      .prepare(`DELETE FROM auth_sessions WHERE token_hash = ?`)
      .run(hashSessionToken(token));
  } finally {
    databaseHandle.close();
  }
}

export function hasAuthDatabase(databasePath?: string) {
  const targetPath = databasePath ?? getStorageConfig().sqliteDatabasePath;

  return targetPath === ":memory:" || existsSync(targetPath);
}
