#!/usr/bin/env node
// Usage: node web/scripts/restore-sqlite.mjs <backup-file>
//
// Reads:
//   SQLITE_DATABASE_PATH (default: web/.data/community.sqlite relative to repo root)
//
// Atomically replaces the source DB with the supplied backup file via
// fs.copyFile to a sibling .restore-tmp followed by fs.rename. The caller
// is responsible for stopping the application before running this script.
//
// Per design ADR-2 / FR-007.

import { copyFileSync, existsSync, renameSync, unlinkSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const defaultSrcPath = resolve(here, "..", ".data", "community.sqlite");

function emit(level, event, ctx) {
  const record = {
    timestamp: new Date().toISOString(),
    level,
    traceId: "script",
    event,
    module: "scripts",
    scriptName: "restore-sqlite",
    ...ctx,
  };
  process.stdout.write(`${JSON.stringify(record)}\n`);
}

const backupFileArg = process.argv[2];
const srcPath = process.env.SQLITE_DATABASE_PATH?.trim() || defaultSrcPath;

try {
  if (!backupFileArg || backupFileArg.trim().length === 0) {
    throw new Error(
      "Missing required positional argument: path to backup file.",
    );
  }
  const backupFile = resolve(backupFileArg);

  if (!existsSync(backupFile)) {
    throw new Error(`Specified backup file does not exist: ${backupFile}`);
  }

  emit("info", "sqlite.restore.started", { backupFile });

  const start = Date.now();
  const tmpPath = `${srcPath}.restore-tmp`;
  copyFileSync(backupFile, tmpPath);
  try {
    renameSync(tmpPath, srcPath);
  } catch (renameError) {
    try {
      unlinkSync(tmpPath);
    } catch {
      /* swallow cleanup failure */
    }
    throw renameError;
  }

  const durationMs = Date.now() - start;
  emit("info", "sqlite.restore.completed", {
    backupFile,
    durationMs,
  });

  process.stdout.write(
    `${JSON.stringify({
      ok: true,
      restoredTo: srcPath,
      backupFile,
      durationMs,
    })}\n`,
  );
  process.exit(0);
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${JSON.stringify({ ok: false, error: message })}\n`);
  process.exit(1);
}
