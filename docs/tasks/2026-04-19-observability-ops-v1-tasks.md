# Phase 2 — Observability & Ops V1 任务计划

- 状态: 已批准
- 批准记录: `docs/verification/tasks-approval-phase2-observability-ops-v1.md`
- 主题: Phase 2 — Observability & Ops V1（可观测性与运维 V1）
- 输入规格: `docs/specs/2026-04-19-observability-ops-v1-srs.md`（已批准）
- 输入设计: `docs/designs/2026-04-19-observability-ops-v1-design.md`（已批准）
- 关联 review: `docs/reviews/spec-review-phase2-observability-ops-v1.md`、`docs/reviews/design-review-phase2-observability-ops-v1.md`
- 关联 approval: `docs/verification/spec-approval-phase2-observability-ops-v1.md`、`docs/verification/design-approval-phase2-observability-ops-v1.md`
- 当前活跃任务: `T46`（Walking Skeleton）

## 1. 概述

本计划把已批准设计拆为 6 个**可独立 fail-first 推进**的任务（`T46` ~ `T51`），覆盖：

- 可观测性 primitives（trace / logger / errors / reporter / metrics）
- server boundary 接入（`wrapRouteHandler` / `wrapServerAction` + 现有 server action / route handler 改造）
- env 契约扩展 + `/api/health` 字段扩展
- 内部 `/api/metrics` 出口
- SQLite 备份 / 恢复 CLI

拆解原则：

- 先做最薄端到端的 walking skeleton（trace + logger + 1 个 route handler），确保 ALS 在 Next 16 proxy 边界下的协议先 work，再扩面。
- errors / reporter / metrics 作为独立 primitive 任务，每个都能在 Vitest 内单元闭环。
- server boundary 的「接入既有 server action」放在 primitives 全部 ready 之后单任务收口，避免反复改同一批文件。
- 备份脚本独立成最末任务，因为脚本不依赖 web app 启动，但需要 logger primitive 已 ready。
- env 契约扩展和 `/api/health` 字段扩展合并为一个任务，因为它们改动的是同一文件 + 同一 route。

每个任务遵循 `web/AGENTS.md` 的 fail-first 节奏：写测试 → 跑 → 红 → 实现 → 跑 → 绿 → 跑 `npm run test / typecheck / lint / build` 全绿。

## 2. 里程碑

### M1 Walking Skeleton（`T46`）

- 目标：在 Next 16 proxy + boundary wrapper 的协议下，让 `/api/health` 请求带回 `x-trace-id` 头部，并在 logger 中产生一条 `event=http.request.completed` 的 JSON 日志。
- 退出标准：vitest 测试断言「带入站 `x-trace-id` 的 health 请求 → 响应头一致 + in-memory logger 收到事件」全绿；手工 `curl` 行为一致；`cd web && npm run test && npm run typecheck && npm run lint && npm run build` 全绿。

### M2 错误归一化与上报（`T47`）

- 目标：`AppError` 类、`normalizeError` 与 `ErrorReporter` 工厂三组 primitive 完整实现，并用单元测试覆盖 noop / console / sentry-stub 三种 provider 的降级行为。
- 退出标准：所有相关 unit test 全绿；reporter 默认 `noop`，sentry-stub 在 DSN 已配置时仍降级 + warn；`npm run test` / `npm run typecheck` / `npm run lint` / `npm run build` 全绿。

### M3 Metrics + 内部出口（`T48`）

- 目标：`MetricsRegistry`（counter / gauge / histogram）+ `/api/metrics` route handler；disabled→404、unauth→401、ok→200。
- 退出标准：route handler 测试全绿；`/api/metrics` 在 disabled / wrong token / right token 三种状态行为符合验收；`npm run test` / `npm run typecheck` / `npm run lint` / `npm run build` 全绿。

### M4 Server Boundary 接入（`T49`）

- 目标：用 `wrapRouteHandler` / `wrapServerAction` 包装现有 server action / route handler，统一接入 trace / log / metrics / 错误归一化；不改业务行为。
- 退出标准：现有所有 vitest 测试不变绿（业务行为零变化）；新增 boundary 集成测试覆盖成功 / 失败两条路径下的 logger / metrics / reporter 调用；`npm run test` / `npm run typecheck` / `npm run lint` / `npm run build` 全绿。

### M5 Env 契约 + `/api/health` 扩展（`T50`）

- 目标：`web/src/config/env.ts` 扩展 observability / backup 字段；`/api/health` 新增 `observability` / `backup` 命名空间，保持向后兼容。
- 退出标准：env 解析的降级 / hard-stop / non-positive `OBSERVABILITY_SLOW_QUERY_MS` 行为均有测试覆盖；扩展后的 `/api/health` 字段断言全绿；`npm run test` / `npm run typecheck` / `npm run lint` / `npm run build` 全绿。

### M6 SQLite 备份 / 恢复 CLI（`T51`）

- 目标：`web/scripts/backup-sqlite.mjs` + `web/scripts/restore-sqlite.mjs`；主路径 `sqlite.backup`，fallback `wal_checkpoint + copyFile`；`/api/health.backup` 字段联动。
- 退出标准：CLI 单元 / 集成测试全绿（包括 `SQLITE_BACKUP_DIR` 缺失的非零退出）；运行 backup → restore 链路在临时目录实测可恢复；`npm run test` / `npm run typecheck` / `npm run lint` / `npm run build` 全绿。

## 3. 文件 / 工件影响图

### 新增

- `web/src/features/observability/trace.ts` + `.test.ts`
- `web/src/features/observability/logger.ts` + `.test.ts`
- `web/src/features/observability/errors.ts` + `.test.ts`
- `web/src/features/observability/error-reporter.ts` + `.test.ts`
- `web/src/features/observability/metrics.ts` + `.test.ts`
- `web/src/features/observability/server-boundary.ts` + `.test.ts`
- `web/src/features/observability/init.ts`（lazy 装配 + `resetObservabilityForTesting`）
- `web/src/features/observability/test-support.ts`（`createInMemoryLogger / Reporter` 等）
- `web/src/proxy.ts`
- `web/src/app/api/metrics/route.ts` + `route.test.ts`
- `web/scripts/backup-sqlite.mjs`
- `web/scripts/restore-sqlite.mjs`
- `web/scripts/__tests__/backup-restore.test.mjs`（或就近 vitest 文件）
- `docs/verification/test-design-T46.md` ~ `T51.md`
- `docs/verification/implementation-T46.md` ~ `T51.md`
- `docs/reviews/bug-patterns-T46.md` ~ `T51.md`
- `docs/reviews/test-review-T46.md` ~ `T51.md`
- `docs/reviews/code-review-T46.md` ~ `T51.md`
- `docs/reviews/traceability-review-T46.md` ~ `T51.md`
- `docs/verification/regression-T46.md` ~ `T51.md`
- `docs/verification/completion-T46.md` ~ `T51.md`
- `docs/verification/regression-gate-phase2-observability-ops-v1.md`
- `docs/verification/completion-gate-phase2-observability-ops-v1.md`
- `docs/verification/finalize-phase2-observability-ops-v1.md`
- `docs/verification/release-notes-phase2-observability-ops-v1.md`

### 修改

- `web/src/config/env.ts`（扩展 observability / backup 字段）
- `web/src/app/api/health/route.ts`（扩展字段；接入 wrapRouteHandler）
- `web/src/app/api/health/route.test.ts`（新增字段断言）
- `web/src/app/api/discovery-events/route.ts`（接入 wrapRouteHandler）
- `web/src/app/api/discovery-events/route.test.ts`（boundary 行为断言）
- `web/src/features/auth/*-action.ts`、`web/src/features/community/*-actions.ts`、`web/src/features/community/*-editor.ts`、`web/src/features/social/*-action.ts`、`web/src/features/social/comments/*-actions.ts`、`web/src/features/engagement/*-action*.ts`、`web/src/features/opportunities/*-actions.ts`、`web/src/features/contact/*-actions.ts`（接入 wrapServerAction，**不改业务逻辑**）
- 上述各文件对应的 `*.test.ts`（仅断言行为不变；新增 boundary 行为断言可放在新建的 `server-boundary.test.ts`，避免散落）
- `task-progress.md`（每个任务完成时同步）
- `RELEASE_NOTES.md`（在 `T51` 完成后的 finalize 阶段一次性追加）
- `docs/ROADMAP.md`（finalize 阶段回写「§3.8 已交付 V1」）

## 4. 需求与设计追溯

| 规格 / 设计锚点 | 落地任务 |
| --- | --- |
| `FR-001` Trace ID | `T46`、`T49` |
| `FR-002` Logger | `T46` |
| `FR-003` AppError + 归一化 | `T47`、`T49` |
| `FR-004` ErrorReporter | `T47` |
| `FR-005` MetricsRegistry + `/api/metrics` | `T48` |
| `FR-006` env 契约扩展 | `T50` |
| `FR-007` Backup / Restore CLI | `T51` |
| `FR-008` `/api/health` 字段扩展 | `T50`、`T51`（backup 字段） |
| `FR-009` Boundary 接入 | `T49` |
| `NFR-001` 性能开销上限 | `hf-regression-gate`（一次性执行，绑定到 increment 而非单 task） |
| `NFR-002` 无新 runtime 依赖 | 全部任务 + `code-review` 阶段 + `completion-gate` |
| `NFR-003` 安全边界 | `T46`（logger 白名单）、`T47`（reporter）、`T48`（token / metrics 字段） |
| `NFR-004` 启动鲁棒性 | `T50` |
| `NFR-005` 可测试性 | `T46` ~ `T51` 全部任务，必须使用 in-memory primitives（`createInMemoryLogger` / `createInMemoryReporter` / `resetObservabilityForTesting`） |
| 设计 §11.2 I-1 ~ I-7 不变量 | `T46`（I-3, I-4）、`T47`（I-2）、`T48`（I-1, I-5）、`T49`（I-7）、`T50`（I-6） |
| 设计 ADR-1 | `T46`、`T49` |
| 设计 ADR-2 | `T51` |
| 设计 ADR-3 | `T46` ~ `T48` |
| 设计 ADR-4 | `T48` |
| 设计 ADR-5 | `T49` |

## 5. 任务拆解

### T46. Trace + Logger Walking Skeleton

- 目标：建立 trace primitive、logger primitive、`server-boundary.wrapRouteHandler`、`web/src/proxy.ts` 与 `/api/health` 的最薄接入；让带 `x-trace-id` 入站头的 health 请求带回同值响应头并产生一条 JSON 日志。
- Acceptance:
  - `runWithTrace(traceId, fn)` 与 `getCurrentTraceId()` 在 ALS 内正确隔离。
  - logger JSON 模式输出包含 `timestamp / level / traceId / event / module`，单条 ≤ 8 KiB；超大字段被截断且写 `truncated=true`。
  - logger 接受的 context 仅限设计 §11.1 `AllowedContextKey` 集合；超集字段被丢弃。
  - `wrapRouteHandler('health', handler)` 自动从 `Request.headers.get('x-trace-id')` 读取 trace id 并 `runWithTrace`，请求结束写一条 `event=http.request.completed` 日志。
  - `web/src/proxy.ts` 在 inbound 阶段为缺失或非法的 `x-trace-id` 生成 `crypto.randomUUID()` 替换；合法继承时记 `traceIdSource=inherited`。
  - `web/src/app/api/health/route.ts` 改造为 `export const GET = wrapRouteHandler('health', ...)`，行为不变。
- 依赖: 无（首项任务）。
- Ready When: 上游设计已批准；本计划已批准。
- 初始队列状态: `ready`。
- Selection Priority: 1（walking skeleton 优先）。
- Files / 触碰工件:
  - 新增 `web/src/features/observability/trace.ts`、`logger.ts`、`server-boundary.ts`、`init.ts`、`test-support.ts`
  - 新增 `web/src/proxy.ts`
  - 修改 `web/src/app/api/health/route.ts`、`web/src/app/api/health/route.test.ts`
  - 新增对应 `*.test.ts`
- 测试设计种子:
  - 主行为：health request with `x-trace-id` → 响应头一致 + logger 收到事件（fail-first）
  - 关键边界：proxy 在缺失 / 非法 `x-trace-id` 时 regenerate，下游 logger 体现 `traceIdSource`
  - fail-first 点：logger 接受超集 context key 时丢弃；超 8 KiB log 被截断
  - 可测试性 (NFR-005)：所有断言必须通过 `createInMemoryLogger()` 与 `resetObservabilityForTesting()` 完成，不允许用全局单例污染
- Verify: `cd web && npm run test && npm run typecheck && npm run lint && npm run build`（全绿即通过）。
- 预期证据: `docs/verification/test-design-T46.md`、`docs/verification/implementation-T46.md`、`docs/reviews/bug-patterns-T46.md`、`docs/reviews/test-review-T46.md`、`docs/reviews/code-review-T46.md`、`docs/reviews/traceability-review-T46.md`、`docs/verification/regression-T46.md`、`docs/verification/completion-T46.md`。
- 完成条件: 所有 unit + integration 测试绿；`npm run test` / `npm run typecheck` / `npm run lint` / `npm run build` 绿；评审链 `bug-patterns → test-review → code-review → traceability-review → regression-gate(任务级 sanity) → completion-gate` 全部通过。

---

### T47. Errors + ErrorReporter

- 目标：实现 `AppError`、`normalizeError(error, ctx)`、`ErrorReporter` 接口与 `noop` / `console` / `sentry-stub` 三种内置 provider；reporter 内部异常被吞且不冒泡。
- Acceptance:
  - `AppError` 默认 `code=internal_error`、`status=500`；可显式构造 `forbidden`/403 等。
  - `normalizeError(unknown, ctx)` 输出 `AppError`，保留 `cause`、写入 `traceId`（来自 `getCurrentTraceId()`），并调用 `errorReporter.report` 一次。
  - HTTP 错误响应 body 仅包含 `{ error: { code, message, traceId } }`，不含原始栈或文件路径。
  - `ERROR_REPORTER_PROVIDER=noop`/未设置 → `noop`，无网络请求。
  - `ERROR_REPORTER_PROVIDER=sentry` + `SENTRY_DSN` 缺省 → `noop` + warn 日志。
  - `ERROR_REPORTER_PROVIDER=sentry` + `SENTRY_DSN` 设置但 SDK 未打包 → `noop` + warn 日志（设计 FR-004 对称验收）。
  - `ERROR_REPORTER_PROVIDER=console` → 错误输出含 `code / message / traceId / stack`。
- 依赖: `T46`（需要 logger + trace primitives）。
- Ready When: `T46` completion-gate 通过。
- 初始队列状态: `pending`。
- Selection Priority: 2。
- Files / 触碰工件:
  - 新增 `web/src/features/observability/errors.ts`、`errors.test.ts`
  - 新增 `web/src/features/observability/error-reporter.ts`、`error-reporter.test.ts`
  - 修改 `web/src/features/observability/init.ts`、`test-support.ts`（注册 reporter / 提供 in-memory reporter）
- 测试设计种子:
  - 主行为：原生 Error → AppError 带 traceId / cause（fail-first）
  - 关键边界：sentry-stub 在 DSN-set / DSN-absent 两条路径都降级到 noop
  - fail-first 点：reporter 内部 throw 不冒泡到调用方
  - 可测试性 (NFR-005)：通过 `createInMemoryReporter()` 注入；测试结束 `resetObservabilityForTesting()`
- Verify: `cd web && npm run test && npm run typecheck && npm run lint && npm run build`。
- 预期证据: 同 T46 命名规则下的 `T47` 评审 / 验证文件全套。
- 完成条件: 同 T46。

---

### T48. MetricsRegistry + `/api/metrics` Route Handler

- 目标：实现进程内 `MetricsRegistry`（counter / gauge / histogram）+ `web/src/app/api/metrics/route.ts`；满足 disabled→404、unauth→401、ok→200 + JSON schema 不变量。
- Acceptance:
  - `MetricsRegistry.snapshot()` 返回设计 §11.1 `MetricsSnapshot` 形态；初始所有 counter/histogram 字段存在且为 0 / `{count:0}`。
  - 一次成功的业务 hook（如 `business.work_publish.success`）使对应 counter +1；失败 hook +1 到 `.failure`。
  - SQLite 慢查询命中 `OBSERVABILITY_SLOW_QUERY_MS`（默认 100ms）时 `sqlite.slow_queries` +1，且 `sqlite.query_duration_ms` histogram 反映此次查询。
  - `/api/metrics` 在 `OBSERVABILITY_METRICS_ENABLED=false` 时返回 HTTP 404 + `{ error: 'not_found' }`，不暴露能力指纹。
  - `/api/metrics` 在 enabled + 缺/错 token 时返回 HTTP 401，无指标 body。
  - `/api/metrics` 在 enabled + token 正确时返回 HTTP 200 + JSON snapshot。
  - 任何响应都不含 `OBSERVABILITY_METRICS_TOKEN` / 用户邮箱 / 业务实体 id 列表。
- 依赖: `T46`（logger + trace）。
- Ready When: `T46` completion-gate 通过（与 T47 可并行，但本计划默认顺序执行）。
- 初始队列状态: `pending`。
- Selection Priority: 3。
- Files / 触碰工件:
  - 新增 `web/src/features/observability/metrics.ts`、`metrics.test.ts`
  - 新增 `web/src/app/api/metrics/route.ts`、`web/src/app/api/metrics/route.test.ts`
  - 修改 `web/src/features/observability/init.ts`、`test-support.ts`
- 测试设计种子:
  - 主行为：counter / gauge / histogram 行为正确（fail-first）
  - 关键边界：disabled → 404；unauth → 401；ok → 200 三态
  - fail-first 点：snapshot 不含敏感字段；初次启动 snapshot 字段完整为 0
  - 可测试性 (NFR-005)：注入独立 `MetricsRegistry` 实例；不允许跨用例共享全局 registry
- Verify: `cd web && npm run test && npm run typecheck && npm run lint && npm run build`。
- 预期证据: T48 评审 / 验证文件全套。
- 完成条件: 同 T46。

---

### T49. Server Boundary 接入既有 Server Actions / Route Handlers

- 目标：把 `wrapServerAction` / `wrapRouteHandler` 接入现有所有 server action 与 route handler；trace / log / metrics / errors 统一在边界产出；业务行为零变化。
- Acceptance:
  - 设计 §11.2 不变量 I-7 全部满足：wrapper 必须在原 `'use server'` 模块 export 现场调用、`async`、保留 `length / name / this`，且 wrapper 与原 action 同文件 named export，避免 Next 16 server action ID 漂移。
  - 现有所有 vitest 测试（`work-actions.test.ts` / `profile-editor.test.ts` / `follow-action.test.ts` / `comment-actions.test.ts` / `engagement/*.test.ts` / `opportunities/*.test.ts` / `contact/*.test.ts` / `auth/*.test.ts` / `app/api/discovery-events/route.test.ts` 等）继续全绿，不需要修改业务断言。
  - 新增 `server-boundary.test.ts` 集成测试覆盖：成功路径产生 `event=server-action.completed` + business success counter；失败路径产生 `event=server-action.error` + business failure counter + reporter.report 调用 + `wrap` 结果与原行为一致（成功 redirect、失败 throw / 返回 error tuple 与基线一致）。
  - HTTP 失败响应（被 `wrapRouteHandler` 捕获后）body 不含原始栈。
- 依赖: `T46`、`T47`、`T48`（trace / logger / errors / reporter / metrics 全部 ready）。
- Ready When: `T46` `T47` `T48` 三个 completion-gate 全部通过。
- 初始队列状态: `pending`。
- Selection Priority: 4。
- Files / 触碰工件:
  - 修改：所有现有 server action / route handler 文件（详见 §3 修改列表）
  - 新增：`web/src/features/observability/server-boundary.test.ts`（集成层断言）
  - 修改：`web/src/features/observability/server-boundary.ts`（最终形态收口）
- 测试设计种子:
  - 主行为：成功 server action → logger / counter；wrap 不改返回值
  - 关键边界：失败 server action → AppError + reporter + failure counter + 抛出形态保持
  - fail-first 点：I-7 — `wrapServerAction(name, action).length === action.length`、`name === action.name`、async 性质保持
  - 可测试性 (NFR-005)：boundary 集成测试通过 in-memory logger / reporter / metrics 注入；`resetObservabilityForTesting()` 在 `beforeEach` 调用
  - 业务回归：现有 Vitest 全绿
- Verify: `cd web && npm run test && npm run typecheck && npm run lint && npm run build`。
- 预期证据: T49 评审 / 验证文件全套。
- 完成条件: 同 T46。

---

### T50. Env 契约扩展 + `/api/health` 字段扩展

- 目标：在 `web/src/config/env.ts` 中扩展 observability / backup 相关字段；`/api/health` 增加 `observability` 与 `backup` 命名空间；保留所有现有字段格式。
- Acceptance:
  - 默认配置下：`OBSERVABILITY_LOG_LEVEL=info`、`OBSERVABILITY_METRICS_ENABLED=false`、`OBSERVABILITY_SLOW_QUERY_MS=100`、`ERROR_REPORTER_PROVIDER=noop`、`SQLITE_BACKUP_DIR=undefined`。
  - `OBSERVABILITY_METRICS_ENABLED=true` 缺 `OBSERVABILITY_METRICS_TOKEN` → 启动失败 + 明确错误（唯一 hard-stop）。
  - `OBSERVABILITY_LOG_LEVEL=invalid` → 回退 `info` + warn 启动日志。
  - `OBSERVABILITY_SLOW_QUERY_MS` 非正数 / 非整数 → 回退 100 + warn。
  - `SQLITE_BACKUP_DIR` 不存在路径：启动不创建；脚本调用时报错。
  - `/api/health` 旧字段格式 / 状态码不变；新增 `observability.loggerEnabled / metricsEnabled / errorReporter` 与 `backup.ready / lastBackupAt` 命名空间。
  - `/api/health` 不回传 `OBSERVABILITY_METRICS_TOKEN` / `SENTRY_DSN` 任何片段。
- 依赖: `T46`（logger + boundary 已就位，确保启动 warn 日志走结构化 logger）。
- Ready When: `T46` completion-gate 通过。
- 初始队列状态: `pending`。
- Selection Priority: 5（与 T47/T48 可并行，但默认顺序在 T49 之后以避免重写 health 接入）。
- Files / 触碰工件:
  - 修改 `web/src/config/env.ts`、新增 `web/src/config/env.test.ts`（若不存在）或扩展现有
  - 修改 `web/src/app/api/health/route.ts`（扩展字段；保持旧字段）
  - 修改 `web/src/app/api/health/route.test.ts`（新字段断言）
  - 修改 `web/src/features/observability/init.ts`（消费 `ObservabilityConfig`）
- 测试设计种子:
  - 主行为：默认 + 自定义 env 解析正确（fail-first）
  - 关键边界：metrics enabled 缺 token → throw；其他非法 env → 降级 + warn
  - fail-first 点：health 响应中绝不含 token / DSN 子串
- Verify: `cd web && npm run test && npm run typecheck && npm run lint && npm run build`。
- 预期证据: T50 评审 / 验证文件全套。
- 完成条件: 同 T46。

---

### T51. SQLite Backup / Restore CLI + Health Backup 字段联动

- 目标：实现 `web/scripts/backup-sqlite.mjs` 与 `web/scripts/restore-sqlite.mjs`；主路径用模块级 `sqlite.backup`，fallback `wal_checkpoint + copyFile`；`/api/health.backup` 字段反映最近备份。
- Acceptance:
  - `backup-sqlite.mjs` 在 `SQLITE_BACKUP_DIR` 已配置且目录存在时，产出形如 `community-YYYYMMDDHHmmss.sqlite` 副本，可被 `node:sqlite` 重新打开。
  - 备份运行期间，对 `/api/health` 1Hz 顺序探测，每秒至少 1 次 200 + RTT P95 ≤ 2s（验收探测协议；本任务在 vitest 集成或 `node` 临时实例下做最小等价模拟）。
  - `restore-sqlite.mjs <file>` 在停服状态下原子替换 `community.sqlite`，并写一条 `event=sqlite.restore.completed` 日志。
  - `SQLITE_BACKUP_DIR` 缺失或路径不存在时，CLI 退出码非零并打印明确错误。
  - 模块级 `sqlite.backup` 不可用时（`typeof require('node:sqlite').backup !== 'function'`），fallback 路径触发并写 `event=sqlite.backup.fallback reason=module-backup-unavailable`。
  - `/api/health` 在 `SQLITE_BACKUP_DIR` 配置 + 有备份文件时返回 `backup.ready=true` + `backup.lastBackupAt` 为最近文件 mtime ISO8601；`backup.lastBackupAt` 字段为 best-effort（带 5s 短缓存，避免 1Hz 探测期间反复 readdir）。
- 依赖: `T46`（logger 用于结构化日志）+ `T50`（env 契约 + `/api/health.backup` 字段框架）。
- Ready When: `T50` completion-gate 通过。
- 初始队列状态: `pending`。
- Selection Priority: 6（最后任务）。
- Files / 触碰工件:
  - 新增 `web/scripts/backup-sqlite.mjs`、`web/scripts/restore-sqlite.mjs`
  - 新增 `web/scripts/__tests__/backup-restore.test.mjs`（或就近 vitest）
  - 修改 `web/src/app/api/health/route.ts`（实现 backup 字段计算）
  - 修改 `web/src/app/api/health/route.test.ts`（覆盖 `backup.ready` / `lastBackupAt` 两条路径）
- 测试设计种子:
  - 主行为：backup 产出合法副本；restore 后 db 可启动（fail-first）
  - 关键边界：`SQLITE_BACKUP_DIR` 缺失 / 路径不存在 → 非零退出
  - fail-first 点：`typeof sqlite.backup !== 'function'` 自检触发 fallback 分支并 log；`/api/health` 5s 短缓存生效（连续 readdir 不超过 1 次）
- Verify: `cd web && npm run test && npm run typecheck && npm run lint && npm run build`；外加 `node web/scripts/backup-sqlite.mjs` + `node web/scripts/restore-sqlite.mjs <file>` 在临时目录的端到端实测（记入 `docs/verification/implementation-T51.md`）。
- 预期证据: T51 评审 / 验证文件全套。
- 完成条件: 同 T46。

## 6. 依赖与关键路径

```
T46 (Walking Skeleton)
 ├── T47 (Errors + Reporter)
 ├── T48 (Metrics + /api/metrics)
 │    └── T49 (Boundary 接入)（也依赖 T47）
 └── T50 (Env + /api/health 扩展)
       └── T51 (Backup/Restore CLI + health backup 字段)
```

关键路径（图论依赖）：`T46 → T47 → T49`、`T46 → T48 → T49`、`T46 → T50 → T51`。即 `T49` 严格依赖 `{T46, T47, T48}`；`T51` 严格依赖 `{T46, T50}`；其余节点之间不存在硬依赖。

`Selection Priority` 仅用于在多个 `ready` 候选中决定 `Current Active Task`（详见 §8 选择规则），不构成额外硬性串行约束：

- 当 `T46` completion-gate 通过后，`T47 / T48 / T50` 同时进入 `ready`；按 Selection Priority 升序，默认下一活跃任务为 `T47`。
- `T49` 仅在 `T46 / T47 / T48` 均 completion-gate 通过后进入 `ready`。
- `T51` 仅在 `T46 / T50` 均 completion-gate 通过后进入 `ready`。

本计划默认选 `T47 → T48 → T49 → T50 → T51` 顺序推进，是为了让 reviewer 在 cold-read 时看到一条线性叙事；并不禁止 router 在并发授权下让 `T48 / T50` 与 `T47` 并行（实际由父会话编排策略决定）。

## 7. 完成定义与验证策略

### 任务级
- fail-first 测试 → 红 → 实现 → 绿
- `cd web && npm run test && npm run typecheck && npm run lint && npm run build` 全部 exit 0
- 评审链：`hf-bug-patterns → hf-test-review → hf-code-review → hf-traceability-review → hf-regression-gate（任务级 sanity） → hf-completion-gate`
- 评审记录与验证证据落到 `docs/reviews/*-T<id>.md` 与 `docs/verification/*-T<id>.md`

### Increment 级（T46 ~ T51 全部完成后）
- `hf-regression-gate`：执行 NFR-001 性能基线对比（设计 §13.3 协议）；记录到 `docs/verification/regression-gate-phase2-observability-ops-v1.md`
- `hf-completion-gate`：聚合所有任务完成证据 + Increment 级 NFR / CON 闭合声明
- `hf-finalize`：更新 `RELEASE_NOTES.md`、`docs/ROADMAP.md`（§3.8 标记已交付 V1）、`task-progress.md`

## 8. 当前活跃任务选择规则

- 默认按 §6 拓扑顺序选择第一个 `ready` 任务作为 `Current Active Task`。
- 当某个任务 completion-gate 通过：
  1. 把该任务移到 `Completed Tasks`，清空 `Current Active Task`
  2. 重新扫描所有 `pending` 任务的依赖；将依赖全部 `Completed` 的任务标记为 `ready`
  3. 在 `ready` 任务集合中按 `Selection Priority` 升序选第一个作为新 `Current Active Task`
  4. 如果 `ready` 集合为空且无 `pending` → 进入 `hf-regression-gate`（Increment 级）
- 若 ready 集合包含多个候选，由 `hf-workflow-router` 按 `Selection Priority` 与依赖图权威决定；不在 `hf-test-driven-dev` 内自行选择。

## 9. 任务队列投影视图

| Task | Status | Depends On | Priority | Acceptance Headline |
| --- | --- | --- | --- | --- |
| T46 | ready | — | 1 | trace + logger + boundary walking skeleton（/api/health x-trace-id） |
| T47 | pending | T46 | 2 | AppError + normalize + ErrorReporter（noop / console / sentry-stub 全降级） |
| T48 | pending | T46 | 3 | MetricsRegistry + /api/metrics（disabled 404 / unauth 401 / ok 200） |
| T49 | pending | T46, T47, T48 | 4 | wrapServerAction / wrapRouteHandler 接入既有 boundary，业务零回归 |
| T50 | pending | T46 | 5 | env 契约扩展 + /api/health observability/backup 命名空间 |
| T51 | pending | T46, T50 | 6 | sqlite.backup / restore CLI + /api/health.backup 字段联动 |

## 10. 风险与顺序说明

- **R-1（最高）**：T49 接入既有 server action 时若打穿 Next 16 server action ID（违反不变量 I-7）会导致整个 form 提交链路 500。缓解：T49 之前 T46/T47/T48 把所有 primitive 单测覆盖；T49 实现时新增专门的 server action ID 不变测试（在 wrapper unit test 里通过 `function.name` / `function.length` 断言）；逐文件迁移 + 单跑该文件 vitest，发现回归立即修。
- **R-2**：T51 fallback 路径在本仓库 Node 22.22.2 上不会被触发（`sqlite.backup` 实测可用）。但若部署到边缘 patch 版本仍可能命中。缓解：T51 测试用例显式 mock `require('node:sqlite').backup` 缺失场景，覆盖 fallback 行为，避免 fallback 路径"理论存在但从未跑过"。
- **R-3**：T50 启动 hard-stop（缺 token）必须明确不影响**测试环境**启动。缓解：env loader 通过 `nodeEnv === 'test'` 短路允许测试时 `OBSERVABILITY_METRICS_ENABLED=true` + token 缺失（保留 hard-stop 仅生产 / dev 启动），并在测试中显式覆盖。
- **R-4**：T49 改动文件多，code-review 容易遗漏；建议 T49 切分 PR 内子提交（每个 server action 模块一个子提交），便于 reviewer 逐文件 cold-read。
- **R-5**：NFR-001 的 P95 ≤ 5ms 净增需在 `hf-regression-gate` 验证；若实际超出，不要回头降级 logger 实现，而是**先**评估是否能通过减少 metrics labels / logger field 数量收口；若仍无法满足，回 `hf-design` 调整 ADR-3。
