# Increment: Phase 2 — Ops Back Office V1

- Date: `2026-04-19`
- Theme: Phase 2 — Ops Back Office V1（运营 / 审核后台 V1）
- Source of truth: `docs/ROADMAP.md` §3.2；§4 优先级 2「§3.2 运营后台 V1 → §3.3 线程式消息中心」
- Execution Mode: `auto`

## 变更摘要

- 变更摘要：在 `Lens Archive` 完成阶段 1 + Discovery Quality + Observability & Ops V1 + Discovery Intelligence V1 之后，启动 ROADMAP §3.2 的第一块独立可交付：**Ops Back Office V1**。引入最小管理员能力 + 后台 shell，让管理员能在不直接 `sqlite3` 操作数据库的前提下完成「精选位编排」与「作品违规处置」两件最高频的运营动作，并把所有写操作落到审计日志。
- 当前判断：真实 increment（新增需求 / 新规格 / 新设计 / 新任务计划），不是 hotfix、不是范围澄清。
- 影响级别：medium（新增 admin 段、`audit_log` 表、`works.status` 增加 `moderated`、`/studio/admin/*` 路由集；不修改既有公开页面 / studio 页面 / 既有 server action 业务行为）。

## 基线快照

- `Workflow Profile`：`full`（新增 admin role 策略 + 新 SQLite 表 + 新 UI surface + 新 server action 集；ROADMAP §3.2 显式列入 full profile）
- `Current Stage`：post-finalize → 进入 `hf-increment` → 即将转 `hf-specify`
- `Current Active Task`：`None（T52-T56 已 finalized）`
- `Pending Reviews And Gates`：`None`
- `Worktree Path`：`/workspace`（in-place）
- `Worktree Branch`：`cursor/phase2-ops-backoffice-v1-3dd4`

## 变更包

- New
  - 管理员策略：env 字段 `ADMIN_ACCOUNT_EMAILS`（CSV，默认空）+ `AdminGuard` / `AdminCapabilityPolicy`，沿用 `SessionContext` / `AccessControl` 模式。
  - 新 admin shell：路由 `/studio/admin`（首页 dashboard）、`/studio/admin/curation`（精选位维护）、`/studio/admin/works`（作品审核列表）、`/studio/admin/audit`（审计日志只读列表）。所有 admin 路由由 `AdminGuard` 保护：guest → `/login`；非 admin → `/studio`。
  - 精选位维护：管理员可对 `home` / `discover` 两个 surface 的 `featured` 区域进行：列出当前 slot、添加 slot、删除 slot、调整 `order`；操作通过新 `CurationConfigRepository.upsertSlot / removeSlot / reorderSlot` server action 落到 sqlite，并写入审计日志。
  - 作品违规处置：`CommunityWorkStatus` 联合追加 `"moderated"`（不破坏 `draft` / `published`；公开 read model 与 listing 一律隐藏 moderated 作品）；管理员可对任一作品执行 `hide` / `restore` 动作（`moderated ↔ published`）；操作落审计。
  - 审计日志：新 SQLite 表 `audit_log` + `AuditLogRepository.record / list`；所有 admin 写动作（curation 编辑、work hide / restore）必须经一次 `recordAuditEntry`；admin audit 页面只读列表（最新优先）。
  - 新 server actions：`features/admin/curation-actions.ts`、`features/admin/work-moderation-actions.ts`，全部走 `wrapServerAction` 接入 §3.8 V1 已交付的 logger / metrics / errors 横切。
  - 新 metrics 命名空间（加性扩展）：`admin.curation.{added,removed,reordered}`、`admin.work_moderation.{hidden,restored}`、`admin.audit.appended`，复用 `MetricsRegistry` + `MetricsSnapshot.admin`。

- Modified
  - `web/src/config/env.ts`：新增 `ADMIN_ACCOUNT_EMAILS` 解析（trim + lower + dedup；非法输入降级 + warn，缺省 ⇒ admin 名单为空 ⇒ 任何人都不是 admin）。
  - `web/src/features/auth/types.ts`：`AccessControl` 增加 `adminCapability` + `adminGuard`（不破坏现有 `studioGuard`）。
  - `web/src/features/auth/access-control.ts`：增加 `createAdminCapabilityPolicy` / `createAdminGuard`；`getRequestAccessControl` 自动注入。
  - `web/src/features/community/types.ts`：`CommunityWorkStatus` 联合追加 `"moderated"`；`WorkRepository` 增加 `listAllForAdmin()`（返回所有 status 包括 moderated，仅 admin 服务消费）。
  - `web/src/features/community/sqlite.ts`：works 表 status check 兼容新值；新增 `audit_log` 表 + 对应 mapper / 写入 / 查询；`CurationConfigRepository` 增加 `upsertSlot` / `removeSlot` / `reorderSlot` 写能力。
  - `web/src/features/community/public-read-model.ts`：所有 read 路径过滤 `status === "moderated"`（与 draft 同形）。
  - `web/src/features/observability/metrics.ts`：`MetricsSnapshot` 加性扩展 `admin` 命名空间。
  - `web/src/app/studio/page.tsx`：管理员可见时显示「进入运营后台」入口（仅当 `adminCapability.isAdmin === true`）。

- Deprecated
  - 无（不替换任何现有能力；仅扩展）。

## 影响矩阵

- 受影响工件
  - 新增 SRS：`docs/specs/2026-04-19-ops-backoffice-v1-srs.md`（待创建）
  - 新增 Design：`docs/designs/2026-04-19-ops-backoffice-v1-design.md`（待创建，含 §10 UI design）
  - 新增 Tasks：`docs/tasks/2026-04-19-ops-backoffice-v1-tasks.md`（待创建）
  - `web/src/config/env.ts`、`features/auth/{types,access-control}.ts`、`features/community/{types,sqlite,public-read-model}.ts`、`features/observability/metrics.ts`
  - `web/src/features/admin/*`（新模块）
  - `web/src/app/studio/admin/*`（新路由集）
  - `web/src/app/studio/page.tsx`（管理员入口）
  - `task-progress.md`（活跃任务字段、Pending Reviews、Next Action）
  - `RELEASE_NOTES.md`（finalize 时追加 §3.2 release section）
  - `docs/ROADMAP.md`（§3.2 完成后回写「V1 已交付」标记，finalize 阶段处理）
  - `README.md`（功能完成度概览同步，finalize 阶段处理）

- 失效的批准状态：无（前置增量工件保持有效；本 increment 为新主题）
- 失效的任务 / `Current Active Task`：无（无在途任务）
- 失效的测试设计 / 验证证据 / review 结论：无
- 需重新派发的 reviewer / review 节点：本 increment 自身按 full profile 走 `hf-spec-review` → `hf-design-review` + `hf-ui-review`（含 admin 后台 UI surface）→ `hf-tasks-review` → 每任务的 `hf-bug-patterns/hf-test-review/hf-code-review/hf-traceability-review` → `hf-regression-gate` → `hf-completion-gate` → `hf-finalize`
- Profile 升级信号：无；保持 `full`

## 同步更新项

- 已更新工件
  - 创建本变更记录：`docs/reviews/increment-phase2-ops-backoffice-v1.md`
  - 创建本地工作分支：`cursor/phase2-ops-backoffice-v1-3dd4`

- 已回写内容
  - `task-progress.md`：将由 spec 起草时一并同步

- 明确不做的内容
  - 不做举报队列与举报处置工作流（与下一 slice 一起做；现状仍依赖直接联系）。
  - 不做账号封禁 / 解封 / 角色变更（与下一 slice 一起做；本 V1 仅做 work 级处置）。
  - 不做 profile 维度的 hide / 警告（仅作品；profile 处置与举报队列一起做）。
  - 不接入 §3.1 生产数据（仍单实例 `node:sqlite`）。
  - 不引入二次审批 / 双人复核工作流（本 V1 admin 操作即时生效；审计可追溯即可）。
  - 不引入新外部 API；admin 操作通过 server action（form action）触发，无新 REST 端点。

## 待同步项

- 工件：`task-progress.md`
  - 原因：本步只产出 increment 记录；规格起草后将一并把 `Current Stage / Current Spec / Pending Reviews / Next Action` 同步
  - 建议动作：在 `hf-specify` 完成草稿后回写

- 工件：`RELEASE_NOTES.md`、`docs/ROADMAP.md` §3.2、`README.md`
  - 原因：finalize 阶段才会追加 release section / 标记 V1 / 更新概览
  - 建议动作：`hf-finalize` 时同步

## 状态回流

- `Current Stage`：`hf-specify`
- `Workflow Profile`：`full`
- `Current Active Task`：`pending reselection`（任务计划批准前不指派活跃任务）
- `Pending Reviews And Gates`：`hf-spec-review`、`hf-design-review`、`hf-ui-review`、`hf-tasks-review`
- `Next Action Or Recommended Skill`：`hf-specify`
