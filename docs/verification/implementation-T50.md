# Implementation T50 — Env Contract + `/api/health` Extension

- Date: `2026-04-19`
- Task: T50

## 实现内容

### `web/src/config/env.ts` 扩展
- 新增类型：`LogLevelLiteral`、`ObservabilityConfig`、`BackupConfig`、`ConfigWarning`、`ObservabilityConfigResult`
- 新增函数：
  - `readObservabilityConfig(env?)`：解析 `OBSERVABILITY_LOG_LEVEL` / `OBSERVABILITY_METRICS_ENABLED` / `OBSERVABILITY_METRICS_TOKEN` / `OBSERVABILITY_SLOW_QUERY_MS` / `ERROR_REPORTER_PROVIDER` / `SENTRY_DSN`，非法值降级 + warning，`metricsEnabled=true` 缺 token 唯一硬中止
  - `readBackupConfig(env?)`：解析 `SQLITE_BACKUP_DIR`（不创建目录）
  - `getObservabilityConfig()` / `getBackupConfig()`

### `/api/health` 字段扩展
- 保留旧字段不变：`ok / service / environment / runtime`
- 新增 `observability.{ loggerEnabled, metricsEnabled, errorReporter }` 与 `backup.{ ready, lastBackupAt }`
- `backup.ready=true` 仅当 `SQLITE_BACKUP_DIR` 设置且目录存在
- `backup.lastBackupAt` 通过扫描 `community-*.sqlite` mtime 取最新；带 5s 缓存（`backupLastAtCache`），避免 1Hz 探测下反复 readdir
- 响应**不**含 `OBSERVABILITY_METRICS_TOKEN` / `SENTRY_DSN` 子串（FR-008 验收 3 + I-5）

## 测试结果
```
$ npx vitest run src/app/api/health/ src/config/env.test.ts
 Test Files  2 passed (2)
      Tests  17 passed (17)
```

## 设计 / 规格承接
- FR-006 全部 5 条验收（默认 / hard-stop 缺 token / log level 非法降级 / slow query 非法降级 / SQLITE_BACKUP_DIR 不自动创建）✅
- FR-008 全部 3 条验收（默认字段 / 启用 metrics 标志位 / 不回传 token）✅
- NFR-004（启动鲁棒性，仅唯一 hard-stop）✅
- I-5（token / DSN 不出现在任何 health/log 响应）✅
- I-6（`/api/health` 字段格式向后兼容；新增字段位于独立命名空间）✅

## Verify
```
✅ npx vitest run src/app/api/health/ src/config/env.test.ts → 17 passed
✅ npm run lint → 0 errors
✅ npm run typecheck → 仅 baseline 4 错
✅ npm run build → success
```
