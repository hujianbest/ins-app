# Phase 2 — Observability & Ops V1 需求规格说明

- 状态: 草稿
- 主题: Phase 2 — Observability & Ops V1（可观测性与运维 V1）
- 输入来源: `docs/ROADMAP.md` §3.8、§4 优先级 1；`docs/reviews/increment-phase2-observability-ops-v1.md`
- Execution Mode 偏好: `auto`

## 1. 背景与问题陈述

Lens Archive 已经在 `2026-04-10` 完成 `Hybrid Platform Relaunch` 阶段 1 与 `Lens Archive Discovery Quality` 增量，整体定位收敛为「高匹配发现」的可云端部署的产品基线。但当前主线在迈向阶段 2 之前，仍存在三类清晰且阻塞性的可观测 / 运维短板：

- 运行时几乎只能用 `console.log`、临时 `try/catch + console.error` 与浏览器 DevTools 调试线上事件；服务器端没有结构化日志、没有 trace id 串联、也没有统一错误对象，导致一次合作联系或外链跳转失败几乎无法在不重现现场的前提下复盘。
- 对发现 / 关注 / 评论 / 联系 / 外链跳转等关键业务事件，已经记录到 `discovery_events` 表，但**对系统级健康（HTTP 失败率、SQLite 慢查询、错误数量、关键 server action 流失率）没有任何聚合视图**；用户提交工单或上线后冒烟出现回归时，团队没有"先看一下指标"的入口。
- 数据持久化仍以单实例 SQLite 为基线，但当前仓库**没有任何脚本化备份与受控恢复路径**：哪怕只丢失一次 `web/.data/community.sqlite`，也意味着所有创作者主页与作品的真实状态丢失；阶段 2 后续的运营后台、消息中心、合作履约链路在此基础上推进，是不能容忍的。

本轮要解决的，不是引入完整 SaaS 级可观测性平台，也不是替换现有持久化方案，而是把当前这条「线上事故只能凭印象排查」的灰色地带收口为：**结构化、可查询、可恢复**的最小运维基线，使得阶段 2 后续主题（运营后台、消息中心、支付、推荐、搜索升级）可以在「可调试 + 可恢复」的前提下持续推进，而不必每次都先回头补这块。

## 2. 目标与成功标准

### 2.1 总体目标

- 让任何 server-side 请求 / server action / route handler / 后台脚本的执行链路都可以通过统一 trace id 串联起来，不再依赖人脑对照时间戳。
- 在不引入第三方平台依赖的前提下，把最关键的 HTTP / 错误 / SQLite / 关键业务动作指标聚合在内部可读的 `/api/metrics` 出口上，供运维人员或自动化健康检查消费。
- 让现有的所有 server-side 错误进入统一错误对象与统一上报通道（默认本地 `noop` 实现，可在不改业务代码的前提下未来切到外部 reporter）。
- 让单实例 SQLite 数据库具备**可脚本执行的冷备份与恢复**能力，并通过扩展后的 `/api/health` 公开备份就绪性，以便在事故恢复时快速判断"有没有可用的近期备份"。

### 2.2 成功标准

- 运维人员或开发者在拿到一条带 trace id 的请求 ID（来自浏览器响应头或日志）后，可以**唯一定位**这条请求触发的所有 server log、错误对象与命中的 server action，而无需扫日志按时间窗推断。
- 当生产 / staging 出现一次失败 server action 或一次返回 5xx 的 route handler，结构化日志中至少包含：trace id、操作名、用户角色（若有）、错误码 / 错误消息、关键业务键（如 `workId`、`creatorId`）。
- 调用 `GET /api/metrics`（带授权 token 时）返回当前进程内的最小聚合指标，至少覆盖：HTTP 入口请求数 / 错误数 / P95 处理时延、SQLite 查询数 / 错误数 / 慢查询数、`work_publish` / `follow` / `comment_create` / `contact_start` / `external_handoff_click` 五类业务动作计数。
- 当未配置错误上报后端时（默认 `noop` provider），不上报任何外部请求，但本地结构化日志仍记录该错误；当切到非 `noop` provider 时，所有 server-side 抛出的统一错误对象都能被同一函数收口上报。
- 运行 `web/scripts/backup-sqlite.mjs` 后，`SQLITE_BACKUP_DIR` 中产出可独立恢复的 `.sqlite` 文件，并被 `/api/health` 的 `backupReady` / `lastBackupAt` 字段反映；运行 `restore-sqlite.mjs <file>` 在停服状态下能从该备份恢复出可启动的应用实例。
- 现有公开页 / studio 工作台所有用户可见行为**不发生回归**：单元 / 组件 / 端到端测试在本增量结束时全部继续通过，且无新的视觉差异。

## 3. 用户角色与关键场景

### 3.1 主要角色

- 运维 / 值班开发者：在线上或 staging 出现疑似故障时，需要先快速判断「是不是真的坏了、坏了多严重、坏在哪条请求」。
- 平台运营开发者：上线一个新增量（例如运营后台 V1 或消息中心 V1）后，需要观察关键业务动作的指标在上线前后是否退化。
- 数据持有者 / 项目负责人：在迁移、升级或线上事故场景下，需要随时知道「现在最近一次可用的备份是什么时候、能不能恢复」。

### 3.2 次要角色（暂不直接消费但行为受影响）

- 创作者 / 访客 / 模特：他们的可见行为和现状一致，**不应感知**到本增量带来的差异；但所有他们触发的关键写动作背后都会产生结构化日志与指标。

### 3.3 关键场景

- 一名访客点击「联系创作者」后页面提示失败，运维拿到响应头里的 trace id，应能在结构化日志中精确定位到该请求经过的所有 server-side 步骤、最终错误对象与栈信息。
- 一次发布主线增量后，运营开发者拉取 `/api/metrics` 的快照，对比 30 分钟前的快照，应能判断 `work_publish` 与 `comment_create` 的成功率与时延是否有显著退化。
- 物理机意外重启 / 文件系统异常导致 `community.sqlite` 损坏后，值班开发者应能在不超过一次脚本调用的成本下，从 `SQLITE_BACKUP_DIR` 最近一次备份恢复，并通过 `/api/health` 验证应用恢复运行。
- 在 `ERROR_REPORTER_PROVIDER=noop`（默认）的开发环境中，开发者抛出错误时不会触发任何外部请求，但仍能在终端看到结构化错误日志；当切换到非 `noop` provider 时，无需修改业务代码即可让上报生效。

## 4. 当前轮范围与关键边界

本轮**只做**以下能力：

- 统一 trace id（请求级别），server log 与错误对象均带 trace id。
- 结构化 server logger（JSON 输出在生产模式；可读输出在 `dev` 模式），最小字段集：`timestamp`、`level`、`traceId`、`event`、`module`、`durationMs`（可选）、`error`（可选）、`context`（受控键值集合）。
- 统一 `AppError` 对象与 server action / route handler 错误归一化函数：把内部抛出归一化为 `{ code, message, status, traceId, cause? }`。
- 错误上报抽象 `ErrorReporter`：`noop` 与 `console`（仅开发使用）两类内置 provider；`sentry` provider 在 V1 仅保留接口与 env 字段，**默认不打包真实 SDK**，避免引入未配置的运行时依赖（详见 §10 假设）。
- 内部指标记录器 `MetricsRegistry`：counter / gauge / histogram 三种最小指标类型；预置 HTTP、SQLite、五类业务动作的注册项。
- 内部 `GET /api/metrics`：仅在 `OBSERVABILITY_METRICS_ENABLED=true` 时启用；默认要求请求头 `Authorization: Bearer <OBSERVABILITY_METRICS_TOKEN>`；输出格式为 JSON（V1 不做 Prometheus 文本格式）。
- 备份 / 恢复脚本：`web/scripts/backup-sqlite.mjs`（基于 `node:sqlite` 的在线备份 API 或文件 copy + WAL checkpoint，需在设计阶段定结论）与 `web/scripts/restore-sqlite.mjs`；脚本在 `SQLITE_BACKUP_DIR` 不存在时拒绝运行而不是静默成功。
- `GET /api/health` 扩展字段：`backup.ready`、`backup.lastBackupAt`、`observability.loggerEnabled`、`observability.metricsEnabled`、`observability.errorReporter`；保留所有现有字段格式。
- `web/src/config/env.ts` 扩展字段（详见 §6 FR-006）。

## 5. 范围外内容

明确**不在**本增量做：

- 不替换或外挂任何托管 SQL、对象存储或外部消息 / 队列服务（保留 `node:sqlite`，对应 ROADMAP §3.1，列入 deferred backlog）。
- 不接入真实 Sentry SDK 与外部 APM 平台；只保留接口与 env 字段。
- 不在用户可见 UI 上展示 trace id、错误码或运维信息（trace id 仅出现在响应头与结构化日志，不出现在面向终端用户的渲染文案）。
- 不引入 dashboard / Grafana / Prometheus 服务端；`/api/metrics` 只输出当前进程内的内存聚合，重启后清零。
- 不做请求采样 / 限流 / 防火墙 / WAF。
- 不做合规 / 审计日志（与 §3.2 运营后台 V1 一起在后续增量做）。
- 不重构现有 server actions 的业务逻辑；只在边界处接入 logger / metrics / 错误归一化。

## 6. 功能需求

### FR-001 请求级 Trace ID
#### 需求说明
系统应为每一个 server-side 请求（route handler、server action、Next.js middleware 入口）生成或继承一个唯一 trace id，并在响应 `x-trace-id` 头部回写；trace id 应在该请求生命周期内对所有结构化日志、错误对象、metrics tag 可见。

#### 验收标准
- Given 一个外部 HTTP 请求到达任意 route handler，When 服务端处理完成并返回响应，Then 响应头包含 `x-trace-id`，其值为非空字符串且与该请求生命周期内的所有结构化日志中的 `traceId` 字段一致。
- Given 一个 server action 在请求生命周期内被触发，When 该 server action 抛出异常并被错误归一化函数捕获，Then 归一化后的 `AppError` 对象 `traceId` 字段与触发该请求的 trace id 一致。
- Given 一个上游请求带有 `x-trace-id` 请求头，When 服务端开始处理，Then 系统优先继承上游 trace id 而不是生成新的（仅当其符合 trace id 字符集与长度约束时才继承，否则重新生成并在 log 中标注 `traceIdSource=regenerated`）。

#### Priority
Must

#### Source / Trace Anchor
ROADMAP §3.8「结构化日志：以 trace id 串联请求」；本增量记录 §变更包/New。

---

### FR-002 结构化 Server Logger
#### 需求说明
系统应提供唯一的 server-side `logger` 入口；所有 server-side 边界（route handler、server action、repository、scripts）应通过该 logger 输出日志，而不是直接调用 `console.log`；输出在生产模式为单行 JSON，在 `dev` 模式为可读文本。

#### 验收标准
- Given 当前 `OBSERVABILITY_LOG_LEVEL=info`，When 任意 route handler 完成处理，Then 应至少产生一条 `event=http.request.completed` 的 JSON 日志，包含 `traceId`、`method`、`path`、`status`、`durationMs` 字段。
- Given 当前 `NODE_ENV=production`，When logger 输出任意一条日志，Then 该输出为单行合法 JSON，不包含 ANSI 颜色码或多行 stack 字符串（stack 应作为字符串字段写入 `error.stack`）。
- Given 当前 `OBSERVABILITY_LOG_LEVEL=warn`，When 业务代码尝试以 `info` 级别输出日志，Then 该日志不应被打印；以 `warn`/`error` 级别输出仍应正常打印。
- Given 业务代码调用 `logger.info` 时传入了不在受控键集合中的字段（如随机用户输入的对象），When logger 序列化该日志，Then 系统应丢弃 / 截断超出受控键集合的内容，且整体 log 体积不超过 8 KiB。

#### Priority
Must

#### Source / Trace Anchor
ROADMAP §3.8「结构化日志」；增量记录 §变更包/New。

---

### FR-003 统一错误对象与归一化函数
#### 需求说明
系统应提供唯一的 `AppError` 错误类型与错误归一化函数，在 server action 与 route handler 的边界统一捕获、归一化、记录与上报内部异常；归一化后的错误对外不泄露内部实现细节。

#### 验收标准
- Given 一个 server action 内部抛出原生 `Error`，When 错误归一化函数捕获该错误，Then 返回值应为 `AppError` 实例，包含 `code`（默认 `internal_error`）、`message`（默认对外文案，不含栈）、`status`（默认 `500`）、`traceId` 字段，并将原始错误存于 `cause` 字段。
- Given 一个 server action 抛出已经构造好的 `AppError({ code: 'forbidden', status: 403 })`，When 错误归一化函数处理该错误，Then 返回值保持 `code='forbidden'`、`status=403`，且对应一条 `event=server-action.error` 的 warn 级别结构化日志。
- Given 一个 route handler 被错误归一化函数包装，When 内部抛出错误，Then 返回的 HTTP 响应 body 不应包含原始错误栈或内部文件路径，仅包含 `{ error: { code, message, traceId } }` 字段；响应状态码与 `AppError.status` 一致。
- Given 任意 server-side 错误被归一化，When 归一化函数完成处理，Then 它必须调用一次 `errorReporter.report(error)`，无论当前 reporter 是否为 `noop`。

#### Priority
Must

#### Source / Trace Anchor
ROADMAP §3.8「错误上报」；增量记录 §变更包/New + Modified（迁移旧 `try/catch + console.error` 写法）。

---

### FR-004 Error Reporter 抽象
#### 需求说明
系统应定义统一的 `ErrorReporter` 接口，并内置 `noop`（默认）与 `console`（仅 `dev` 推荐）provider；`sentry` provider 在 V1 仅作为接口占位，需要在 `SENTRY_DSN` 缺省或 SDK 未安装时**安全降级到 `noop`**，绝不报错或阻塞启动。

#### 验收标准
- Given `ERROR_REPORTER_PROVIDER` 未设置，When 系统启动并初始化 reporter，Then 实际 provider 应为 `noop`；调用 `report` 不发起任何网络请求，但在 `dev` 模式仍打印结构化错误日志。
- Given `ERROR_REPORTER_PROVIDER=sentry` 但 `SENTRY_DSN` 缺省，When 系统初始化 reporter，Then 系统应记录一条 `warn` 日志说明降级原因，并使用 `noop` provider，不抛出启动错误。
- Given `ERROR_REPORTER_PROVIDER=console`，When `report` 被调用，Then 错误对象至少在终端 stderr 输出 `code`、`message`、`traceId`、`stack` 四个字段。
- Given 任意 provider，When 多次并发调用 `report`，Then 不会因为 reporter 内部状态错误而吞掉后续错误（reporter 内部异常应被本身吞掉而不是冒泡到调用方）。

#### Priority
Must

#### Source / Trace Anchor
ROADMAP §3.8「错误上报：接入 Sentry 或同类」；增量记录 §变更包/New。

---

### FR-005 Metrics Registry 与内部出口
#### 需求说明
系统应提供进程内的指标注册器，预置最小覆盖项；并通过 `GET /api/metrics` 输出当前进程内聚合的快照。出口是受控的运维入口，不对外暴露。

#### 验收标准
- Given `OBSERVABILITY_METRICS_ENABLED=true` 且请求带正确的 `Authorization: Bearer <OBSERVABILITY_METRICS_TOKEN>`，When 请求 `GET /api/metrics`，Then 响应为 HTTP 200，body 为 JSON 且至少包含 `http`、`sqlite`、`business` 三大命名空间下的预置指标键。
- Given `OBSERVABILITY_METRICS_ENABLED=false`，When 请求 `/api/metrics`，Then 响应为 HTTP 404（不暴露能力存在）。
- Given `OBSERVABILITY_METRICS_ENABLED=true` 但 `Authorization` 头缺失或与 `OBSERVABILITY_METRICS_TOKEN` 不一致，When 请求 `/api/metrics`，Then 响应为 HTTP 401，且不带任何指标内容。
- Given 系统刚启动且尚未处理任何请求，When 请求 `/api/metrics`，Then 各计数器返回 0，histogram 返回 `{ count: 0 }`，不返回 `null` 或缺失字段。
- Given 一次成功的 `work_publish` server action 完成，When 后续请求 `/api/metrics`，Then `business.work_publish.success` 计数器递增 1；若同一 server action 执行失败，则递增 `business.work_publish.failure`。
- Given SQLite 一次查询超过 `OBSERVABILITY_SLOW_QUERY_MS`（默认 100ms），When 后续请求 `/api/metrics`，Then `sqlite.slow_queries` 计数器递增 1，且 `sqlite.query_duration_ms` histogram 的 P95 值反映此次查询。

#### Priority
Must

#### Source / Trace Anchor
ROADMAP §3.8「指标：HTTP / DB / 队列基础指标 + 业务指标」；增量记录 §变更包/New。

---

### FR-006 环境变量契约扩展
#### 需求说明
系统应在 `web/src/config/env.ts` 中显式声明本增量引入的 env 字段，提供类型校验与默认值；env 字段缺省时不应阻塞启动，但应有可读的降级行为。

#### 验收标准
- Given 默认配置（无新增 env 字段），When 系统启动，Then 实际行为：`OBSERVABILITY_LOG_LEVEL=info`、`OBSERVABILITY_METRICS_ENABLED=false`、`ERROR_REPORTER_PROVIDER=noop`、`SQLITE_BACKUP_DIR` 未设置（备份脚本拒绝运行，`/api/health.backup.ready=false`）。
- Given 配置 `OBSERVABILITY_METRICS_ENABLED=true` 但未设置 `OBSERVABILITY_METRICS_TOKEN`，When 系统启动，Then 启动应失败并给出明确错误说明（避免裸暴露内部出口）；这是唯一允许"硬性中止启动"的错误。
- Given 配置 `OBSERVABILITY_LOG_LEVEL=invalid`，When 系统启动，Then 系统应回退到 `info`，并产生一条 `warn` 级别启动日志说明降级原因，不抛出启动错误。
- Given 配置 `SQLITE_BACKUP_DIR=/some/path`，When 启动时该路径不存在，Then 系统不应自动创建该目录；脚本调用时若路径仍不存在，应明确报错而不是静默成功。

#### Priority
Must

#### Source / Trace Anchor
本增量记录 §变更包/New + Modified。

---

### FR-007 SQLite 备份与恢复脚本
#### 需求说明
系统应提供 `web/scripts/backup-sqlite.mjs` 与 `web/scripts/restore-sqlite.mjs` 两个独立可执行脚本，覆盖单实例 SQLite 的冷 / 在线备份与受控恢复路径；同时不破坏当前运行实例。

#### 验收标准
- Given `SQLITE_BACKUP_DIR=./.backups` 已配置且目录存在，When 调用 `backup-sqlite.mjs`，Then 在该目录下应产出形如 `community-YYYYMMDDHHmmss.sqlite` 的副本，且使用 `node:sqlite` 重新打开该副本时应能正常读取所有现有表结构。
- Given 当前应用实例正在写入 `community.sqlite`，When 备份脚本运行，Then 不应阻塞 / 锁死正在运行的实例（必要时使用在线备份 API 或 WAL checkpoint，由设计阶段定结论；本验收只校验"不会阻塞实例正常请求超过 2 秒"）。
- Given 调用 `restore-sqlite.mjs ./.backups/community-20260419120000.sqlite`，When 当前 `community.sqlite` 已停止写入，Then 脚本应原子地用备份内容替换当前数据库文件，并产生一条 `event=sqlite.restore.completed` 的结构化日志。
- Given `SQLITE_BACKUP_DIR` 未配置或路径不存在，When 调用任一脚本，Then 脚本应以非零退出码失败，并打印明确错误说明，**不应**误以"已备份"退出 0。

#### Priority
Must

#### Source / Trace Anchor
ROADMAP §3.8「备份与恢复演练：定期自动化执行并产出报告」；增量记录 §变更包/New。

---

### FR-008 `/api/health` 字段扩展
#### 需求说明
系统应在保持 `/api/health` 已有字段格式不变的前提下，新增可观测性与备份就绪性字段；扩展字段对未启用相关能力的环境保持向后兼容。

#### 验收标准
- Given 当前未配置任何本增量 env 字段，When 请求 `GET /api/health`，Then 响应仍为 HTTP 200，原有字段（数据库提供方、库路径、可用性）格式不变；新增字段 `observability.loggerEnabled=true`、`observability.metricsEnabled=false`、`observability.errorReporter='noop'`、`backup.ready=false`、`backup.lastBackupAt=null`。
- Given `SQLITE_BACKUP_DIR` 已配置且目录存在最新备份文件，When 请求 `/api/health`，Then `backup.ready=true`、`backup.lastBackupAt` 为该最新备份文件 mtime 的 ISO8601 字符串。
- Given `OBSERVABILITY_METRICS_ENABLED=true`，When 请求 `/api/health`，Then `observability.metricsEnabled=true`，但响应中**不**回传 `OBSERVABILITY_METRICS_TOKEN` 任何片段。

#### Priority
Should

#### Source / Trace Anchor
本增量记录 §变更包/Modified。

---

### FR-009 关键 Server Boundary 接入
#### 需求说明
现有的所有 server action 与 route handler 应在边界处接入统一 logger、错误归一化与 metrics；不修改业务行为本身，但确保事件可被观察。

#### 验收标准
- Given 所有现有 server action（包括 `profile-actions`、`work-actions`、`comment-actions`、`follow-action`、`engagement` 系列、`opportunities`、`contact`、`community/work-editor`、`community/profile-editor`），When 任意一次成功执行完成，Then 至少产生一条 `event=server-action.completed` 的结构化日志，并对应业务命名空间内的成功计数器递增 1。
- Given 同一组 server action，When 任意一次抛出错误，Then 经错误归一化函数后应至少：（a）产生一条 `event=server-action.error` warn 级别日志，包含 `actionName`、`code`、`traceId`；（b）调用 `errorReporter.report`；（c）对应业务命名空间失败计数器递增 1。
- Given 现有 `/api/discovery-events` 与所有现有 route handler，When 处理任一请求，Then 至少产生 `event=http.request.completed` 一条日志，并使 `http.requests_total` 与 `http.request_duration_ms` 指标更新。
- Given 任意已接入 boundary 的 server action / route handler，When 它执行成功，Then 用户可见的业务结果（response body、redirect、UI 渲染）应与本增量前完全一致（无业务回归）。

#### Priority
Must

#### Source / Trace Anchor
ROADMAP §3.8「结构化日志 + 指标」；增量记录 §变更包/Modified。

## 7. 非功能需求

### NFR-001 性能开销上限
#### 需求说明
本增量带来的可观测性开销应在生产模式下保持可忽略：单请求总开销（trace id 生成 + logger 调用 + metrics 更新）在 P95 量级不超过 5ms 净增。

#### 验收标准
- Given `NODE_ENV=production`、`OBSERVABILITY_LOG_LEVEL=info`、`OBSERVABILITY_METRICS_ENABLED=true`，When 通过简单基准（例如对 `/api/health` 顺序 1000 次调用）测试本增量前后 P95 时延差，Then 该差值不超过 5ms（验收以本地基准为准，不要求与生产复现严格一致）。

#### Priority
Should

---

### NFR-002 不引入新外部运行时依赖
#### 需求说明
本增量在 V1 不允许引入未在 `web/package.json` 中已存在的运行时 npm 依赖；可使用 Node.js 内置模块（`crypto`、`node:fs/promises`、`node:sqlite`、`node:perf_hooks` 等）。

#### 验收标准
- Given 本增量结束时，When 检查 `web/package.json` 的 `dependencies` 字段，Then 与 `master` 基线相比应**没有**新增运行时依赖；`devDependencies` 允许按需新增（仅用于测试 / 类型）。

#### Priority
Must

---

### NFR-003 安全边界
#### 需求说明
trace id、错误对象、metrics 出口都不得泄露用户隐私或会话凭据；`/api/metrics` 要求授权后访问。

#### 验收标准
- Given 任意 server action 错误日志，When 检查输出，Then 不应包含 `password`、`session_cookie_value`、`SESSION_COOKIE_SECRET`、`SENTRY_DSN`、`OBSERVABILITY_METRICS_TOKEN` 任意一项的明文。
- Given 任意 metrics 输出，When 检查输出，Then 不应包含具体用户邮箱、用户 id 集合或合作诉求正文等业务敏感字段；只允许聚合维度（计数 / 直方图）。

#### Priority
Must

---

### NFR-004 启动鲁棒性
#### 需求说明
任何可观测性或备份相关 env 字段错误配置（除 §FR-006 明确允许的硬性中止外）都不应阻塞应用启动。

#### 验收标准
- Given `OBSERVABILITY_LOG_LEVEL`、`ERROR_REPORTER_PROVIDER` 等字段被错误配置，When 启动 `next start`，Then 应用应正常启动，并记录一条 `warn` 级别启动日志说明降级原因。

#### Priority
Must

---

### NFR-005 可测试性
#### 需求说明
logger / errorReporter / metricsRegistry 必须支持在 Vitest 中被注入与读取，便于断言可观测行为；不允许业务测试因为接入观测被迫做大量 mock。

#### 验收标准
- Given 在 Vitest 测试中调用任意接入观测的 server action，When 测试结束并断言 metricsRegistry 内某个计数器值 / logger 收到的事件，Then 应能不依赖真实 HTTP / 真实文件系统完成断言（允许 in-memory test reporter / test logger）。

#### Priority
Should

## 8. 外部接口与依赖

- `IFR-001` `/api/metrics` HTTP 接口：方法 `GET`，需要 `Authorization: Bearer` 头，输出 JSON；与现有 `/api/discovery-events` `/api/health` 共用 Next.js App Router route handler 体系。
- `IFR-002` `/api/health` 扩展字段：保留现有字段，扩展 `observability` 与 `backup` 命名空间。
- `IFR-003` `web/scripts/backup-sqlite.mjs` / `web/scripts/restore-sqlite.mjs`：作为独立 CLI 入口，由运维人员手动或 cron 调用；CLI 自身使用相同 logger 与错误归一化。

## 9. 约束与兼容性要求

- `CON-001` 不引入新的运行时 npm 依赖（见 NFR-002）；只允许 Node.js 22+ 内置模块。
- `CON-002` `/api/metrics` 在 `OBSERVABILITY_METRICS_ENABLED=false` 时必须**完全不存在**（HTTP 404），不允许返回 401；以避免向外暴露能力指纹。
- `CON-003` 现有数据库 schema 不允许在本增量中变更（与持久化迁移分离，留给后续 §3.1 增量）。
- `CON-004` 现有 UI 与 server action 的对外行为契约不允许在本增量中变更；只允许在边界处增加横切能力。
- `CON-005` 所有结构化日志必须可被 `JSON.parse` 解析（生产模式）；`dev` 模式可以是可读文本。

## 10. 假设与失效影响

- `ASM-001` 假设 V1 不接入真实 Sentry SDK 即可满足"为后续增量提供错误上报抽象"的目标；若用户后续要求 V1 即接入 Sentry，则需重新进入 `hf-increment` 扩展范围。
- `ASM-002` 假设 `node:sqlite` 内置模块的备份能力（Online Backup API 或 `serialize` + WAL checkpoint）足以覆盖单实例冷备份场景；若该假设在设计阶段被推翻，需要回到 hf-design 阶段重新选定备份策略，但**不**应回到 hf-specify。
- `ASM-003` 假设单进程内的 metrics 聚合（重启清零）足以满足"上线前后回归对比"的最小诉求；若用户后续要求跨进程 / 跨重启持久化指标，则需进入新的增量。
- `ASM-004` 假设当前所有 server action / route handler 都可以在边界统一接入 logger 与 metrics 而无需重写业务逻辑；若发现某个 boundary 强耦合 logger 调用、必须重构，则该项以最小重构推进，并在该任务的 bug-patterns / code-review 中记录。

## 11. 开放问题

### 阻塞性
- 无（所有阻塞问题已通过 §4 范围 / §10 假设关闭）。

### 非阻塞
- 是否在 V1 内提供 cron / docker-compose 中调用备份脚本的样例：当前倾向于"提供脚本但不自动调度"，由后续运营后台增量决定。
- `/api/metrics` 输出是否需要在 V2 切到 Prometheus 文本格式：留待后续增量评估。
- 是否需要把 `/api/metrics` 与 `/api/health` 的访问审计也写入结构化日志：当前默认写，按 FR-009 覆盖。

## 12. 术语与定义

- **Trace ID**：单次请求生命周期内的唯一标识；由 server-side 生成（或受控继承）并贯穿日志 / 错误对象 / metrics tag。
- **AppError**：本增量定义的统一错误类型，承载 `code / message / status / traceId / cause`。
- **Reporter**：错误上报抽象；V1 内置 `noop` / `console`，预留 `sentry`。
- **MetricsRegistry**：进程内指标注册表；提供 counter / gauge / histogram 三种最小指标。
- **Boundary**：server action 与 route handler 的入口/出口；本增量只在 boundary 接入横切能力，不动业务核心。
- **冷备份 / 在线备份**：分别指应用停服后文件级 copy 与应用运行中通过 SQLite Online Backup API 产出一致快照；本增量在设计阶段决定具体路径。
