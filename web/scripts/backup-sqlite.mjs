#!/usr/bin/env node
// Usage: node web/scripts/backup-sqlite.mjs
//
// Reads:
//   SQLITE_DATABASE_PATH (default: web/.data/community.sqlite relative to repo root)
//   SQLITE_BACKUP_DIR    (required; refuses to run otherwise)
//
// Produces:
//   <SQLITE_BACKUP_DIR>/community-YYYYMMDDHHmmss.sqlite
//
// Picks the module-level `sqlite.backup(srcDb, destPath, { rate })` Online
// Backup API when available; falls back to `PRAGMA wal_checkpoint(TRUNCATE)`
// + `fs.copyFile`. Exits non-zero with a JSON error line on failure.
//
// Per design ADR-2 / FR-007. Logging is structured JSON to stdout to match
// the application logger contract (event/module/scriptName/durationMs/code).

import { copyFileSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import * as nodeSqlite from "node:sqlite";

const here = dirname(fileURLToPath(import.meta.url));
const defaultSrcPath = resolve(here, "..", ".data", "community.sqlite");

function emit(level, event, ctx) {
  const record = {
    timestamp: new Date().toISOString(),
    level,
    traceId: "script",
    event,
    module: "scripts",
    scriptName: "backup-sqlite",
    ...ctx,
  };
  process.stdout.write(`${JSON.stringify(record)}\n`);
}

function timestampSuffix() {
  const now = new Date();
  const yyyy = String(now.getUTCFullYear()).padStart(4, "0");
  const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(now.getUTCDate()).padStart(2, "0");
  const hh = String(now.getUTCHours()).padStart(2, "0");
  const mi = String(now.getUTCMinutes()).padStart(2, "0");
  const ss = String(now.getUTCSeconds()).padStart(2, "0");
  return `${yyyy}${mm}${dd}${hh}${mi}${ss}`;
}

const srcPath = process.env.SQLITE_DATABASE_PATH?.trim() || defaultSrcPath;
const backupDir = process.env.SQLITE_BACKUP_DIR?.trim();

try {
  if (!backupDir) {
    throw new Error(
      "SQLITE_BACKUP_DIR is not configured; refusing to run backup script.",
    );
  }
  if (!existsSync(backupDir)) {
    throw new Error(
      `SQLITE_BACKUP_DIR=${backupDir} does not exist; create it before running the backup script.`,
    );
  }
  if (!existsSync(srcPath)) {
    throw new Error(`Source SQLite path does not exist: ${srcPath}`);
  }

  const destName = `community-${timestampSuffix()}.sqlite`;
  const destPath = join(backupDir, destName);
  const start = Date.now();

  emit("info", "sqlite.backup.started", {
    backupFile: destName,
  });

  const moduleBackup =
    typeof nodeSqlite.backup === "function" ? nodeSqlite.backup : undefined;

  let mode;
  if (moduleBackup) {
    const db = new nodeSqlite.DatabaseSync(srcPath);
    try {
      await moduleBackup(db, destPath, { rate: 256 });
    } finally {
      db.close();
    }
    mode = "module-backup";
  } else {
    emit("warn", "sqlite.backup.fallback", {
      code: "module-backup-unavailable",
    });
    const db = new nodeSqlite.DatabaseSync(srcPath);
    try {
      try {
        db.exec("PRAGMA wal_checkpoint(TRUNCATE)");
      } catch {
        /* checkpoint best-effort */
      }
    } finally {
      db.close();
    }
    copyFileSync(srcPath, destPath);
    mode = "fallback";
  }

  const durationMs = Date.now() - start;
  emit("info", "sqlite.backup.completed", {
    backupFile: destName,
    durationMs,
    code: mode,
  });

  process.stdout.write(
    `${JSON.stringify({
      ok: true,
      destPath,
      mode,
      durationMs,
    })}\n`,
  );
  process.exit(0);
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${JSON.stringify({ ok: false, error: message })}\n`);
  process.exit(1);
}
