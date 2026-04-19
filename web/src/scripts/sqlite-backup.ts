import {
  copyFileSync,
  existsSync,
  renameSync,
  unlinkSync,
} from "node:fs";
import { join } from "node:path";
import * as nodeSqlite from "node:sqlite";

import { getObservability } from "@/features/observability/init";

export type ModuleSqliteBackup = (
  source: nodeSqlite.DatabaseSync,
  destinationPath: string,
  options?: { rate?: number; progress?: (info: unknown) => void },
) => Promise<number>;

export type RunBackupOptions = {
  srcPath: string;
  backupDir: string;
  /**
   * Override hook used by tests to force the fallback path. When `undefined`
   * (default if key is present) the module-level `sqlite.backup` is treated as
   * unavailable and the WAL-checkpoint + fs.copyFile fallback is taken.
   * When the key is absent, runtime detection is used.
   */
  sqliteBackupOverride?: ModuleSqliteBackup | undefined;
};

export type RunBackupResult = {
  destPath: string;
  mode: "module-backup" | "fallback";
  durationMs: number;
};

function timestampSuffix(): string {
  const now = new Date();
  const yyyy = String(now.getUTCFullYear()).padStart(4, "0");
  const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(now.getUTCDate()).padStart(2, "0");
  const hh = String(now.getUTCHours()).padStart(2, "0");
  const mi = String(now.getUTCMinutes()).padStart(2, "0");
  const ss = String(now.getUTCSeconds()).padStart(2, "0");
  return `${yyyy}${mm}${dd}${hh}${mi}${ss}`;
}

function ensureBackupDir(backupDir: string | undefined): string {
  if (!backupDir || backupDir.trim().length === 0) {
    throw new Error(
      "SQLITE_BACKUP_DIR is not configured; refusing to run backup script.",
    );
  }
  if (!existsSync(backupDir)) {
    throw new Error(
      `SQLITE_BACKUP_DIR=${backupDir} does not exist; create it before running the backup script.`,
    );
  }
  return backupDir;
}

function ensureSrcPath(srcPath: string): string {
  if (!srcPath || srcPath.trim().length === 0) {
    throw new Error("Source SQLite path is required.");
  }
  if (!existsSync(srcPath)) {
    throw new Error(`Source SQLite path does not exist: ${srcPath}`);
  }
  return srcPath;
}

function detectModuleBackup(): ModuleSqliteBackup | undefined {
  const candidate = (nodeSqlite as unknown as { backup?: unknown }).backup;
  return typeof candidate === "function"
    ? (candidate as ModuleSqliteBackup)
    : undefined;
}

function fallbackBackup(srcPath: string, destPath: string): void {
  // WAL checkpoint + atomic file copy. Acceptable when the application is
  // momentarily quiescent (e.g. low-write windows) — see design ADR-2.
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
}

export async function runBackup(
  options: RunBackupOptions,
): Promise<RunBackupResult> {
  const { srcPath } = options;
  const backupDir = ensureBackupDir(options.backupDir);
  ensureSrcPath(srcPath);

  const { logger } = getObservability();

  const destName = `community-${timestampSuffix()}.sqlite`;
  const destPath = join(backupDir, destName);
  const start = Date.now();

  logger.info("sqlite.backup.started", {
    module: "scripts",
    scriptName: "backup-sqlite",
    backupFile: destName,
  });

  const explicitOverridePresent =
    Object.prototype.hasOwnProperty.call(options, "sqliteBackupOverride");
  const moduleBackup = explicitOverridePresent
    ? options.sqliteBackupOverride
    : detectModuleBackup();

  let mode: "module-backup" | "fallback";

  if (moduleBackup) {
    const db = new nodeSqlite.DatabaseSync(srcPath);
    try {
      await moduleBackup(db, destPath, { rate: 256 });
    } finally {
      db.close();
    }
    mode = "module-backup";
  } else {
    logger.warn("sqlite.backup.fallback", {
      module: "scripts",
      scriptName: "backup-sqlite",
      code: "module-backup-unavailable",
    });
    fallbackBackup(srcPath, destPath);
    mode = "fallback";
  }

  const durationMs = Date.now() - start;
  logger.info("sqlite.backup.completed", {
    module: "scripts",
    scriptName: "backup-sqlite",
    backupFile: destName,
    durationMs,
    code: mode,
  });

  return { destPath, mode, durationMs };
}

export type RunRestoreOptions = {
  srcPath: string;
  backupFile: string;
};

export type RunRestoreResult = {
  durationMs: number;
};

export async function runRestore(
  options: RunRestoreOptions,
): Promise<RunRestoreResult> {
  const { srcPath, backupFile } = options;
  if (!srcPath || srcPath.trim().length === 0) {
    throw new Error("Target SQLite path is required.");
  }
  if (!backupFile || backupFile.trim().length === 0) {
    throw new Error("Backup file path is required.");
  }
  if (!existsSync(backupFile)) {
    throw new Error(`Specified backup file does not exist: ${backupFile}`);
  }

  const { logger } = getObservability();
  const start = Date.now();

  logger.info("sqlite.restore.started", {
    module: "scripts",
    scriptName: "restore-sqlite",
    backupFile,
  });

  // Atomic: copy backup to a sibling .restore-tmp file, then rename onto srcPath.
  const tmpPath = `${srcPath}.restore-tmp`;
  copyFileSync(backupFile, tmpPath);
  try {
    renameSync(tmpPath, srcPath);
  } catch (error) {
    try {
      unlinkSync(tmpPath);
    } catch {
      /* swallow cleanup failure */
    }
    throw error;
  }

  const durationMs = Date.now() - start;
  logger.info("sqlite.restore.completed", {
    module: "scripts",
    scriptName: "restore-sqlite",
    backupFile,
    durationMs,
  });

  return { durationMs };
}
