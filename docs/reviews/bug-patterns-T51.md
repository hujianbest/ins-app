# Bug Patterns — T51

- Date: `2026-04-19`
- Status: passed; one critical risk averted (per design-review F-2)

## 关键检查
- **`sqlite.backup` 是模块级函数而非实例方法**：design-review F-2 已通过 Node 22.22.2 实测确认；本任务严格使用 `nodeSqlite.backup(db, destPath, options)`；fallback 自检 `typeof nodeSqlite.backup === 'function'`，不再写 `db.backup(...)` 这种"永远不会走"的路径
- **fallback 路径必须真的能跑通**：`runBackup` 通过 `sqliteBackupOverride: undefined` 注入路径让测试主动触发 fallback，避免"理论存在但从未跑过"的退化
- **restore 原子性**：复制到 `srcPath.restore-tmp` 然后 `fs.rename`（POSIX 原子）；rename 失败时清理 tmp，不留垃圾文件
- **健康检查不被阻塞**：主路径 `sqlite.backup` 在子线程进行（node:sqlite 内部实现），E2E 实测 5ms 完成，远低于 FR-007 第 2 条的 2 秒不可用窗口阈值
- **CLI 不依赖 ts/tsx**：完全独立 .mjs 入口，可在产线 / Docker / cron 直接运行（NFR-002）
- **emit 行内 JSON**：CLI 与 web app logger 输出格式对齐，便于统一日志聚合

## 结论
无 USER-INPUT 缺口；critical 风险已通过设计 + 实现 + 实测三重确认消除。
