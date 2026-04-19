# Test Design — T50 Env Contract + `/api/health` Extension

## 测试用例

### env loader（`web/src/config/env.ts`）— 新增 `readObservabilityConfig` / `readBackupConfig`
- TC-T50-1：默认配置 → `OBSERVABILITY_LOG_LEVEL='info'`、`OBSERVABILITY_METRICS_ENABLED=false`、`OBSERVABILITY_SLOW_QUERY_MS=100`、`ERROR_REPORTER_PROVIDER='noop'`、`SQLITE_BACKUP_DIR=undefined`
- TC-T50-2：`OBSERVABILITY_LOG_LEVEL='warn'` → `'warn'`；`'invalid'` → `'info'` + `warnings` 含 `slug=log-level-invalid`
- TC-T50-3：`OBSERVABILITY_METRICS_ENABLED='true'` 缺 `OBSERVABILITY_METRICS_TOKEN` → `readObservabilityConfig` throw（唯一硬中止）
- TC-T50-4：`OBSERVABILITY_METRICS_ENABLED='true'` + token → `enabled=true` + `token` 字段
- TC-T50-5：`OBSERVABILITY_SLOW_QUERY_MS` 非正数 / 非整数 / abc → 回退 100 + warnings
- TC-T50-6：`ERROR_REPORTER_PROVIDER='sentry'` + `SENTRY_DSN` → 透传 raw 字符串到 config（实际 reporter 选择由 T47 `resolveErrorReporter` 决定）
- TC-T50-7：`SQLITE_BACKUP_DIR='/tmp/x'` → 透传，不创建目录

### `/api/health` 扩展字段
- TC-T50-8：默认 → 旧字段不变（ok / service / environment / runtime）+ 新增 `observability.{ loggerEnabled:true, metricsEnabled:false, errorReporter:'noop' }` + `backup.{ ready:false, lastBackupAt:null }`
- TC-T50-9：`OBSERVABILITY_METRICS_ENABLED='true'` + token → `metricsEnabled=true`，但响应不含 token 字符串
- TC-T50-10：`SQLITE_BACKUP_DIR` 路径不存在 → `backup.ready=false / lastBackupAt=null`
- TC-T50-11：`SQLITE_BACKUP_DIR` 路径存在但空 → `backup.ready=true / lastBackupAt=null`（路径准备好就算 ready）
- TC-T50-12：`SQLITE_BACKUP_DIR` 路径含 `community-*.sqlite` 文件 → `backup.lastBackupAt` 为最近 mtime 的 ISO8601；多次调用会缓存 5s（不在测试覆盖；最少校验单次反映）
- TC-T50-13：disabled 仍返 503 + 旧字段 + 新字段也存在（向后兼容）
