# Test Design — T51 SQLite Backup / Restore CLI

## 测试策略

CLI 脚本直接以 vitest 测试为准（fork 子进程或 in-process import 主入口函数）。
为了与 `web/src/` 保持一致并利用现有 vitest 设施，将脚本主体逻辑抽到 `web/src/scripts/sqlite-backup.ts`（可被 vitest import + 直接由 `.mjs` 入口调用）。

## 用例

### lib 层 `runBackup` / `runRestore`
- TC-T51-1：`runBackup({ srcPath, backupDir })` 在临时目录内对真实 sqlite 写入运行后产出 `community-YYYYMMDDHHmmss.sqlite`；用 `node:sqlite` 重新打开备份能读取所有现有表。
- TC-T51-2：`backupDir` 缺失 → throw + 明确 message。
- TC-T51-3：`backupDir` 路径不存在 → throw + 明确 message。
- TC-T51-4：模拟 `sqlite.backup` 不存在场景（mock module）→ fallback 路径触发 + 写 `event=sqlite.backup.fallback`。
- TC-T51-5：`runRestore({ srcPath, backupFile })` 用备份替换原 db；恢复后 `node:sqlite` 重新打开能读到备份内容。
- TC-T51-6：`backupFile` 不存在 → throw。
- TC-T51-7：`backupDir` / 路径校验复用同一函数。

### CLI 入口 `web/scripts/backup-sqlite.mjs` / `restore-sqlite.mjs`
- 由 lib 层覆盖；CLI 入口仅 1 行 `import + run`，本任务不针对入口本身写 vitest（避免 spawn child process 的复杂度），但在 implementation evidence 中记录手工 `node web/scripts/...mjs` 的验证。

## fail-first
1. `sqlite-backup.test.ts` → 红 → `sqlite-backup.ts` 实现 → 绿
2. `web/scripts/backup-sqlite.mjs` + `restore-sqlite.mjs` 入口实现 → 手工 e2e 验证

## health route 联动
- T50 已经实现 `backup.ready` / `lastBackupAt` 字段；T51 不需要再改 health route，只需要 manual e2e 校验 backup 后字段更新。
