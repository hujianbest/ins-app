// @vitest-environment node
import { existsSync, mkdirSync, mkdtempSync, readdirSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  installInMemoryLogger,
  resetObservabilityForTesting,
} from "@/features/observability/init";

import { runBackup, runRestore } from "./sqlite-backup";

let workdir: string;
let logger: ReturnType<typeof installInMemoryLogger>;

beforeEach(() => {
  workdir = mkdtempSync(join(tmpdir(), "t51-sqlite-"));
  logger = installInMemoryLogger({ level: "debug" });
});

afterEach(() => {
  rmSync(workdir, { recursive: true, force: true });
  resetObservabilityForTesting();
});

function seedSourceDb(): string {
  const srcPath = join(workdir, "community.sqlite");
  const db = new DatabaseSync(srcPath);
  try {
    db.exec(
      "CREATE TABLE creator_profiles (id TEXT PRIMARY KEY, name TEXT NOT NULL)",
    );
    const insert = db.prepare("INSERT INTO creator_profiles VALUES (?, ?)");
    insert.run("p1", "Alice");
    insert.run("p2", "Bob");
  } finally {
    db.close();
  }
  return srcPath;
}

function readNames(path: string): string[] {
  const db = new DatabaseSync(path, { readOnly: true });
  try {
    const rows = db
      .prepare("SELECT name FROM creator_profiles ORDER BY id")
      .all() as Array<{ name: string }>;
    return rows.map((r) => r.name);
  } finally {
    db.close();
  }
}

describe("scripts/sqlite-backup runBackup", () => {
  it("produces a community-YYYYMMDDHHmmss.sqlite copy that is readable", async () => {
    const srcPath = seedSourceDb();
    const backupDir = join(workdir, "backups");
    mkdirSync(backupDir);

    const result = await runBackup({ srcPath, backupDir });

    expect(result.destPath).toMatch(/community-\d{14}\.sqlite$/);
    expect(existsSync(result.destPath)).toBe(true);
    const stat = statSync(result.destPath);
    expect(stat.size).toBeGreaterThan(0);

    expect(readNames(result.destPath)).toEqual(["Alice", "Bob"]);

    const completed = logger.records.find(
      (r) => r.event === "sqlite.backup.completed",
    );
    expect(completed).toBeDefined();
    expect(completed?.module).toBe("scripts");
  });

  it("throws when backupDir is missing", async () => {
    const srcPath = seedSourceDb();
    await expect(
      runBackup({ srcPath, backupDir: undefined as unknown as string }),
    ).rejects.toThrow(/SQLITE_BACKUP_DIR/);
  });

  it("throws when backupDir does not exist", async () => {
    const srcPath = seedSourceDb();
    await expect(
      runBackup({ srcPath, backupDir: join(workdir, "missing-xyz") }),
    ).rejects.toThrow(/does not exist/);
  });

  it("falls back to wal-checkpoint+copy when module-level backup is missing", async () => {
    const srcPath = seedSourceDb();
    const backupDir = join(workdir, "backups");
    mkdirSync(backupDir);

    const result = await runBackup({
      srcPath,
      backupDir,
      sqliteBackupOverride: undefined,
    });

    expect(existsSync(result.destPath)).toBe(true);
    expect(readNames(result.destPath)).toEqual(["Alice", "Bob"]);

    const fallback = logger.records.find(
      (r) => r.event === "sqlite.backup.fallback",
    );
    expect(fallback).toBeDefined();
    expect(fallback?.code).toBe("module-backup-unavailable");
  });
});

describe("scripts/sqlite-backup runRestore", () => {
  it("atomically replaces the source db with the backup contents", async () => {
    const srcPath = seedSourceDb();
    const backupDir = join(workdir, "backups");
    mkdirSync(backupDir);

    const { destPath } = await runBackup({ srcPath, backupDir });

    // Mutate source after backup so we can verify restore overwrites
    const live = new DatabaseSync(srcPath);
    try {
      live.exec("DELETE FROM creator_profiles");
    } finally {
      live.close();
    }
    expect(readNames(srcPath)).toEqual([]);

    await runRestore({ srcPath, backupFile: destPath });

    expect(readNames(srcPath)).toEqual(["Alice", "Bob"]);

    const completed = logger.records.find(
      (r) => r.event === "sqlite.restore.completed",
    );
    expect(completed).toBeDefined();
  });

  it("throws when backupFile does not exist", async () => {
    const srcPath = seedSourceDb();
    await expect(
      runRestore({ srcPath, backupFile: join(workdir, "no-such.sqlite") }),
    ).rejects.toThrow(/backup file/);
  });
});

describe("scripts/sqlite-backup integration with /api/health backup field", () => {
  it("after backup the directory contains a community-*.sqlite file readable by the health route logic", async () => {
    const srcPath = seedSourceDb();
    const backupDir = join(workdir, "backups");
    mkdirSync(backupDir);
    await runBackup({ srcPath, backupDir });

    const entries = readdirSync(backupDir).filter((n) =>
      /^community-.*\.sqlite$/.test(n),
    );
    expect(entries).toHaveLength(1);
  });
});
