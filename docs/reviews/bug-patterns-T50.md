# Bug Patterns — T50

- Date: `2026-04-19`
- Status: passed

## 关键检查
- **Hard-stop 仅在生产配置错误时触发**：`metricsEnabled=true` 缺 token 抛错；其它 env 错误一律降级 + warning（NFR-004）。测试覆盖 hard-stop 与各类降级路径。
- **Token 不入响应**：health 测试 "flips metricsEnabled... but never echoes the token" 用 `expect(text).not.toContain("ultra-secret-zzz")` 显式守住（I-5）。
- **backup 字段 best-effort**：`SQLITE_BACKUP_DIR` 路径不存在 / 内部空 / 含历史备份三种情况都有显式断言。
- **5s 缓存避免 1Hz 探测期间反复 readdir**：缓存 key 为 backupDir 字符串；变更 backupDir 触发新 cache 项。
- **现有 health route 行为不变**：原 4 个用例（包括 trace id 行为）继续通过。

## 结论
无 finding。
