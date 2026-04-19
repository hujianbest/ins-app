# Increment: Phase 2 — Observability & Ops V1

- Date: `2026-04-19`
- Theme: Phase 2 — Observability & Ops V1（可观测性与运维 V1）
- Source of truth: `docs/ROADMAP.md` §3.8（贯穿原则：§4 优先级 1，"任何上量都先做这两件"中的运维/可观测性侧）
- Execution Mode: `auto`

## 变更摘要

- 变更摘要：在 `Lens Archive` 完成阶段 1 + Discovery Quality 后，正式启动阶段 2 的第一块独立可交付：**Observability & Ops V1**。该 increment 仅扩展（不打穿）现有功能，引入结构化请求日志、统一错误对象与 trace id、最小业务/基础指标统计与 `/api/metrics` 内部出口，以及健康检查的备份/恢复就绪性扩展。
- 当前判断：真实 increment（新增需求 / 新规格 / 新设计 / 新任务计划），不是 hotfix、不是范围澄清。
- 影响级别：medium（不修改现有业务流；新增独立的横切能力 + 1 个新 API + env 契约扩展）。

## 基线快照

- `Workflow Profile`：`full`（无新规格；新增模块涉及横切能力、env 契约扩展、新 API surface）
- `Current Stage`：post-finalize → 进入 `hf-increment` → 即将转 `hf-specify`
- `Current Active Task`：`None（T41-T45 已 finalized）`
- `Pending Reviews And Gates`：`None`
- `Worktree Path`：`/workspace`（in-place；后续 `hf-test-driven-dev` 阶段按 router 决策再评估升级）
- `Worktree Branch`：`cursor/phase2-observability-ops-051b`

## 变更包

- New
  - 结构化请求日志（trace id 串联、最小字段集）
  - 统一错误对象（`AppError` 与 server action / route handler 的归一化错误响应）
  - 最小指标记录器（HTTP / SQLite / 业务指标）+ 内部 `GET /api/metrics`
  - `Sentry-compatible` 错误上报抽象（默认 `noop` provider，未配置时不上报、不引入外部依赖）
  - env 契约：`OBSERVABILITY_LOG_LEVEL`、`OBSERVABILITY_METRICS_ENABLED`、`OBSERVABILITY_METRICS_TOKEN`、`ERROR_REPORTER_PROVIDER`、`SENTRY_DSN`、`SQLITE_BACKUP_DIR`
  - 备份脚本骨架：`web/scripts/backup-sqlite.mjs` + `restore-sqlite.mjs`，`/api/health` 输出 `backupReady` 与 `lastBackupAt`（若启用）

- Modified
  - `web/src/config/env.ts`：补充上述 env 字段、默认值与类型声明
  - 现有 server actions / route handlers / repository：在边界处统一调用日志与 metrics 钩子（不改变业务行为）
  - `/api/health`：扩展返回字段（备份与可观测性能力声明），保留旧字段向后兼容

- Deprecated
  - 直接 `console.log` 调用：在 server boundary 改走结构化 logger（保留 `dev` 环境可读输出）
  - 散落在 server action 中的 `try { ... } catch (e) { console.error(...) }` 旧写法：迁移到统一错误对象 + reporter

## 影响矩阵

- 受影响工件
  - 新增 SRS：`docs/specs/2026-04-19-observability-ops-v1-srs.md`（待创建）
  - 新增 Design：`docs/designs/2026-04-19-observability-ops-v1-design.md`（待创建）
  - 新增 Tasks：`docs/tasks/2026-04-19-observability-ops-v1-tasks.md`（待创建）
  - `web/src/config/env.ts` 与 `/api/health`、`/api/metrics`
  - `task-progress.md`（活跃任务字段、Pending Reviews、Next Action）
  - `RELEASE_NOTES.md`（finalize 时追加阶段 2.1 release section）
  - `docs/ROADMAP.md`（§3.8 完成后回写"已交付 V1"标记，finalize 阶段处理）

- 失效的批准状态：无（阶段 1 + Discovery Quality 工件保持有效；本 increment 为新主题，不重写已批准范围）
- 失效的任务 / `Current Active Task`：无（无在途任务）
- 失效的测试设计 / 验证证据 / review 结论：无（阶段 1 / Discovery Quality 的 review 与 gate 证据保持有效）
- 需重新派发的 reviewer / review 节点：本 increment 自身按 full profile 走 `hf-spec-review` → `hf-design-review` → `hf-tasks-review` → 每任务的 `bug-patterns/test-review/code-review/traceability-review` → `hf-regression-gate` → `hf-completion-gate` → `hf-finalize`
- Profile 升级信号：无降级；保持 `full`

## 同步更新项

- 已更新工件
  - 创建本变更记录：`docs/reviews/increment-phase2-observability-ops-v1.md`
  - 创建本地工作分支：`cursor/phase2-observability-ops-051b`

- 已回写内容
  - `task-progress.md`：将由后续步骤同步（本步骤先固定基线，避免与 spec 起草并发写）

- 明确不做的内容
  - 不在本 increment 内同步推进 §3.1（生产数据/对象存储托管 SQL 迁移），那需要外部服务选型与 staging 演练，超出当前可独立交付边界
  - 不引入业务可见的 UI 改动（仅内部 `/api/metrics` 与扩展后的 `/api/health` 文本字段）
  - 不接入真实 Sentry/外部上报后端（默认 `noop` provider；预留接口）
  - 不改变现有持久化方案（保持 `node:sqlite`），但补 backup/restore 脚本与文档

## 待同步项

- 工件：`task-progress.md`
  - 原因：本步只产出 increment 记录；规格起草后将一并把 `Current Stage / Current Spec / Pending Reviews / Next Action` 同步到 `task-progress.md`
  - 建议动作：在 `hf-specify` 完成草稿后回写

- 工件：`RELEASE_NOTES.md`
  - 原因：finalize 阶段才会追加 release section
  - 建议动作：`hf-finalize` 时同步

- 工件：`docs/ROADMAP.md`
  - 原因：§3.8 完成后再回写"已交付 V1"标记
  - 建议动作：`hf-finalize` 时同步

## 状态回流

- `Current Stage`：`hf-specify`
- `Workflow Profile`：`full`
- `Current Active Task`：`pending reselection`（任务计划批准前不指派活跃任务）
- `Pending Reviews And Gates`：`hf-spec-review`、`hf-design-review`、`hf-tasks-review`
- `Next Action Or Recommended Skill`：`hf-specify`
