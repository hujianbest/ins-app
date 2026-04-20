# Phase 2 — Threaded Messaging V1 任务计划

- 状态: 已批准
- 批准记录: `docs/verification/tasks-approval-phase2-threaded-messaging-v1.md`
- 主题: Phase 2 — Threaded Messaging V1
- 输入规格: `docs/specs/2026-04-19-threaded-messaging-v1-srs.md`（已批准）
- 输入设计: `docs/designs/2026-04-19-threaded-messaging-v1-design.md`（已批准，含 §10 UI 设计 + §1 ID 空间假设）
- 关联 review / approval: `docs/reviews/{spec-review,design-review,ui-review,tasks-review}-phase2-threaded-messaging-v1.md` + `docs/verification/{spec,design,tasks}-approval-phase2-threaded-messaging-v1.md`
- 当前活跃任务: `T64`（cross-cutting skeleton）

## 1. 概述

把已批准设计拆为 **6 个可独立 fail-first 推进的任务**（`T64` ~ `T69`），覆盖：

- 横切骨架：3 表 schema + 3 repository（sqlite + in-memory）+ `bundle.messaging` + `MetricsSnapshot.messaging` + `AllowedContextKey` 扩展 + `messaging/{types,identity,context-link,metrics,index,test-support}` 模块骨架（`T64`）
- thread-resolver / runtime / 3 server actions（`T65`）
- inbox-model + system-notifications + `inbox-thread-view` SSR helper（`T66`）
- `/inbox` 升级（直接消息 + 系统通知 + 错误 alert）（`T67`）
- `/inbox/[threadId]` 详情页 + 30s `<InboxThreadPoll />` 客户端组件（`T68`）
- `startContactThreadAction` 迁移 + `contact/state.ts` cookie 工具删除 + 既有 page tests 适配（`T69`）

每任务遵循 `web/AGENTS.md` 的 fail-first 节奏：写测试 → 跑 → 红 → 实现 → 跑 → 绿 → 跑 `npm run test / typecheck / lint / build` 全绿。

## 2. 里程碑

### M1 横切骨架（`T64`）

- 目标：3 表 schema + 3 repository（sqlite + in-memory 等价）+ `CommunityRepositoryBundle.messaging` 加性扩展 + `MetricsSnapshot.messaging` 加性扩展（4 counter 启动预注册全 0）+ `AllowedContextKey` 加 `threadId` / `recipientAccountId` + `messaging/{types,identity,context-link,metrics,index,test-support}.ts` 骨架 + 不变量单测。
- 退出标准：`cd web && npm run test / typecheck / lint / build` 全绿；既有 baseline 不漂移。

### M2 Resolver + Runtime + Server Actions（`T65`）

- 目标：`messaging/thread-resolver.ts` 纯函数 + `messaging/runtime.ts > runMessagingAction` helper（含 tx 包裹 + double log）+ 3 server actions（`createOrFindDirectThread` / `sendMessage` / `markThreadRead`）+ form-action wrappers + 单测。
- 退出标准：3 server action 在 in-memory bundle 上 happy + 全部 7 错误码路径覆盖；vitest 子集全绿。

### M3 Inbox model + System notifications + SSR helper（`T66`）

- 目标：`messaging/inbox-model.ts > listInboxThreadsForAccount`（委托 bundle）+ `messaging/system-notifications.ts > listSystemNotificationsForAccount`（聚合 discovery_events + work_comments）+ `messaging/inbox-thread-view.ts > loadInboxThreadView` SSR 4 步入口 helper + 单测。
- 退出标准：3 helper 在 in-memory bundle 上 happy + 边界全绿。

### M4 `/inbox` 升级（`T67`）

- 目标：`/inbox` 升级为直接消息段 + 系统通知段 + ?error= alert + 空态文案；非破坏性接管既有 SSR。
- 退出标准：guest redirect / 双段空 / 双段非空 / ?error= alert 4 case 全绿。

### M5 `/inbox/[threadId]` 详情 + 30s 轮询（`T68`）

- 目标：`/inbox/[threadId]` SSR + `InboxThreadPoll` client component + 表单 `sendMessageForm` / SSR-side markRead + ?error= alert。
- 退出标准：guest redirect / non-participant 404 / participant 渲染 + markRead / 表单提交 happy + error redirect / poll 组件不持有数据 5 case 全绿。

### M6 contact 迁移（`T69`）

- 目标：`startContactThreadAction` 改写为调 `createOrFindDirectThread`；删除 cookie 工具（`parseContactThreads` / `serializeContactThreads` / `buildContactThread` / `upsertContactThread` / `contactThreadsCookieName`）；`getInboxThreadsForRole` 委托 bundle.messaging（返回类型变化由 T67 一并消费）；既有公开 page tests 不漂移；contact/actions tests 全部更新覆盖新行为。
- 退出标准：既有所有公开页面联系按钮路径不变 + `actions.test.ts` happy/guest/recipient_not_found/invalid_self_thread 4 case 全绿；`/inbox` page test 兼容新返回形态。

## 3. 文件 / 工件影响图

### 新增

- `web/src/features/messaging/{types,identity,context-link,metrics,index,test-support}.ts`（T64 骨架）
- `web/src/features/messaging/{thread-resolver,runtime,thread-actions}.ts(.test.ts)`（T65）
- `web/src/features/messaging/{inbox-model,system-notifications,inbox-thread-view}.ts(.test.ts)`（T66）
- `web/src/features/messaging/perf.bench.test.ts`（T70 即 increment regression-gate 阶段补；T64 不需要）
- `web/src/app/inbox/[threadId]/page.tsx` + `page.test.tsx` + `poll-client.tsx`（T68）
- 各任务 8 文件评审 / 验证全套：`docs/{verification,reviews}/*-T64..T69.md`
- Increment-level: `regression-gate-phase2-threaded-messaging-v1.md` / `completion-gate-...` / `finalize-...` / `release-notes-...`

### 修改

- `web/src/features/community/types.ts`（messaging 接口加性扩展 + 类型；CommunityRepositoryBundle 加 messaging 字段）— T64
- `web/src/features/community/sqlite.ts` + `sqlite.test.ts`（3 表 schema + 索引 + 3 repository impl）— T64
- `web/src/features/community/test-support.ts`（in-memory messaging 实现）— T64
- `web/src/features/observability/metrics.ts` + `metrics.test.ts`（messaging namespace 加性扩展）— T64
- `web/src/features/observability/logger.ts`（AllowedContextKey 增加 threadId / recipientAccountId）— T64
- `web/src/features/contact/actions.ts` + `actions.test.ts`（迁移）— T69
- `web/src/features/contact/state.ts`（删 cookie 工具；getInboxThreadsForRole 重写）— T69
- `web/src/app/inbox/page.tsx` + `page.test.tsx`（升级）— T67
- `task-progress.md` / `RELEASE_NOTES.md` / `docs/ROADMAP.md` §3.3 / `README.md`（finalize）

## 4. 需求与设计追溯

| 上游 | 落地任务 |
|---|---|
| FR-001 三表 schema + 3 repository | T64 |
| FR-002 createOrFindDirectThread + unordered pair dedupe | T65（server action） + T64（repository） |
| FR-003 sendMessage | T65 |
| FR-004 markThreadRead | T65（server action） + T68（SSR-side markRead 路径） |
| FR-005 /inbox 列表 + 未读 + 系统通知 | T66（model）+ T67（SSR + UI）|
| FR-006 /inbox/[threadId] + 30s polling | T66（loadInboxThreadView helper）+ T68（page + poll-client）|
| FR-007 startContactThreadAction 迁移 | T69 |
| FR-008 messaging.* metrics + 隐私边界 | T64（namespace + key 常量）+ T65/T68（counter 调用）+ T69（contact 路径不在 admin 后台）|
| NFR-001 性能 | Increment-level regression-gate（micro-bench 在 T70 即 regression-gate 阶段写）|
| NFR-002 隐私 | T64（types + bundle）+ T65（participant guard）+ T66/T68（SSR 4 步顺序）|
| NFR-003 logger 受控键扩展 | T64 |
| NFR-004 deps 注入 | 全部任务 |
| NFR-005 既有 contact / page 行为不变 | T69（startContactThreadAction 签名稳定）|
| 设计 ADR-1..6 + UI-ADR-1..5 | 见各任务 acceptance |
| 设计 I-1..I-12 + A-007 | 见各任务 acceptance |

## 5. 任务拆解

### T64. Cross-Cutting Skeleton（messaging types + 3 表 schema + repositories + metrics + logger + module skeleton）

- 目标：建立 messaging 模块全部跨切契约，无业务 IO。
- Acceptance:
  - `web/src/features/community/types.ts` 加 `ThreadKind` / `MessageKind` / `ParticipantRole` / `MessageThreadRecord` / `MessageThreadParticipantRecord` / `MessageRecord` / `CreateDirectThreadInput` / `AppendMessageInput` / `InboxThreadProjection` / 3 repository 接口 / `MessagingRepositoryBundle` / `CommunityRepositoryBundle.messaging` 字段。
  - `web/src/features/community/sqlite.ts` 加 3 表 + 3 索引（与设计 §9.2.1 对齐）+ 3 repository 实现（含 unordered pair dedupe SQL §9.2.2 + listForAccount 未读聚合 §9.2.3 + getUnreadCountForAccount）。`stmt.get(contextRef ?? null, contextRef ?? null, accountA, accountB)` 绑定契约严格遵守。
  - `web/src/features/community/test-support.ts` in-memory bundle 加 messaging 数组实现（threads / participants / messages），unordered pair dedupe 等价 + listForAccount 未读语义等价（含 `author_account_id <> currentAccount` 排除）+ getUnreadCountForAccount 等价。
  - **R-1（既有调用方零修改）**：`createInMemoryCommunityRepositoryBundle({...})` 在不传 `messaging` 入参时**自动初始化空 messaging**（threads / participants / messages 各 `[]`，audit 同形）；既有所有 community / admin / recommendations 测试调用零改即可继续访问 `bundle.messaging.{threads,messages,participants}` 的空实现。
  - **R-2（baseline isDatabaseEmpty 不漂移）**：`web/src/features/community/sqlite.ts > isDatabaseEmpty` 的检查项**不**计入 `message_threads` / `message_thread_participants` / `messages` 三张新表；当数据库只含 messaging 表（无业务行）时 `isDatabaseEmpty()` 仍返回 `true`，与 §3.2 / §3.6 / §3.8 V1 末状态一致。
  - **I-6（admin 模块零耦合反向断言）**：测试种子追加一条字符串扫描：`features/admin/**` + `app/studio/admin/**` 全部源文件（不含 .test）grep `bundle.messaging` / `messaging.threads` / `messaging.messages` / `messaging.participants` 应**0 命中**；该断言放在 T64 测试套件中（admin 模块从未导入 messaging）。
  - `web/src/features/observability/metrics.ts` 加 `MessagingSnapshot` 类型 + `MetricsSnapshot.messaging` **必填**字段 + `MESSAGING_COUNTER_NAMES` 4 项预注册全 0 + snapshot 输出 messaging 字段（与 admin / recommendations namespace 同形）。
  - `web/src/features/observability/logger.ts > AllowedContextKey` 加 `threadId` / `recipientAccountId` 两个键。
  - `web/src/features/messaging/{types,identity,context-link,metrics,index,test-support}.ts` 骨架：
    - `types.ts` re-export community types。
    - `identity.ts` 实现 `resolveCallerProfileId(session)`。
    - `context-link.ts` 实现 `buildContextSourceLink(contextRef)` 纯函数（4 态映射）。
    - `metrics.ts` 4 helpers (`incrementThreadsCreated` / `incrementMessagesSent` / `incrementThreadsRead` / `incrementSystemNotificationsListed`) + `MESSAGING_COUNTER_NAMES` 常量。
    - `test-support.ts` 提供 `createMessagingTestDeps` (fake bundle + capturing logger + metrics 注入)。
- 测试种子：sqlite.test 覆盖 schema 存在 + dedupe SQL 双向 / null contextRef / 同 contextRef / kind=direct；listForAccount 含未读聚合（排除 self-authored 消息）+ COALESCE 排序；in-memory test 同形等价；metrics zero state；logger key 扩展；`identity.test` 覆盖两个 role；`context-link.test` 覆盖 4 态；**R-1**: `createInMemoryCommunityRepositoryBundle({ profiles, works, curation })` 不传 messaging 入参时 `bundle.messaging.threads.listThreadsForAccount(...)` 返回 `[]`（不抛 error）；**R-2**: 创建一个空 sqlite bundle 后 `isDatabaseEmpty()` 返回 `true`（baseline 行为不变）；**I-6**: 对 `features/admin/` + `app/studio/admin/` 子树做字符串扫描断言，关键词 `bundle.messaging` / `messaging.threads` / `messaging.messages` / `messaging.participants` 命中 0 次。
- Verify: `cd web && npm run test && npm run typecheck && npm run lint && npm run build`。
- 依赖: 无（首项）。Selection Priority: 1。

---

### T65. Resolver + Runtime + Server Actions

- 目标：3 个 server action + runtime helper + thread-resolver 纯函数。
- Acceptance:
  - `messaging/thread-resolver.ts` 纯函数（unordered pair 匹配候选过滤、self-thread 拒绝、findOrCreate 顺序）。
  - `messaging/runtime.ts > runMessagingAction` 实现：guest 抛 `unauthenticated`；fn 在 `bundle.withTransaction` 包裹内执行；成功写 `messaging.action.completed` info log（含 `module="messaging"` / `actionName` / `durationMs` / 可选 `threadId`），失败写 warn log + 抛错；deps 全注入；动态 import session / bundle 默认（沿用 §3.2 V1 admin runtime 同形）。
  - `messaging/thread-actions.ts > createOrFindDirectThread` / `sendMessage` / `markThreadRead`：每个 server action 经 `wrapServerAction` 包装；内部调用 `runMessagingAction`；用 `resolveCallerProfileId(session)` 拿身份键；participant guard 前置；正确的 AppError code（spec §8.3 错误码字典）；counter 在 fn 内业务写之后递增。
  - 3 form-action wrappers (`sendMessageForm` / `markThreadReadForm` / `createOrFindDirectThreadForm`) 在同 `'use server'` 文件末尾导出，捕获 AppError 后 redirect `?error=<code>` 到对应页面。
- 测试种子：每个 server action × happy / forbidden / invalid input / 7 错误码路径；`createOrFindDirectThread` 重复同 contextRef 与反向 dedupe；`sendMessage` body trim/empty/too-long；`markThreadRead` non-participant；tx atomicity (业务写抛错 → 后续动作不发生)；double log 形态断言；counter 仅 happy 路径递增。
- Verify: 同 T64。
- 依赖: T64。Selection Priority: 2。

---

### T66. Inbox model + System notifications + SSR helper

- 目标：3 个读侧 helper（model + system notif + inbox-thread-view），全部纯函数 / async data-only，不渲染 UI。
- Acceptance:
  - `messaging/inbox-model.ts > listInboxThreadsForAccount(accountId, limit, deps?)`：委托给 `bundle.messaging.threads.listThreadsForAccount(accountId, limit)`；返回 `InboxThreadProjection[]`；deps 注入；不计 metric。
  - `messaging/system-notifications.ts > listSystemNotificationsForAccount(accountId, limit, deps?)`：聚合 follow / external_handoff_click（discovery_events）+ comment（work_comments JOIN works WHERE owner_profile_id = ?）；归并按 `createdAt desc` + slice(0, limit)；counter `incrementSystemNotificationsListed(metrics)` 递增 1（每次调用算一次）；in-memory bundle 等价见 §9.6 §9.3 注解。
  - `messaging/inbox-thread-view.ts > loadInboxThreadView(threadId, session, deps?)` SSR 入口 4 步 helper：
    1. session.status guest → 抛 `redirect("/login")` (Next 控制流；用 next/navigation `redirect`，本 helper 直接 throw + 让 page boundary 接管)。
    2. participant guard：`bundle.messaging.participants.listForThread(threadId)` → 当前 callerProfileId 不在内 → 抛 `notFound()`。
    3. SSR-side markRead: 直接 `bundle.messaging.participants.markRead(threadId, callerProfileId, now)` + logger.info `messaging.action.completed { module: messaging, actionName: messaging/markThreadRead.ssr, threadId }`，**不**递增 counter。
    4. fetch thread + messages + 对方 callerProfileId + return `{ thread, messages, participants, counterpartProfileId, callerProfileId }`。
- 测试种子：inbox-model happy + 空；system-notifications 三种事件类型聚合 + self-comment 排除 + 时间倒序 + limit；`loadInboxThreadView` 4 步顺序 + guest/non-participant fail 前 markRead 未发生（spy assertion）+ logger info 写入但 counter 不变。
- Verify: 同 T64。
- 依赖: T64 + T65（runtime + tx; 但 helper 内不强制走 wrap，可直接调 bundle）。Selection Priority: 3。

---

### T67. `/inbox` 升级

- 目标：`/inbox` 升级为直接消息段 + 系统通知段 + ?error= alert。
- Acceptance:
  - `app/inbox/page.tsx`：SSR async server component；guest → `redirect("/login")`；解析 `searchParams.error` → ErrorAlert（按设计 §10.4 完整 7 行 ERROR_COPY 表）；`Promise.all([listInboxThreadsForAccount, listSystemNotificationsForAccount])`；渲染上下两段。
  - 直接消息段：`SectionHeading(eyebrow="对话", title="消息")` + thread 卡片网格；每卡 h3 对方 displayName（V1 直接显示 callerProfileId 形态 `${role}:${slug}`，V2 评估查 profile.name）+ context tag（museum-tag，文案由 `buildContextSourceLink` 生成）+ 时间戳 `<time>` + 未读 badge（`museum-tag` 容器 + 数字 + sr-only "未读"）+ 整卡 link `/inbox/[threadId]`。
  - 系统通知段：`<ul>/<li>` + `museum-stat` 卡片样式；3 类标签 + 来源链接 + `<time>`。
  - 空态：直接消息空 / 系统通知空 / 双段都空 三态文案。
  - `metadata.robots = { index: false, follow: false }`。
- 测试种子：guest redirect → /login；admin user 渲染（仅看自己的 inbox，不接触 admin 后台 messaging）；空态 / 双段非空 / `?error=invalid_self_thread` alert / `?error=forbidden_thread` alert；DOM 中 unread badge 显示数字 + sr-only 文本；**counter 边界**：admin 渲染 1 次 → `messaging.system_notifications_listed` +1（含双段都空场景仍递增）；guest redirect 路径 → counter 不变。
- Verify: 同 T64。
- 依赖: T66。Selection Priority: 4。

---

### T68. `/inbox/[threadId]` 详情 + 30s polling

- 目标：`/inbox/[threadId]` 详情 + `<InboxThreadPoll />` client component + 表单 + ?error= alert。
- Acceptance:
  - `app/inbox/[threadId]/page.tsx`：SSR async server component；调 `loadInboxThreadView(threadId, session)`（T66 helper）→ 渲染。`PageHero(eyebrow="对话", title=<对方 callerProfileId>, supporting=<context source link via buildContextSourceLink>, tone="utility")` + 顶部 ErrorAlert（如有）+ 单 `museum-panel museum-panel--soft` 容器：消息时间线（自己消息 `ml-auto` flex / 对方靠左）+ 发送表单 `<form action={sendMessageForm}>`（hidden threadId + textarea name="body" maxLength=4000 + 「发送」museum-button-primary）+ `<InboxThreadPoll intervalMs={30_000} />` 末尾挂载。`metadata.robots = noindex,nofollow`。
  - `app/inbox/[threadId]/poll-client.tsx`：`'use client'`；`useEffect(() => setInterval(() => router.refresh(), intervalMs), [router, intervalMs]) + cleanup`；返回 `null`；不接受 thread / message data props（仅 `intervalMs?: number`）。
  - 错误码 alert 按 §10.4 表渲染。
- 测试种子：guest → /login；non-participant → notFound；participant 渲染消息时间线 + 表单 + alert（按 ?error）；`<InboxThreadPoll />` 不持有数据（props 仅 intervalMs）；客户端 mount 后 `router.refresh` 间隔 30s（用 fake timer 验证）。
- Verify: 同 T64。
- 依赖: T66。Selection Priority: 5（与 T67 可并行；按 priority 升序选 T67 先；并行授权由 router 决定）。

---

### T69. `startContactThreadAction` 迁移 + cookie 删除 + getInboxThreadsForRole 重写

- 目标：把 `features/contact/*` 完全切到 messaging；删除 cookie 工具；`getInboxThreadsForRole` 返回新 projection 类型；既有公开页面联系按钮零回归。
- Acceptance:
  - `features/contact/actions.ts > startContactThreadAction` 改写：guest path 不变（写 failed event + redirect /login）；authenticated path 解析 recipient profile by `getByRoleAndSlug` → 失败 redirect `/inbox?error=recipient_not_found` + failed event；成功调 `createOrFindDirectThread(recipient.id, contextRef)` → success event + redirect `/inbox/[threadId]`；catch `invalid_self_thread` 时 redirect `/inbox?error=invalid_self_thread`。signature `(recipientRole, recipientSlug, sourceType, sourceId)` 不变。
  - `features/contact/state.ts`：删除 `parseContactThreads` / `serializeContactThreads` / `buildContactThread` / `upsertContactThread` / `contactThreadsCookieName`；`getInboxThreadsForRole(role)` 返回 `InboxThreadProjection[]`（实现：解析 session → callerProfileId → `bundle.messaging.threads.listThreadsForAccount(callerProfileId, 100)`）；`ContactSourceType` / `ContactThread` 类型若不再被消费可删除（V1 保留 `ContactSourceType` 给 `actions.ts`，`ContactThread` 删除）。
  - `features/contact/actions.test.ts`：4 case 覆盖（guest / recipient_not_found / invalid_self_thread / happy）；mock createOrFindDirectThread。
  - 既有公开页面 page tests（profile / work / opportunity 的联系按钮 form action 调用形态）零修改 → 全部继续绿。
- 测试种子：见 acceptance；额外断言旧 cookie name 全仓不再 import。
- Verify: 同 T64；额外 `rg "contactThreadsCookieName" web/src` 应空。
- 依赖: T64, T65, T66, T67（与 T68 互不依赖；page test 兼容新返回形态需 T67 已上线 inbox page 重写；与 §6 / §9 拓扑表完全一致）。Selection Priority: 6（最后任务）。

## 6. 依赖与关键路径

```
T64 (Skeleton)
 └── T65 (Resolver + Runtime + Server Actions)
      └── T66 (Inbox model + System notif + SSR helper)
           ├── T67 (/inbox 升级)
           ├── T68 (/inbox/[threadId])
           └── T69 (contact 迁移)  ←  also depends on T67 for page test compat
```

关键路径：T64 → T65 → T66 → (T67 ∥ T68) → T69（T69 严格依赖 {T64, T65, T66, T67}；与 T68 互不依赖）。

## 7. 完成定义与验证策略

### 任务级
- fail-first 测试 → 红 → 实现 → 绿
- `cd web && npm run test && npm run typecheck && npm run lint && npm run build` 全 exit 0
- 评审链：`hf-bug-patterns → hf-test-review → hf-code-review → hf-traceability-review → hf-regression-gate(任务级 sanity) → hf-completion-gate`

### Increment 级（T64 ~ T69 全部完成后）
- `hf-regression-gate`：执行 NFR-001 性能 micro-bench（`messaging/perf.bench.test.ts` 在 500 thread + 200 messages + 500 events 规模，断言 P95 ≤ 120ms）；记录到 `docs/verification/regression-gate-phase2-threaded-messaging-v1.md`。
- `hf-completion-gate`：聚合所有任务证据 + Increment 级 NFR / CON 闭合声明。
- `hf-finalize`：更新 `RELEASE_NOTES.md`、`docs/ROADMAP.md` §3.3 标记 V1 已交付、`README.md` 功能完成度概览同步、`task-progress.md` 工作项与 Completed Tasks 同步。

## 8. 当前活跃任务选择规则

- 默认按 §6 拓扑顺序选择第一个 `ready` 任务作为 `Current Active Task`。
- 当任务 completion-gate 通过：移到 `Completed Tasks`、清空 `Current Active Task`、重新扫描依赖、ready 集合按 priority 升序选首项。
- 若 `T67 ∥ T68` 同时 ready，按 priority（4 < 5）选 T67 先；并行授权由 router 决定。

## 9. 任务队列投影视图

| Task | Status | Depends On | Priority | Acceptance Headline |
|---|---|---|---|---|
| T64 | ready | — | 1 | 3 表 schema + 3 repository (sqlite + in-memory) + bundle.messaging + MetricsSnapshot.messaging + AllowedContextKey + module skeleton |
| T65 | pending | T64 | 2 | thread-resolver + runMessagingAction + 3 server actions + form wrappers |
| T66 | pending | T64, T65 | 3 | listInboxThreadsForAccount + listSystemNotificationsForAccount + loadInboxThreadView SSR helper |
| T67 | pending | T64, T66 | 4 | /inbox 升级（直接消息 + 系统通知 + ?error= alert） |
| T68 | pending | T64, T66 | 5 | /inbox/[threadId] 详情 + InboxThreadPoll client + form |
| T69 | pending | T64, T65, T66, T67 | 6 | startContactThreadAction 迁移 + cookie 删除 + getInboxThreadsForRole 重写 |

## 10. 风险与顺序说明

- **R-1**：T64 加 `CommunityRepositoryBundle.messaging` 必填字段会破坏既有所有 in-memory bundle 调用（`createInMemoryCommunityRepositoryBundle({...})` 没传 messaging）。缓解：T64 实现侧 in-memory bundle 自动初始化空 messaging（`audit?: ...` 同形），不强制调用方传；既有 admin / community / recommendations 测试零修改。
- **R-2**：T64 在 sqlite 上加 3 表与 3 索引会让既有 `sqlite.test.ts > default sqlite seed bridges showcase ...` 等已有测试的 isDatabaseEmpty / 计数检查偏移。缓解：T64 实现侧 isDatabaseEmpty 检查项**不**计入 messaging 三表（messaging 是延迟使用资源，empty database 时不会有数据）。
- **R-3**：T65 server action 用 `resolveCallerProfileId(session)` 派生身份键；同 role 多账号分享同一 profile id 的 Phase 1 限制下，"摄影师 A 用账号 X1 与摄影师 A 用账号 X2"会被识别成同一 messaging participant。缓解：A-007 显式记录该假设；§3.1 迁移后通过 `creator_profiles.account_id` 列做 1:1 解锁。
- **R-4**：T67 / T68 page tests 受既有 vite/sqlite bundling 影响（参考 §3.2 V1 经验）；缓解：messaging runtime 已用动态 import 模式（design §9.4 沿用 admin/runtime.ts 同形）；page 测试用 mock + in-memory bundle 注入。
- **R-5**：T69 `getInboxThreadsForRole` 返回类型从 `ContactThread[]` 改为 `InboxThreadProjection[]`，唯一调用方 `app/inbox/page.tsx` 由 T67 一并改写。缓解：T69 严格依赖 T67 已完成（拓扑约束）。
- **R-6**：NFR-001 性能 P95 ≤ 120ms 的 micro-bench 留给 increment-level regression-gate；如 CI 不稳改 P99 ≤ 200ms 兜底；不要降级 SQL 实现。

## 11. 修订记录

- 2026-04-19：起草。
