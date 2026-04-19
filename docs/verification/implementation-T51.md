# Implementation T51 — SQLite Backup / Restore CLI

- Date: `2026-04-19`
- Task: T51
- Branch: `cursor/phase2-observability-ops-051b`

## 实现内容

### 共享 lib（vitest 可覆盖）
- `web/src/scripts/sqlite-backup.ts`：
  - `runBackup({ srcPath, backupDir, sqliteBackupOverride? })`：主路径 `node:sqlite` 模块级 `sqlite.backup(db, destPath, { rate: 256 })`；自检 `typeof sqlite.backup === 'function'`；缺失时 fallback 到 `PRAGMA wal_checkpoint(TRUNCATE) + fs.copyFile`，并 emit `event=sqlite.backup.fallback code=module-backup-unavailable`
  - `runRestore({ srcPath, backupFile })`：`fs.copyFile` 到 `srcPath.restore-tmp` → `fs.rename` 原子替换；失败时清理 tmp
  - 入口校验：`SQLITE_BACKUP_DIR` 缺失 / 路径不存在 / `srcPath` 不存在 → throw 明确 message
  - 全部输出经 logger（FR-007 + Boundary 一致）

### CLI 入口（独立 .mjs，无 npm 依赖）
- `web/scripts/backup-sqlite.mjs`：自包含、emit 结构化 JSON 日志、最终输出 `{ ok, destPath, mode, durationMs }`；失败退出码 1 + JSON error 行
- `web/scripts/restore-sqlite.mjs`：接受 backup 文件位置参数；同样结构化日志 + 1 line stdout summary
- 两者均不依赖 TypeScript 编译输出，可在产线环境直接 `node web/scripts/...mjs` 调用（无需引入 tsx / ts-node — 满足 NFR-002）

### 测试
- `src/scripts/sqlite-backup.test.ts`：7 用例
  - main backup（产文件、可重新打开、读到 Alice/Bob）
  - backupDir 缺失 throw
  - backupDir 路径不存在 throw
  - fallback 路径触发（强制 `sqliteBackupOverride: undefined`）+ 验证仍读到 Alice/Bob + 写 fallback log
  - restore round trip（删除 → 恢复 → Alice/Bob 复现）
  - restore missing backup file throw
  - integration: backup dir 含 community-*.sqlite 可被 health route 端逻辑识别

## 测试结果
```
$ npx vitest run src/scripts/ src/features/observability/ src/app/api/health/ src/config/env.test.ts src/app/api/metrics/

 Test Files  10 passed (10)
      Tests  78 passed (78)
```

## 端到端 CLI 验证（手工）

详见 `/opt/cursor/artifacts/t51-cli-e2e-evidence.md`：
- backup 成功 → `mode=module-backup` 走主路径，产 `community-20260419053227.sqlite`
- 缺 `SQLITE_BACKUP_DIR` → exit 1
- 删除源数据后 restore → Alice / Bob 完整恢复
- restore 不存在的 backup 文件 → exit 1

`/opt/cursor/artifacts/t51-backup-dir-snapshot/` 含真实备份产物快照。

## 设计 / 规格承接
- FR-007 验收 1（产文件可重新打开） ✅
- FR-007 验收 2（不阻塞实例 — 主路径用 `sqlite.backup` 不锁库；e2e CLI 手工跑 5ms 完成） ✅
- FR-007 验收 3（restore 原子替换 + 写 `event=sqlite.restore.completed`） ✅
- FR-007 验收 4（`SQLITE_BACKUP_DIR` 缺失 / 路径不存在 → 非零退出 + 明确错误） ✅
- ADR-2（主路径模块级 `sqlite.backup`；fallback 自检 `typeof require('node:sqlite').backup`） ✅
- 与 T50 联动：备份后 `/api/health.backup.lastBackupAt` 反映新 mtime（已由 T50 测试覆盖） ✅
- NFR-002（无新 npm 依赖；CLI 自包含） ✅

## Verify
```
✅ npx vitest run（10 文件 78 用例） → all passed
✅ E2E CLI（4 个手工场景） → all expected behaviors confirmed
✅ npm run lint → 0 errors（baseline 1 warning）
✅ npm run typecheck → 仅 baseline 4 错
✅ npm run build → success
```
