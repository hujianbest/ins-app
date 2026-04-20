# Increment: Phase 2 — Threaded Messaging V1

- Date: `2026-04-19`
- Theme: Phase 2 — Threaded Messaging V1（线程式消息中心 V1）
- Source of truth: `docs/ROADMAP.md` §3.3；§4 优先级 2「§3.2 运营后台 V1 → §3.3 线程式消息中心」
- Execution Mode: `auto`

## 变更摘要

- 变更摘要：在 `Lens Archive` 完成阶段 1 + Discovery Quality + Observability & Ops V1 + Discovery Intelligence V1 + Ops Back Office V1 之后，启动 ROADMAP §3.3 的第一块独立可交付：**Threaded Messaging V1**。把当前散落在 `cookie` 上的 "contact threads"（见 `web/src/features/contact/state.ts`）+ 单线性 `/inbox` 升级为：
  - 持久化的 `Thread` / `Message` / `Participant` 三表 schema（`node:sqlite` + 既有 `community/sqlite.ts` 模式）；
  - 多线程 `/inbox` 列表 + `/inbox/[threadId]` 单线程详情页；
  - 创作者间一对一对话 + 真实消息发送 + 未读计数 + 最近活动排序；
  - 系统通知（关注、评论 @、外链 handoff 回执）三类入站统一展示在 `/inbox` 系统区段；
  - 既有 `startContactThreadAction` 的 cookie-only 入口无损迁移到新的 `createOrFindThread` server action（旧 cookie 被 dropped；既有 `/inbox` UI 入口保留 + 升级，public surface 行为零变化）。
- 当前判断：真实 increment（新增需求 / 新规格 / 新设计 / 新任务计划），不是 hotfix、不是范围澄清。
- 影响级别：medium-large（新 sqlite tables + 新 server actions + 新 SSR 路由集 + 既有 `contact/*` 模块迁移）。

## 基线快照

- `Workflow Profile`：`full`（新增 schema + 新 UI surface + 新 server action 集 + 既有 contact 模块迁移；ROADMAP §3.3 显式列入 full profile）
- `Current Stage`：post-finalize → 进入 `hf-increment` → 即将转 `hf-specify`
- `Current Active Task`：`None（T57-T63 已 finalized）`
- `Pending Reviews And Gates`：`None`
- `Worktree Path`：`/workspace`（in-place）
- `Worktree Branch`：`cursor/phase2-threaded-messaging-v1-3dd4`

## 变更包

- New
  - 新 SQLite 表三件套：
    - `message_threads`：`id` / `kind`（`direct` / `system_notification`）/ `subject` / `context_ref`（如 `work:<id>` / `profile:<role>:<slug>` / `opportunity:<id>` / null）/ `created_at` / `last_message_at`。
    - `message_thread_participants`：`thread_id` / `account_id` / `role`（`owner` / `participant`）/ `joined_at` / `last_read_at`（用于未读计数）。
    - `messages`：`id` / `thread_id` / `author_account_id`（system 通知为 `null`）/ `kind`（`text` / `system_notification`）/ `body`（最大 4000 字符）/ `created_at`。
  - 新 feature 模块 `web/src/features/messaging/`：
    - `types.ts`：`MessageThread` / `Message` / `ThreadParticipant` / `SystemNotificationKind` / `ThreadKind` 等类型。
    - `messaging-repository.ts`：`MessageThreadRepository` / `MessageRepository` / `ParticipantRepository` 接口扩展进 `CommunityRepositoryBundle.messaging`。
    - `thread-resolver.ts`：纯函数 `findOrCreateDirectThread(initiatorAccountId, recipientAccountId, contextRef)`、未读计数、最近活动排序。
    - `system-notifications.ts`：把既有 `follow` / `comment` / `external_handoff_click` 三类 discovery 事件聚合为系统通知列表（read-only adapter，不在本 V1 持久化系统通知；从已有事件实时派生）。
    - `thread-actions.ts`：`createOrFindDirectThread(recipientAccountId, contextRef?)` / `sendMessage(threadId, body)` / `markThreadRead(threadId)` 三个 server actions（全部经 `wrapServerAction`）。
    - `metrics.ts` + `index.ts` + `test-support.ts`。
  - 新路由：
    - `/inbox`：升级为 thread 列表（直接消息 + 系统通知两段；未读 badge + 最近活动排序）。
    - `/inbox/[threadId]`：单线程详情（消息时间线 + 发送表单；进入即 `markThreadRead`）。
    - `/inbox?source=...&recipient=...`：可选 deep-link 入口（公开页面联系按钮跳转用）。
  - 新事件：`messaging.thread_created` / `messaging.message_sent` / `messaging.thread_read`（沿用既有 `discovery_events` 表，不新增表）。
  - 新 metrics 命名空间（加性扩展）：`MetricsSnapshot.messaging.{threads_created, messages_sent, threads_read, system_notifications_listed}`，4 counter。
  - 客户端轮询：`/inbox/[threadId]` 单线程详情每 30 秒 `useEffect` polling 触发 SSR re-fetch（V1 不引入 SSE / WebSocket）。

- Modified
  - `web/src/features/community/types.ts`：`CommunityRepositoryBundle.messaging` 加性扩展。
  - `web/src/features/community/sqlite.ts`：3 张新表 schema + 3 个 repository 实现。
  - `web/src/features/community/test-support.ts`：in-memory bundle 增加 `messaging` 数组实现。
  - `web/src/features/contact/actions.ts`：`startContactThreadAction` 由"cookie thread"改为 `createOrFindDirectThread` 调用（语义保留：guest → /login + 失败事件；authenticated → 落 sqlite + 重定向 `/inbox/[threadId]`）。
  - `web/src/features/contact/state.ts`：`getInboxThreadsForRole` 改为消费 `bundle.messaging.listThreadsForAccount`（cookie 字段 deprecated，迁移期间允许同时读 cookie 但不再写 cookie；V1 之后 cookie 字段移除）。**实际选择**：直接删除 cookie 路径，未发送过消息的"伪 thread"不迁移（cookie thread 没有消息体，价值低），从 `startContactThreadAction` 起所有 thread 都走 sqlite。
  - `web/src/app/inbox/page.tsx`：升级为 thread 列表 + 系统通知段。
  - `web/src/features/observability/metrics.ts`：`MetricsSnapshot.messaging` 加性扩展。

- Deprecated
  - `contactThreadsCookieName` cookie：本 V1 不再写入；启用一次的旧 cookie 可保留（不读、不显示），后续 slice 在用户下次清缓存时自然消失。
  - `web/src/features/contact/state.ts > parseContactThreads / serializeContactThreads / buildContactThread / upsertContactThread`：纯 cookie 路径全部删除（new sqlite path replaces semantics）。
  - `web/src/features/contact/state.ts > getInboxThreadsForRole`：保留函数名但实现迁移到 sqlite；签名不变以避免下游 page 大改。

## 影响矩阵

- 受影响工件
  - 新增 SRS / Design / Tasks 三套 + reviews + approvals
  - `web/src/features/messaging/*`、`web/src/features/contact/*`、`web/src/features/community/{types,sqlite,test-support}.ts`、`web/src/features/observability/metrics.ts`
  - `web/src/app/inbox/{page,page.test}.tsx` + `web/src/app/inbox/[threadId]/{page,page.test}.tsx`（新）
  - `task-progress.md`、`RELEASE_NOTES.md`、`docs/ROADMAP.md` §3.3、`README.md` finalize 阶段同步

- 失效的批准状态：无（前置增量工件保持有效；本 increment 为新主题）
- 失效的任务 / `Current Active Task`：无（无在途任务）
- 失效的测试设计 / 验证证据 / review 结论：无
- 需重新派发的 reviewer / review 节点：本 increment 自身按 full profile 走 `hf-spec-review` → `hf-design-review` + `hf-ui-review`（含 inbox UI surface） → `hf-tasks-review` → 每任务的 `hf-bug-patterns/hf-test-review/hf-code-review/hf-traceability-review` → `hf-regression-gate` → `hf-completion-gate` → `hf-finalize`
- Profile 升级信号：无；保持 `full`

## 同步更新项

- 已更新工件
  - 创建本变更记录：`docs/reviews/increment-phase2-threaded-messaging-v1.md`
  - 创建本地工作分支：`cursor/phase2-threaded-messaging-v1-3dd4`

- 已回写内容
  - `task-progress.md`：将由 spec 起草时一并同步

- 明确不做的内容
  - 不做富文本与附件（依赖 §3.1 对象存储；V2 评估）。
  - 不做群聊 / 多方协作线程（V1 严格一对一）。
  - 不做实时性 SSE / WebSocket（V1 仅 30s 客户端轮询，server-side SSR）。
  - 不做通知偏好设置 / 通知静音 / push（V2 评估）。
  - 不做消息内容审核 / rate limit（与 §3.2 V2 举报队列一起做）。
  - 不在 admin 后台暴露线程内容（隐私边界，I-N 锁定）。
  - 不引入新外部 npm 依赖；继续用 `node:sqlite` + Next.js App Router。

## 待同步项

- 工件：`task-progress.md`
  - 原因：本步只产出 increment 记录；规格起草后将一并把 `Current Stage / Current Spec / Pending Reviews / Next Action` 同步
  - 建议动作：在 `hf-specify` 完成草稿后回写

- 工件：`RELEASE_NOTES.md`、`docs/ROADMAP.md` §3.3、`README.md`
  - 原因：finalize 阶段才会追加 release section / 标记 V1 / 更新概览
  - 建议动作：`hf-finalize` 时同步

## 状态回流

- `Current Stage`：`hf-specify`
- `Workflow Profile`：`full`
- `Current Active Task`：`pending reselection`（任务计划批准前不指派活跃任务）
- `Pending Reviews And Gates`：`hf-spec-review`、`hf-design-review`、`hf-ui-review`、`hf-tasks-review`
- `Next Action Or Recommended Skill`：`hf-specify`
