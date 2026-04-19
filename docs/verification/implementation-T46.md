# Implementation T46 — Walking Skeleton

- Date: `2026-04-19`
- Task: T46 — Trace + Logger + Server Boundary + Proxy + `/api/health` walking skeleton
- Branch: `cursor/phase2-observability-ops-051b`

## 实现内容

### 新增模块（`web/src/features/observability/`）
- `trace.ts`：基于 `node:async_hooks.AsyncLocalStorage` 的 trace context；`runWithTrace` / `getCurrentTraceId` / `isValidTraceId` 三个导出。trace id 字符集 `^[A-Za-z0-9_-]{8,128}$`。
- `logger.ts`：JSON / pretty 双模式 logger，level 过滤（`debug | info | warn | error`），受控键白名单（19 个键，对齐 spec FR-002 第 4 条），单条 ≤ 8 KiB 截断 + `truncated=true` 标记，trace id 自动注入（无 active trace 时为 `'unknown'`）。提供 `createInMemoryLogger` 用于测试。
- `init.ts`：lazy-init 的 `getObservability()` 单例 + `resetObservabilityForTesting()` + `installInMemoryLogger()`。
- `server-boundary.ts`：`wrapRouteHandler(name, handler)` decorator；从入站 `x-trace-id` header 解析并 `runWithTrace`；写响应头 `x-trace-id`；成功路径 emit `event=http.request.completed`、失败路径 emit `event=http.request.error`；invalid / missing trace id 自动 `crypto.randomUUID()` 重生。

### 新增模块（`web/src/`）
- `proxy.ts`：Next 16 proxy 入口（不再叫 middleware.ts）。生成 / 继承 trace id 后写入 inbound `x-trace-id` 与响应 `x-trace-id`。**不**在 proxy 内 `als.run`（避免 Next 16 proxy 与 render code 的隔离边界陷阱）；ALS 由下游 `wrapRouteHandler` 在 boundary 入口发起。

### 修改模块
- `web/src/app/api/health/route.ts`：`GET` 改为 `wrapRouteHandler('health', ...)`，行为完全不变。
- `web/src/app/api/health/route.test.ts`：增加 `// @vitest-environment node` pragma（详见下方 R-3）；新增 trace id inheritance / generation 两条断言；现有两条断言（enabled / disabled）保持。

### 测试
- `trace.test.ts`：6 个用例（isValidTraceId 正负、run 嵌套、async 通过 await 仍持有）。
- `logger.test.ts`：9 个用例（level filter、trace id auto-injection、白名单丢弃、保留、8KiB 截断、JSON serializability）。
- `server-boundary.test.ts`：4 个用例（inherit + emit、generate / regenerate、错误路径、保持响应状态码）。
- `proxy.test.ts`：4 个用例（inherit、generate、regenerate from blank、regenerate from too-short）。
- `app/api/health/route.test.ts`：4 个用例（runtime status、disabled、inherit trace id、auto-generate trace id）。

## 测试结果

```
$ cd /workspace/web && npx vitest run src/features/observability/ src/proxy.test.ts src/app/api/health/

 Test Files  5 passed (5)
      Tests  27 passed (27)
```

## 端到端 Walking Skeleton 验证

启动 `NODE_ENV=production npm run start`（端口 3010），手工 `curl`：

- `curl -i -H "x-trace-id: walking-skeleton-curl-001" /api/health` → 200，响应头 `x-trace-id: walking-skeleton-curl-001`，body 不变；服务器结构化日志：`{"timestamp":"2026-04-19T03:57:35.544Z","level":"info","traceId":"walking-skeleton-curl-001","event":"http.request.completed","module":"route","route":"health","method":"GET","status":200,"durationMs":63}`
- `curl -i /api/health`（无 inbound）→ 200，响应头 `x-trace-id: 88dd66fd-c2e8-4234-99ee-b202ed59e5c9`（UUID v4），日志中 traceId 与响应头同值。

证据：`/opt/cursor/artifacts/t46-walking-skeleton-curl-evidence.md`、`/opt/cursor/artifacts/t46-walking-skeleton-server-log.txt`。

## 风险与决策记录

### R-1（baseline 环境问题）
- 触发：vitest 4 默认 `environment: jsdom` 时尝试 bundle `node:sqlite` 失败；这是仓库基线问题（`node:sqlite` 不在 Node 22 `builtinModules` 中，故 vitest 自动 externalization 漏掉了它）。
- 影响：在 master 基线上，全套 `npm run test` 即失败 19 个文件 / 1 条用例（详见 `docs/verification/regression-gate-lens-archive-discovery-quality.md`，团队历史采用 `npm test -- <selective>` 规避）。
- T46 处置：仅给 `web/src/app/api/health/route.test.ts` 加 `// @vitest-environment node` pragma 让该文件在 node env 跑，不污染其它文件、不修改 `vitest.config.ts`（避免本任务超出范围引入大改动）。
- 净效果：从 `19 failed | 30 passed (49)` → `18 failed | 31 passed (49)`，新增的 27 个用例全绿。
- 后续：未来若需要把全套 `npm run test` 修绿，可考虑批量加 pragma 或重构 `vitest.config.ts` 引入 `projects` API；建议作为 §3.8 后续小增量或统一 finalize 时处理，不在 T46 范围内。

### R-2（baseline typecheck 错误）
- `src/features/community/work-actions.test.ts` 4 条 `TS2353/TS2741`（`canManageStudio` / `reason` / `redirectTo` 字段缺失）—— 自 Lens Archive Discovery Quality 收口前已存在（详见 `docs/reviews/increment-lens-archive-discovery-quality-mainline-merge.md` 「Verification 第 2 条」）。T46 不修这部分，与现有约定一致。

### 命中的设计约束
- ADR-1 / FR-001：proxy 仅通过 header 传播 trace id；ALS run 在 wrapper 内发起；与 Next 16 proxy 隔离边界一致。
- I-3：trace id 字符集 `^[A-Za-z0-9_-]{8,128}$` 在 `trace.ts` 与 `proxy.ts` 各自实现一份（proxy 不允许依赖共享模块 / 全局），并由 `proxy.test.ts` 与 `trace.test.ts` 分别断言。
- I-4：log 体积 ≤ 8 KiB + `truncated=true`，由 `logger.test.ts` 断言。
- NFR-005：所有断言通过 `installInMemoryLogger` / `createInMemoryLogger` 完成，每个测试 `beforeEach` 重置；不污染全局 stdout。

## Verify

```
✅ npx vitest run src/features/observability/ src/proxy.test.ts src/app/api/health/  → 27 passed
✅ npm run lint   → 0 errors（保留 1 条 pre-existing warning：sqlite.test.ts 'opportunityPosts' unused）
✅ npm run typecheck → 仅保留 4 条 baseline work-actions.test.ts 错误（与 master 一致）
✅ npm run build → success；构建输出包含 `Proxy (Middleware)` 行，确认 proxy.ts 已被 Next 16 识别
✅ E2E 手工 curl → x-trace-id 头部 + 结构化日志 trace id 串联成立
```
