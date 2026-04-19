# Phase 2 — Ops Back Office V1 任务计划

- 状态: 已批准
- 批准记录: `docs/verification/tasks-approval-phase2-ops-backoffice-v1.md`
- 主题: Phase 2 — Ops Back Office V1（运营 / 审核后台 V1）
- 输入规格: `docs/specs/2026-04-19-ops-backoffice-v1-srs.md`（已批准）
- 输入设计: `docs/designs/2026-04-19-ops-backoffice-v1-design.md`（已批准，含 §10 UI design）
- 关联 review: `docs/reviews/spec-review-phase2-ops-backoffice-v1.md`、`docs/reviews/design-review-phase2-ops-backoffice-v1.md`、`docs/reviews/ui-review-phase2-ops-backoffice-v1.md`、`docs/reviews/tasks-review-phase2-ops-backoffice-v1.md`
- 关联 approval: `docs/verification/spec-approval-phase2-ops-backoffice-v1.md`、`docs/verification/design-approval-phase2-ops-backoffice-v1.md`
- 当前活跃任务: `T57`（Cross-Cutting Skeleton：env / `SessionContext.email` / `CommunityWorkStatus.moderated` / `MetricsSnapshot.admin` / `audit_log` schema / `AuditLogRepository` / curation 写能力 / `withTransaction` / `listAllForAdmin`）

## 1. 概述

本计划把已批准设计拆为 **7 个可独立 fail-first 推进的任务**（`T57` ~ `T63`），覆盖：

- 横切骨架（env flag + Session.email + CommunityWorkStatus.moderated + MetricsSnapshot.admin + audit_log schema + bundle 类型扩展 + withTransaction）— `T57`
- Admin policy / guard 纯函数 — `T58`
- Curation 写动作 + 后台页面 — `T59`
- Work moderation 写动作 + 后台页面 + 公开屏蔽闭环 — `T60`
- Audit log server action 助手 + 后台页面 — `T61`
- Owner-side `/studio/works` moderated 适配（FR-004 #6 + I-14） — `T62`
- Admin dashboard + `/studio` admin 入口卡 — `T63`

拆解原则：

- 先做最薄端到端的横切骨架（`T57`），确保 cross-cutting 契约（type unions、env、metrics namespace、audit table schema、bundle 接口扩展）先 work，再做业务面。
- Admin policy / guard 是独立纯函数（`T58`），Curation 与 Work moderation 与 Audit page 三块业务能力（`T59` / `T60` / `T61`）共用 `T58` 的 policy 与 `T57` 的 audit / withTransaction 基础。
- Owner-side `/studio/works` moderated 适配（`T62`）依赖 `T57` 的 `CommunityWorkStatus.moderated` 但与 `T60` 的 admin 写动作彼此独立 — 一个是 owner-side fail-closed 防护，一个是 admin-side 写入入口；二者互不阻塞。
- Admin dashboard + studio 入口卡（`T63`）依赖 `T58` 的 admin policy 与 `T59` / `T60` / `T61` 三个子页路由全部存在（dashboard 入口卡的目标 URL 必须是已实现的页面），故放在最后。
- Selection priority：`T57 → T58 → T59 → T60 → T61 → T62 → T63`，同时允许 `T59` / `T60` / `T61` / `T62` 在依赖满足后并行（`T62` 独立于 `T58` ~ `T61`，仅依赖 `T57`）。

每个任务遵循 `web/AGENTS.md` 的 fail-first 节奏：写测试 → 跑 → 红 → 实现 → 跑 → 绿 → 跑 `npm run test / typecheck / lint / build` 全绿。

## 2. 里程碑

### M1 横切骨架（`T57`）

- 目标：建立 admin 后台需要的所有跨切契约：env (`ADMIN_ACCOUNT_EMAILS`) + `AuthenticatedSessionContext.email` + `auth_accounts.email` JOIN + `CommunityWorkStatus.moderated` + `WorkRepository.listAllForAdmin` + `CurationConfigRepository.{upsertSlot,removeSlot,reorderSlot}` + `AuditLogRepository` + `audit_log` schema + `MetricsSnapshot.admin` 加性扩展 + `SqliteCommunityRepositoryBundle.withTransaction` + in-memory bundle 等价实现 + admin metrics 键名常量。
- 退出标准：`signals` / cross-cutting 单测全绿；`cd web && npm run typecheck / lint / build` 全绿；既有 `community/sqlite.test.ts` / `auth/auth-store.test.ts` / `auth/access-control.test.ts` 不漂移。

### M2 Admin Policy / Guard（`T58`）

- 目标：`features/auth/access-control.ts` 增加 `createAdminCapabilityPolicy` / `createAdminGuard`；`getRequestAccessControl()` 自动注入；`features/admin/runtime.ts` 落 `runAdminAction` helper（含 `withBundleTransaction`）。
- 退出标准：`access-control.test.ts` 三态用例 + `runAdminAction` 单元测试（admin / non-admin / guest / 异常 rollback）全绿。

### M3 Curation 后台 + 写动作（`T59`）

- 目标：`features/admin/curation-actions.ts`（3 个 server action）+ `app/studio/admin/curation/page.tsx`；含 §9.5.3 SQL + §10.1 表单 + §10.2 状态矩阵的 empty / partial / invalid。
- 退出标准：server action + page 单测 + 集成测试全绿；SSR redirect + admin guard + audit append + counter 递增三链全部断言。

### M4 Work moderation 后台 + 写动作 + 公开屏蔽（`T60`）

- 目标：`features/admin/work-moderation-actions.ts`（hide / restore）+ `app/studio/admin/works/page.tsx` + 公开 read model + 推荐 / 搜索的 moderated 屏蔽闭环。
- 退出标准：admin server action + page 集成测试全绿；公开 surface（`getPublicWorkPageModel`、`toPublicProfile.showcaseItems`、`bundle.works.listPublicWorks`、`getRelatedWorks`、`features/search`）moderated 屏蔽断言全绿；推荐模块 `getRelatedWorks` 现有测试不漂移（自动从 listPublicWorks 兜底屏蔽）。

### M5 Audit log 后台页面（`T61`）

- 目标：`app/studio/admin/audit/page.tsx` 渲染最新 100 条；audit list 单次 SELECT 断言；`recordAuditEntry` 助手由 `T57` 的 `AuditLogRepository` 已可用。
- 退出标准：page 集成测试 + audit ordering 断言 + 空态文案断言全绿。

### M6 Owner-side `/studio/works` moderated 适配（`T62`，FR-004 #6 + I-14）

- 目标：`app/studio/works/page.tsx` 三态文案 + 抑制 moderated 处置按钮 + 申诉提示；`features/community/work-editor.ts > resolveNextVisibility` 对 `currentWork.status === "moderated"` throw `AppError("moderated_work_owner_locked", 403)`；`/studio/works?error=moderated_work_owner_locked` alert 条 SSR 渲染。
- 退出标准：`work-editor.test.ts` + `app/studio/works/page.test.tsx` 新增覆盖全绿；既有 owner work_editor 行为不漂移（`save_draft + published` 路径不变）。

### M7 Dashboard + `/studio` 入口卡（`T63`）

- 目标：`app/studio/admin/page.tsx`（dashboard：三张入口卡 + 当前 admin 邮箱 + 名单大小）+ `app/studio/page.tsx` 条件渲染入口卡（admin 才显示）。
- 退出标准：page 集成测试断言 admin / non-admin 视图差异全绿；DOM 中非 admin 视图绝不渲染入口卡。

## 3. 文件 / 工件影响图

### 新增

- `web/src/features/admin/audit-log.ts` + `.test.ts`
- `web/src/features/admin/curation-actions.ts` + `.test.ts`
- `web/src/features/admin/work-moderation-actions.ts` + `.test.ts`
- `web/src/features/admin/runtime.ts` + `.test.ts`
- `web/src/features/admin/metrics.ts`
- `web/src/features/admin/admin-policy.ts`
- `web/src/features/admin/test-support.ts`
- `web/src/features/admin/index.ts`
- `web/src/app/studio/admin/page.tsx` + `page.test.tsx`
- `web/src/app/studio/admin/curation/page.tsx` + `page.test.tsx`
- `web/src/app/studio/admin/works/page.tsx` + `page.test.tsx`
- `web/src/app/studio/admin/audit/page.tsx` + `page.test.tsx`
- `docs/verification/test-design-T57.md` ~ `T63.md`
- `docs/verification/implementation-T57.md` ~ `T63.md`
- `docs/reviews/bug-patterns-T57.md` ~ `T63.md`
- `docs/reviews/test-review-T57.md` ~ `T63.md`
- `docs/reviews/code-review-T57.md` ~ `T63.md`
- `docs/reviews/traceability-review-T57.md` ~ `T63.md`
- `docs/verification/regression-T57.md` ~ `T63.md`
- `docs/verification/completion-T57.md` ~ `T63.md`
- `docs/verification/regression-gate-phase2-ops-backoffice-v1.md`
- `docs/verification/completion-gate-phase2-ops-backoffice-v1.md`
- `docs/verification/finalize-phase2-ops-backoffice-v1.md`
- `docs/verification/release-notes-phase2-ops-backoffice-v1.md`

### 修改

- `web/src/config/env.ts` + `env.test.ts`（`readAdminAccountsConfig` / `getAdminAccountEmails`）
- `web/src/features/auth/types.ts`（`AuthenticatedSessionContext.email`、`AdminCapabilityPolicy`、`AdminGuard`、`AccessControl` 新字段）
- `web/src/features/auth/session.ts`（`createAuthenticatedSessionContext(email)`、`resolveSessionContext` 同步、`getSessionContext` 解析）
- `web/src/features/auth/auth-store.ts` + `auth-store.test.ts`（`AuthSession.email`、`resolveAuthSession` JOIN email）
- `web/src/features/auth/access-control.ts` + `access-control.test.ts`（admin policy / guard）
- `web/src/features/auth/actions.test.ts`（mock session 构造补 email 字段；by typecheck 引导）
- `web/src/features/community/types.ts`（`CommunityWorkStatus.moderated`、`WorkRepository.listAllForAdmin`、`CurationConfigRepository` writes、`AuditLogRepository`、`CommunityRepositoryBundle.audit`）
- `web/src/features/community/sqlite.ts` + `sqlite.test.ts`（schema 增加 `audit_log` + index；`listAllForAdmin`；curation 写能力；`withTransaction`；`AuditLogRepository` 实现）
- `web/src/features/community/test-support.ts`（in-memory bundle 增加 `audit` 数组实现 + curation 写能力 + `withTransaction` noop）
- `web/src/features/community/contracts.ts` + `contracts.test.ts`（`getPublicWorkRecords` 仍仅返回 published；contracts 测试补 moderated case）
- `web/src/features/community/public-read-model.ts` + `public-read-model.test.ts`（补 moderated 屏蔽 case；实现可不变）
- `web/src/features/community/work-editor.ts` + `work-editor.test.ts`（`resolveNextVisibility` 对 `moderated` throw `moderated_work_owner_locked`）
- `web/src/features/community/work-actions.ts`（如果直接 throw 不被 `wrapServerAction` AppError 处理，需要 export 形态对齐；by typecheck 引导）
- `web/src/features/observability/metrics.ts` + `metrics.test.ts`（`MetricsSnapshot.admin` 加性扩展）
- `web/src/app/studio/page.tsx` + `page.test.tsx`（admin 入口卡 + admin/非 admin 用户分支断言）
- `web/src/app/studio/works/page.tsx` + `page.test.tsx`（owner-side moderated 三态文案 + 抑制按钮 + `?error=moderated_work_owner_locked` alert）
- `task-progress.md`（每任务完成时同步）
- `RELEASE_NOTES.md`（finalize 时追加）
- `docs/ROADMAP.md` §3.2（finalize 时回写「V1 已交付」）
- `README.md`（finalize 时更新功能完成度概览）

## 4. 需求与设计追溯

| 规格 / 设计锚点 | 落地任务 |
| --- | --- |
| `FR-001` Admin Capability + Guard | `T58`（admin policy + guard）+ `T57`（env 解析 + Session.email） |
| `FR-002` Dashboard + 导航 | `T63`（dashboard + studio 入口卡）|
| `FR-003` Curation 维护 | `T59` |
| `FR-004` 作品违规处置（admin 部分）| `T60` |
| `FR-004` #6 owner-side `/studio/works` moderated 视图 | `T62` |
| `FR-005` Audit Log（写入路径）| `T59` / `T60`（admin server action 内部）+ `T57`（schema + Repository）|
| `FR-005` Audit Log 列表页 | `T61` |
| `FR-006` 公开 read model 屏蔽 moderated | `T57`（`CommunityWorkStatus` + sqlite WHERE）+ `T60`（公开 surface 集成断言）|
| `FR-007` env 契约扩展 | `T57` |
| `FR-008` admin metrics 命名空间 | `T57`（`MetricsSnapshot.admin` + key 常量）+ `T59` / `T60` / `T61`（counter 递增）|
| `NFR-001` 性能 ≤ 80ms | Increment-level regression-gate（不强制每任务 perf bench）|
| `NFR-002` 安全 / fail-closed / no PII in log | `T57`（env fail-closed）+ `T58`（guard fail-closed）+ `T59` / `T60` / `T61`（`actorEmail` 仅入 audit_log，不入 logger）|
| `NFR-003` 可观测性 / `wrapServerAction` 接入 | `T59` / `T60` / `T61`（admin server action）|
| `NFR-004` 可测试性 / deps 注入 | 全部任务 |
| `NFR-005` 兼容性 | `T57`（`SessionContext` 加性扩展）+ `T62`（既有 owner save_draft / publish 路径不变）|
| 设计 §11 I-1 ~ I-14 不变量 | 见任务 §5 各任务 acceptance 内显式锚定 |
| 设计 ADR-1 (env-only admin role) | `T57` / `T58` |
| 设计 ADR-2 (write+audit same tx) | `T57` (`withTransaction`) + `T59` / `T60` (server action 包 tx) |
| 设计 ADR-3 (MetricsSnapshot.admin 加性) | `T57` |
| 设计 ADR-4 (SessionContext.email) | `T57` |
| 设计 ADR-5 (公开 read model moderated 同形屏蔽) | `T57` (`CommunityWorkStatus`) + `T60` (公开 surface 集成断言) |
| 设计 ADR-6 (CON 锚点归集) | 见每任务 acceptance 中对应 CON 项 |
| 设计 UI-ADR-1..5 | `T59` / `T60` / `T61` / `T63` UI 落地 |

## 5. 任务拆解

### T57. Cross-Cutting Skeleton

- 目标：建立 admin 后台需要的所有跨切契约（无业务 IO；类型 + schema + repository 接口扩展 + in-memory 实现 + 不变量单测）。
- Acceptance:
  - `web/src/config/env.ts` 新增 `readAdminAccountsConfig(env)` + `getAdminAccountEmails()`；CSV 解析 + trim + lower + dedup + 非法 piece 降级 + warning slug `admin-account-email-invalid`。env 缺省 ⇒ 名单空（fail-closed I-2）。
  - `web/src/features/community/types.ts`：`CommunityWorkStatus = "draft" | "published" | "moderated"`；`WorkRepository.listAllForAdmin(): Promise<CommunityWorkRecord[]>`；`CurationConfigRepository.upsertSlot/removeSlot/reorderSlot`；`AuditLogRepository.{record,listLatest}`；`CommunityRepositoryBundle.audit`。
  - `web/src/features/auth/types.ts`：`AuthenticatedSessionContext.email: string`；`AdminCapabilityPolicy { isAdmin, email | null }`；`AdminGuard { allowed, redirectTo, reason }`；`AccessControl` 增字段（policy 函数本身在 T58 实现）。
  - `web/src/features/auth/session.ts`：`createAuthenticatedSessionContext(accountId, primaryRole, email)`；`resolveSessionContext(sessionRole)` 同步补 email；`getSessionContext` 解析 `resolveAuthSession` 返回的 email。
  - `web/src/features/auth/auth-store.ts`：`AuthSession.email: string`；`resolveAuthSession` 的 SQL JOIN 增加 `auth_accounts.email`。
  - `web/src/features/community/sqlite.ts`：
    - 新增 `audit_log` 表 schema + `idx_audit_log_created_at_desc` 索引。
    - `bundle.works.listAllForAdmin` 实现（按 `datetime(updated_at) DESC NULLS LAST, id ASC`）。
    - `bundle.curation.upsertSlot/removeSlot/reorderSlot` 实现（§9.5.3 SQL）。
    - `bundle.audit.record/listLatest` 实现（§9.5.4 SQL）。
    - `SqliteCommunityRepositoryBundle.withTransaction(fn)` 实现（`BEGIN IMMEDIATE / COMMIT / ROLLBACK`）。
    - `bundle.works.listPublicWorks` 显式 `WHERE status = 'published'`（如未严格此 WHERE）。
  - `web/src/features/community/test-support.ts`：in-memory bundle 增加 `audit` 字段（实现真实 record / listLatest，维护内部数组按 `created_at desc, id desc` 返回 N 条）+ curation 写能力 + `withTransaction(fn)` noop（直接 await fn()）。
  - `web/src/features/observability/metrics.ts`：
    - `MetricsSnapshot.admin: AdminSnapshot` 顶层字段（与 §3.6 `recommendations` namespace 严格同形）。
    - `ADMIN_COUNTER_NAMES` 6 项预注册为 0；snapshot 输出新字段。
    - 既有 `http` / `sqlite` / `business` / `recommendations` / `gauges` / `labels` 字段不变。
  - `web/src/features/admin/metrics.ts`：键名常量 + 6 个 helper（`incrementCurationAdded` 等）；I-6 单点定义。
- 依赖: 无（首项任务）。
- Ready When: 设计 + tasks-review 已批准。
- 初始队列状态: `ready`。
- Selection Priority: 1。
- Files / 触碰工件:
  - 修改 `web/src/config/env.ts` + `env.test.ts`（admin emails 解析）
  - 修改 `web/src/features/auth/types.ts`、`session.ts`、`auth-store.ts` + `auth-store.test.ts`
  - 修改 `web/src/features/community/types.ts`、`sqlite.ts` + `sqlite.test.ts`、`test-support.ts`
  - 修改 `web/src/features/observability/metrics.ts` + `metrics.test.ts`
  - 新增 `web/src/features/admin/metrics.ts`
- 测试设计种子:
  - 主行为：`readAdminAccountsConfig` CSV 解析、admin emails 归一化、非法降级；`auth-store.resolveAuthSession` 返回 email；`sqlite.audit_log` schema + insert/list；`withTransaction` 成功提交 / 异常回滚；`listAllForAdmin` 含 moderated；`MetricsSnapshot.admin` 6 counter 零状态。
  - 关键边界：env 名单为空 ⇒ getAdminAccountEmails 返回空 Set；非法 email piece 降级 + warning；admin counter 增量后既有 http/sqlite/business/recommendations 字段不被影响。
  - fail-first 点：先写测试，未实现前所有 admin / audit / `listAllForAdmin` import 都失败。
  - 可测试性 (NFR-005)：通过显式 env 注入 + in-memory bundle 注入完成所有断言。
- Verify: `cd web && npm run test && npm run typecheck && npm run lint && npm run build`。
- 预期证据: 标准 8 文件全套（test-design / implementation / bug-patterns / test-review / code-review / traceability-review / regression / completion）。
- 完成条件: 所有上述测试绿；评审链全部通过。

---

### T58. Admin Policy + Guard + runAdminAction

- 目标：`features/auth/access-control.ts` 增加 `createAdminCapabilityPolicy(session, adminEmails)` / `createAdminGuard(session, capability)`；`getRequestAccessControl()` 自动注入；`features/admin/admin-policy.ts` barrel re-export；`features/admin/runtime.ts` 实现 `runAdminAction(opts)` helper（含 `withBundleTransaction`、admin 校验、metrics counter、logger info/warn 双 log 写入）。
- Acceptance:
  - `createAdminCapabilityPolicy(session, adminEmails)` 是纯函数：guest → `{ isAdmin: false, email: null }`；authenticated 但 email 不在名单 → `{ isAdmin: false, email: null }`；authenticated 且 email 在名单 → `{ isAdmin: true, email: <lowercase> }`；输入 email 与名单都按 lowercase 比较（I-1 / I-7）。
  - `createAdminGuard(session, capability)`：guest → `redirectTo:"/login"` `reason:"unauthenticated"`；非 admin → `redirectTo:"/studio"` `reason:"not_admin"`；admin → `allowed: true`（I-2 / I-3）。
  - `getRequestAccessControl()` 输出 `adminCapability` + `adminGuard` 两个新字段；既有 `studioGuard` / `creatorCapability` / `session` 字段不变（I-12）。
  - `runAdminAction(opts)`：admin 校验失败 → 立即 throw `AppError("forbidden_admin_only", 403)`，不进入业务写 / audit append（I-3）。admin 校验通过 → `withBundleTransaction` 包裹 `opts.fn`，成功 → logger.info `event=admin.action.completed` + `actionName` + `durationMs` + 不写 actorEmail；失败 → logger.warn `event=admin.action.failed` + 错误归一化 throw 给外层 wrapServerAction。
  - `withBundleTransaction(bundle, fn)`：bundle 是 sqlite bundle 时调用 `bundle.withTransaction(fn)`；bundle 是 in-memory（无 `withTransaction` 字段或 noop）时直接执行 `fn()`；类型签名安全。
  - admin metrics（counter）由各业务 server action 自己调用（不在 `runAdminAction` 内部统一 increment，因为 counter key 与 actionName 不一一对应）。
- 依赖: `T57`。
- Ready When: `T57` completion-gate 通过。
- 初始队列状态: `pending`。
- Selection Priority: 2。
- Files / 触碰工件:
  - 修改 `web/src/features/auth/access-control.ts` + `access-control.test.ts`
  - 新增 `web/src/features/admin/admin-policy.ts`（barrel re-export）
  - 新增 `web/src/features/admin/runtime.ts` + `runtime.test.ts`
  - 新增 `web/src/features/admin/test-support.ts`（`createAdminTestDeps` / `fakeAdminSession` / `fakeNonAdminSession`）
  - 新增 `web/src/features/admin/index.ts`
- 测试设计种子:
  - 主行为：admin policy / guard 三态；`runAdminAction` admin 通过 + 失败 + guard 不通过 三条主路径。
  - 关键边界：admin 名单为空 ⇒ `isAdmin === false`；email 大小写不敏感；非 admin 直接 redirect 而不进入 fn；fn throw → 不调用 metrics counter（counter 在 fn 内部走）；double log（外层 wrapServerAction + 内层 admin.action.completed）— 本任务用一个单测 stub `wrapServerAction` 验证两条 log。
  - fail-first 点：先写测试，未实现前 import 全失败。
  - 可测试性：`runAdminAction` 接受 deps 注入（session / bundle / metrics / logger / adminEmails）。
- Verify: `cd web && npm run test && npm run typecheck && npm run lint && npm run build`。
- 完成条件: 同 T57。

---

### T59. Curation 后台 + 写动作

- 目标：实现 `features/admin/curation-actions.ts`（`upsertCuratedSlotAction` / `removeCuratedSlotAction` / `reorderCuratedSlotAction`）+ `app/studio/admin/curation/page.tsx` SSR 页面；含 §10.1 表单 + §10.2 状态矩阵 + audit append + counter 递增。
- Acceptance:
  - 三个 server action 全部经 `wrapServerAction("admin/curation/...", fn)` 包装；内部经 `runAdminAction` 二次包装。
  - `upsertCuratedSlotAction(formData)`：解析 surface / sectionKind / targetType / targetKey / order；非法 → throw `AppError("invalid_curation_input", 400)`；合法但 targetKey 指向不存在对象 → 仍写库 + audit `note="target_not_found_at_write"`；调用 `bundle.curation.upsertSlot`（§9.5.3 ON CONFLICT 语义）+ `bundle.audit.record({ action: "curation.upsert", ... })` + `incrementCurationAdded(metrics)` + `incrementAuditAppended(metrics)`；同事务（`withTransaction`）。
  - `removeCuratedSlotAction(formData)`：解析 + 非法处置同上；调用 `bundle.curation.removeSlot` + audit `action="curation.remove"` + counter `admin.curation.removed` + `admin.audit.appended`。
  - `reorderCuratedSlotAction(formData)`：解析 + 非法处置同上；调用 `bundle.curation.reorderSlot` + audit `action="curation.reorder"` + counter `admin.curation.reordered` + `admin.audit.appended`；不存在 slot → `AppError("invalid_curation_input")`（视为非法输入）。
  - `app/studio/admin/curation/page.tsx`：
    - SSR 同步 `getRequestAccessControl()`，`adminGuard.allowed === false` → `redirect(adminGuard.redirectTo)`（I-8 同步阶段）。
    - 渲染上下两段（Home / Discover），表格 + `<form>` 添加 + 行内 `<form>` 删除 / 重排。
    - `searchParams.error` 触发 alert 条（按 §10.4 错误码字典）。
    - 空态 / partial 态 / invalid 态按 §10.2 矩阵。
- 依赖: `T57`、`T58`。
- Ready When: `T57` + `T58` completion-gate 都通过。
- 初始队列状态: `pending`。
- Selection Priority: 3。
- Files / 触碰工件:
  - 新增 `web/src/features/admin/curation-actions.ts` + `curation-actions.test.ts`
  - 新增 `web/src/app/studio/admin/curation/page.tsx` + `page.test.tsx`
- 测试设计种子:
  - 主行为：3 个 server action × happy / invalid / target-not-found 路径。
  - 关键边界：tx rollback（业务写抛错时 audit 不应出现在 listLatest）；同 `(surface, sectionKind, targetKey)` upsert 视为更新（仅一条 audit）。
  - 集成：page guest → /login，非 admin → /studio，admin → 列表 + 表单。
  - fail-first 点：每个 server action 在 admin 校验失败时直接 throw，不写 sqlite。
- Verify: `cd web && npm run test && npm run typecheck && npm run lint && npm run build`。
- 完成条件: 同 T57。

---

### T60. Work moderation 后台 + 写动作 + 公开屏蔽闭环

- 目标：`features/admin/work-moderation-actions.ts`（`hideWorkAction` / `restoreWorkAction`）+ `app/studio/admin/works/page.tsx` SSR + 公开 read model / 推荐 / 搜索的 moderated 屏蔽集成断言。
- Acceptance:
  - `hideWorkAction(workId)`：经 `wrapServerAction("admin/hideWork", fn)` + `runAdminAction` 包装；`bundle.works.getById(workId)` 校验存在性（`work_not_found`）+ status === "published" 校验（`invalid_work_status_transition`）；`bundle.works.save({...existing, status: "moderated", updatedAt: now})` + `bundle.audit.record({ action: "work_moderation.hide" })` + counter `admin.work_moderation.hidden` + `admin.audit.appended`；同事务。
  - `restoreWorkAction(workId)`：类似，但 status === "moderated" → "published" + counter `admin.work_moderation.restored`。
  - `app/studio/admin/works/page.tsx`：列表所有作品（`bundle.works.listAllForAdmin`）；status 标签三态（草稿 / 已发布 / 已隐藏）+ 处置按钮按状态；`searchParams.error` alert；空态文案两种（全库无作品 / 全库仅 draft）。
  - 公开屏蔽闭环：
    - `getPublicWorkPageModel(moderatedId)` → null（既有实现已 fail-closed，本任务补测试）。
    - `toPublicProfile.showcaseItems` 不含 moderated（既有实现已 fail-closed，本任务补测试）。
    - `bundle.works.listPublicWorks` 不含 moderated（`T57` 已 WHERE，本任务补测试）。
    - `getRelatedWorks` 候选池不含 moderated（自动从 listPublicWorks 兜底；本任务补显式断言）。
    - `features/search` 不命中 moderated（自动从 listPublicWorks 兜底；本任务补显式断言）。
- 依赖: `T57`、`T58`。
- Ready When: `T57` + `T58` 通过（与 `T59` / `T61` / `T62` 可并行）。
- 初始队列状态: `pending`。
- Selection Priority: 4。
- Files / 触碰工件:
  - 新增 `web/src/features/admin/work-moderation-actions.ts` + `work-moderation-actions.test.ts`
  - 新增 `web/src/app/studio/admin/works/page.tsx` + `page.test.tsx`
  - 修改 `web/src/features/community/contracts.test.ts`（补 moderated case）
  - 修改 `web/src/features/community/public-read-model.test.ts`（补 moderated 屏蔽 case）
  - 视情况补 `web/src/features/recommendations/related-works.test.ts`、`web/src/features/search/*.test.ts` 集成断言
- 测试设计种子:
  - 主行为：hide / restore happy + draft transition 拒绝 + 不存在 workId。
  - 关键边界：tx rollback（业务写抛错 audit 不写）；公开 surface 屏蔽（5 个 surface 各一条断言）；推荐 / 搜索现有测试不漂移。
  - fail-first 点：admin guard / 状态机校验 / 5 surface 断言。
- Verify: `cd web && npm run test && npm run typecheck && npm run lint && npm run build`。
- 完成条件: 同 T57。

---

### T61. Audit log 后台页面

- 目标：`app/studio/admin/audit/page.tsx` SSR 渲染最新 100 条 audit；含 §10.1 卡片列表 + §10.2 空态。
- Acceptance:
  - SSR `bundle.audit.listLatest(100)` 单次 SELECT；按 `created_at desc, id desc`。
  - 卡片每条含：人类可读时间 + ISO（`<time dateTime>`）、`actor_email`、`action` 中文化标签、`target_kind:target_id`、`note`（如有）。
  - 空态文案「暂无审计记录」（`audit.length === 0`）；不渲染卡片网格。
  - admin guard 同步阶段执行；非 admin / guest 路径 redirect。
- 依赖: `T57`、`T58`、（`T59` ∪ `T60`）。本页本身只读 audit；但 audit 数据由 `T59` / `T60` 的 server action 注入，至少一个完成才能写有意义的端到端 case。
- Ready When: `T57` + `T58` + (`T59` ∪ `T60`) completion-gate 通过。
- 初始队列状态: `pending`。
- Selection Priority: 5。
- Files / 触碰工件:
  - 新增 `web/src/app/studio/admin/audit/page.tsx` + `page.test.tsx`
  - 新增 `web/src/features/admin/audit-log.ts`（barrel re-export + 必要的中文化映射 helper）+ `audit-log.test.ts`
- 测试设计种子:
  - 主行为：admin → 渲染 100 条；空态文案。
  - 关键边界：listLatest 调用次数（spy = 1）；按 `created_at desc, id desc` 排序断言。
  - 集成：guest → /login；非 admin → /studio。
- Verify: `cd web && npm run test && npm run typecheck && npm run lint && npm run build`。
- 完成条件: 同 T57。

---

### T62. Owner-side `/studio/works` moderated 适配（FR-004 #6 + I-14）

- 目标：让 owner 在 `/studio/works` 看到 moderated 作品但不能自助恢复；`work-editor.ts > resolveNextVisibility` fail-closed。
- Acceptance:
  - `app/studio/works/page.tsx`：
    - status 文案三态（草稿 / 已发布 / 已隐藏（运营处置））。
    - moderated 作品行：渲染只读视图（标题 / 分类 / 描述 / 封面）+ 一行说明「已被运营隐藏，请联系管理员申请恢复」+ **不**渲染 publish / revert_to_draft / save_draft 任一按钮。
    - draft / published 作品按现状渲染（不变）。
    - `?error=moderated_work_owner_locked` 触发 alert 条（按 §10.4 错误码字典；非 admin 也走同样的 alert，因为这是 owner 视图）。
  - `features/community/work-editor.ts > resolveNextVisibility`：当 `currentWork?.status === "moderated"` 时，**任何 intent** 都 throw `AppError("moderated_work_owner_locked", 403)`（I-14）。
  - `saveCreatorWorkForRole` 上游调用方（`features/community/work-actions.ts`）通过 `wrapServerAction` 把 `AppError` 归一化 → form action 携带 `?error=moderated_work_owner_locked` redirect 回 `/studio/works`。
  - 既有 `work-editor.test.ts` 行为不漂移；新增覆盖：
    - moderated 作品上 owner 提交 publish / revert_to_draft / save_draft 三种 intent → 都 throw。
    - moderated 作品行 DOM：无三种按钮 + 显示申诉提示。
- 依赖: `T57`（需要 `CommunityWorkStatus.moderated`）。与 `T58` ~ `T61` 互不依赖（owner-side 防护是独立 lock，与 admin-side 写入入口解耦）。
- Ready When: `T57` completion-gate 通过。
- 初始队列状态: `pending`。
- Selection Priority: 6。
- Files / 触碰工件:
  - 修改 `web/src/features/community/work-editor.ts` + `work-editor.test.ts`
  - 修改 `web/src/app/studio/works/page.tsx` + `page.test.tsx`
  - 视情况修改 `web/src/features/community/work-actions.ts` 让错误 propagate（如已自然 propagate 则不动）
- 测试设计种子:
  - 主行为：moderated 作品上 3 种 intent 都 throw；moderated row DOM 无按钮 + 显示申诉提示。
  - 关键边界：published / draft 现有路径不变；既有 `T28` work_editor 测试全绿（不漂移）。
  - fail-first 点：先写测试断言 throw，未实现前 `resolveNextVisibility` 仍允许 moderated → published（违反 I-14）。
- Verify: `cd web && npm run test && npm run typecheck && npm run lint && npm run build`。
- 完成条件: 同 T57。

---

### T63. Admin Dashboard + `/studio` 入口卡

- 目标：`app/studio/admin/page.tsx` dashboard（三张入口卡 + admin 邮箱 + 名单大小）+ `app/studio/page.tsx` 条件渲染 admin 入口卡。
- Acceptance:
  - `app/studio/admin/page.tsx`：
    - SSR 同步 admin guard；非 admin redirect。
    - 顶部 panel：「当前 admin 邮箱：<email>」+「admin 名单大小：N」。
    - 三张 `museum-card` 入口卡（精选位编排 / 作品审核 / 审计日志），分别链向 `/studio/admin/curation` / `/studio/admin/works` / `/studio/admin/audit`。
  - `app/studio/page.tsx`：
    - 在既有四张卡片网格末尾，根据 `accessControl.adminCapability.isAdmin === true` 条件渲染第五张「进入运营后台 → /studio/admin」入口卡。
    - 非 admin DOM 中**不**渲染该卡（FR-002 #5；不暴露存在）。
  - 既有 `studio` 主页测试 + 既有 4 张卡片渲染逻辑不漂移。
- 依赖: `T58`（admin guard）+ `T59` + `T60` + `T61`（dashboard 入口卡的目标 URL 需已实现）。
- Ready When: `T58` AND `T59` AND `T60` AND `T61` completion-gate 全部通过（AND 语义）。
- 初始队列状态: `pending`。
- Selection Priority: 7（最后任务）。
- Files / 触碰工件:
  - 新增 `web/src/app/studio/admin/page.tsx` + `page.test.tsx`
  - 修改 `web/src/app/studio/page.tsx` + `page.test.tsx`
- 测试设计种子:
  - 主行为：admin → 渲染 dashboard + 三张入口卡 + 邮箱 + 名单大小；admin → /studio 第五张卡显示。
  - 关键边界：guest → /login；非 admin → /studio；非 admin /studio 主页 DOM 中无第五张卡。
- Verify: `cd web && npm run test && npm run typecheck && npm run lint && npm run build`。
- 完成条件: 同 T57。

## 6. 依赖与关键路径

```
T57 (Cross-Cutting Skeleton)
 ├── T58 (Admin Policy + runAdminAction)
 │    ├── T59 (Curation 后台)
 │    │    └── T63 (Dashboard + /studio 入口卡)
 │    ├── T60 (Work moderation 后台 + 公开屏蔽)
 │    │    └── T63
 │    └── T61 (Audit log 后台)  // also depends on T59 ∪ T60 for meaningful audit data
 │              └── T63
 └── T62 (Owner-side moderated 适配)  // independent of T58..T61
```

关键路径（图论依赖，AND 语义）：

- `T58` 严格依赖 `{T57}`。
- `T59` / `T60` 严格依赖 `{T57, T58}`，互不依赖。
- `T61` 严格依赖 `{T57, T58}` AND (`T59` ∪ `T60`)（至少一个 admin server action 实现完成才能形成端到端 audit 数据流）。
- `T62` 严格依赖 `{T57}`。
- `T63` 严格依赖 `{T58, T59, T60, T61}` AND（即必须等所有 admin 子页路由都已实现，dashboard 入口卡的目标 URL 全部生效）。

`Selection Priority` 按 §1 拓扑给出 `T57 → T58 → T59 → T60 → T61 → T62 → T63`，提供线性叙事；并发授权由 router 决定。

## 7. 完成定义与验证策略

### 任务级
- fail-first 测试 → 红 → 实现 → 绿
- `cd web && npm run test && npm run typecheck && npm run lint && npm run build` 全 exit 0
- 评审链：`hf-bug-patterns → hf-test-review → hf-code-review → hf-traceability-review → hf-regression-gate（任务级 sanity） → hf-completion-gate`
- 评审 / 验证证据落到 `docs/reviews/*-T<id>.md` 与 `docs/verification/*-T<id>.md`

### Increment 级（T57 ~ T63 全部完成后）
- `hf-regression-gate`：执行 NFR-001 性能 micro-bench（`/studio/admin/works` SSR + audit list SSR P95 ≤ 80ms 在 500 works + 200 audit 规模下）；记录到 `docs/verification/regression-gate-phase2-ops-backoffice-v1.md`。
- `hf-completion-gate`：聚合所有任务证据 + Increment 级 NFR / CON 闭合声明。
- `hf-finalize`：更新 `RELEASE_NOTES.md`、`docs/ROADMAP.md` §3.2 标记 V1 已交付、`README.md` 功能完成度概览同步、`task-progress.md` 工作项与 Completed Tasks 同步。

## 8. 当前活跃任务选择规则

- 默认按 §6 拓扑顺序选 ready 集合首项。
- 当任务 completion-gate 通过：
  1. 移到 `Completed Tasks`，清空 `Current Active Task`
  2. 重新扫描所有 `pending` 任务依赖，将依赖全部 `Completed` 的标记为 `ready`
  3. ready 集合按 `Selection Priority` 升序选第一个作为新 `Current Active Task`
  4. ready 集合空且无 `pending` → 进入 Increment-level `hf-regression-gate`
- ready 集合多候选时由 `hf-workflow-router` 按 priority + 依赖图权威决定。

## 9. 任务队列投影视图

| Task | Status | Depends On | Priority | Acceptance Headline |
| --- | --- | --- | --- | --- |
| T57 | ready | — | 1 | env + Session.email + CommunityWorkStatus.moderated + MetricsSnapshot.admin + audit_log schema + bundle 接口扩展 + withTransaction |
| T58 | pending | T57 | 2 | createAdminCapabilityPolicy / createAdminGuard / runAdminAction + getRequestAccessControl 自动注入 |
| T59 | pending | T57, T58 | 3 | curation 3 server actions + /studio/admin/curation page + audit append + counter |
| T60 | pending | T57, T58 | 4 | work hide/restore server actions + /studio/admin/works page + 5 公开 surface moderated 屏蔽闭环 |
| T61 | pending | T57, T58, (T59 ∪ T60) | 5 | /studio/admin/audit page 渲染最近 100 条 |
| T62 | pending | T57 | 6 | owner-side /studio/works moderated 三态 + 抑制按钮 + work-editor 拒绝 owner 自助恢复 (I-14) |
| T63 | pending | T58, T59, T60, T61 | 7 | /studio/admin dashboard + /studio 主页 admin 入口卡（条件渲染） |

## 10. 风险与顺序说明

- **R-1**：`T57` 的 `SessionContext.email` 扩展会让所有解构 session 的代码路径与所有 `createAuthenticatedSessionContext` / `resolveSessionContext` 调用点都需要同步补字段。缓解：`T57` 测试范围内一次性更新所有调用点（含 `auth-store.test.ts` / `actions.test.ts` / 各 page test）；TypeScript strict 严格模式会引导。
- **R-2**：`T57` 的 `CommunityWorkStatus.moderated` 加入会让既有 `work.status === "published" ? ... : ...` 二态判断变得不完备。缓解：在 `T57` 仅扩展 type union；在 `T60` 集成测试覆盖所有公开 surface 的 moderated 屏蔽；在 `T62` 修复 owner-side `/studio/works` 三态。其他公开 surface 已通过 `getPublicWorkRecords` 单点 filter 自动屏蔽。
- **R-3**：`T58` `runAdminAction` 与既有 `wrapServerAction` 的双 log 表面看似冗余。缓解：设计 §12 已显式认领；评审在 traceability-review 显式核对每个 server action 的两条 log。
- **R-4**：`T59` / `T60` 的 admin server action 需要在 sqlite tx 中调用 `bundle.works.save` / `bundle.curation.upsertSlot` / `bundle.audit.record`。缓解：`T57` 已实现 `withTransaction`；`runAdminAction` 在 in-memory bundle 的 noop 等价由 `T58` 的测试覆盖；sqlite 端的真实 tx rollback 由 `T57` 的 `sqlite.test.ts` 覆盖（业务写抛错 → audit 不写）。
- **R-5**：`T62` 修改 `resolveNextVisibility` 抛 AppError 可能让既有 `T28` work_editor 测试漂移。缓解：在 `T62` 测试设计阶段先跑既有套件取 baseline；再补 moderated 三 intent throw 用例；保持 published/draft 路径不变。
- **R-6**：NFR-001 P95 ≤ 80ms 的 micro-bench 留给 increment-level regression-gate；如果在 CI 上偶发不稳定，将断言改为 P99 ≤ 120ms 的更宽松边界（仍在设计预算内）；不要降级 SQL 实现来"通过"测试。

## 11. 修订记录

- 2026-04-19：起草。
