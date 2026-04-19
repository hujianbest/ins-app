# Bug Patterns — T46

- Date: `2026-04-19`
- Task: T46
- Status: passed (no new bug patterns surfaced; one existing baseline pattern reaffirmed)

## 已知 / 反复出现的 bug pattern

| Pattern | 状态 | 处置 |
| --- | --- | --- |
| Vitest 4 + jsdom env 试图 bundle `node:sqlite`（不在 Node 22 builtinModules 中） | baseline 已知，T46 不新引入 | 仅给 `health/route.test.ts` 加 `// @vitest-environment node` pragma；不修改全局 vitest.config.ts，避免本任务 scope 蔓延 |
| Next 16 proxy 与 render code 隔离边界，proxy 内 ALS 不会跨边界透传 | 已被 design ADR-1 / FR-001 显式建模 | 在 `wrapRouteHandler` 内启动 `als.run`，proxy 仅通过 header 传播 trace id |
| `node:sqlite` 模块级 `sqlite.backup` 与 `db.backup()` 易混淆 | T51 范围，本任务不触发 | 留待 T51 的 bug-patterns 复用本结论 |

## 本任务过程中采取的预防

- ALS 跨 await 透传：`trace.test.ts` 显式覆盖 async + await 跨 microtask 仍持有 trace id 的边界。
- log 序列化：在 `logger.test.ts` 显式断言 `JSON.parse` 无 throw 且单行（生产模式）。
- response header 重复写入：`server-boundary.ts` 在 `applyTraceHeader` 中先检查 `headers.has(TRACE_HEADER)` 再写，避免覆盖业务自身设置的 trace id。
- response 已 frozen 时仍能写头：`applyTraceHeader` 提供 `try / catch` fallback：构造新 Response 透传 body / status / statusText。

## 结论

无 USER-INPUT 缺口；无 critical / important finding；本任务可继续 `hf-test-review`。
