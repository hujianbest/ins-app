# Phase 2 — Threaded Messaging V1 需求规格说明

- 状态: 已批准
- 批准记录: `docs/verification/spec-approval-phase2-threaded-messaging-v1.md`
- 主题: Phase 2 — Threaded Messaging V1（线程式消息中心 V1）
- 输入来源: `docs/ROADMAP.md` §3.3；`docs/reviews/increment-phase2-threaded-messaging-v1.md`
- Execution Mode 偏好: `auto`

## 1. 背景与问题陈述

Lens Archive 已完成阶段 1 + Discovery Quality + Observability & Ops V1 + Discovery Intelligence V1 + Ops Back Office V1。当前 `/inbox` 是阶段 1 留下的"最小闭环"：所有公开页面（profile / work / opportunity）的「联系」按钮都触发 `startContactThreadAction`，把一条不可读的 cookie thread 写入浏览器 cookie；`/inbox` 只列出从 cookie 解析出来的元数据，**完全没有真实消息发送、没有未读、没有线程隔离、没有持久化**。如果用户在两台设备登录或清缓存，所有"联系记录"都会丢失。

同时，三类用户行为已经被 Discovery & social 链路记录，但**没有任何"我被关注 / 我被评论 / 我的外链被点击"的入站通知 surface**：用户必须自己去推荐 / 评论页面里逆向找。

本轮要解决的，不是引入完整 IM 系统、不是富文本 / 附件 / 群聊、不是实时性，而是把当前最高频的两类站内消息行为收口为：**真实持久化的一对一线程 + 未读语义可信 + 系统通知统一展示**，使得后续 §3.4 合作线索到履约可以在站内推进，而不是把所有协调动作甩到外部工具。

## 2. 目标与成功标准

### 2.1 总体目标

- 让两位创作者能在站内基于具体上下文（profile / work / opportunity）开启一条**持久化、跨设备、跨会话**的一对一消息线程，并继续来回沟通。
- 让用户在 `/inbox` 一眼看清「未读直接消息」+「未读系统通知」总数，按最近活动排序进入对应线程或来源页。
- 让既有公开页面 / 创作者工作台 / 推荐 / 搜索 / 关注 / 评论 / 外链跳转 / admin 后台 / `/api/health` / `/api/metrics` 行为不发生回归。
- 不引入第三方依赖；continue `node:sqlite` + Next.js App Router；不开放新 REST 端点。

### 2.2 成功标准

- 用户 A 在创作者 B 的公开页面点「联系」→ 自动 redirect 到 `/inbox/[threadId]`；该 thread 在 sqlite 中是一条新 `message_threads` + 两条 `message_thread_participants`（A 与 B 各一条），尚无 `messages`。
- 用户 A 在该 thread 详情页发一条文本消息 → `messages` 表 +1，`message_threads.last_message_at` 更新；下次 A 进 `/inbox`，该 thread 排在最上、未读数为 0；下次 B 登录进 `/inbox`，看到 A 发来的 thread + 未读数 = 1。
- B 进入 `/inbox/[threadId]` → A 发的消息显示为时间线条目，进入即 `markThreadRead` 把 B 的 `last_read_at` 更新到 `now`；B 在另一台设备上也看到该 thread 未读数 = 0。
- A 重复点同一 profile 的「联系」按钮 → 不创建新 thread，redirect 到既有 `[threadId]`（同一 `(initiatorAccountId, recipientAccountId, contextRef)` 元组只对应一条 direct thread）。
- 用户 A 在 `/inbox` 的"系统通知"段看到三类入站事件：B 关注了我 / B 评论了我的作品 X / B 点开了我的外链 handoff；这些通知**实时从 `discovery_events` 派生**（V1 不持久化系统通知），按时间倒序，最新 50 条。
- 任何未登录访客访问 `/inbox` / `/inbox/[threadId]` → server-side `redirect("/login")`，DOM 不出现任何消息内容。
- 任何已登录用户访问**不属于自己的 thread**（不在 participants 中）→ server-side 返回 `notFound()`（不暴露 thread 是否存在）。
- admin 后台（`/studio/admin/**`）**不**渲染任何 thread / message 内容（隐私边界 I-N）。
- `/api/metrics` 响应 JSON 中含 `messaging.{threads_created, messages_sent, threads_read, system_notifications_listed}` 4 counter；零状态全 0；任意写动作正确递增。
- 单条消息体超过 4000 字符 → server action 返回 `AppError("message_too_long", 400)`，不写库；UI 通过 `/inbox/[threadId]?error=<code>` 显示中文 alert。
- 性能：`/inbox` 列表（含未读计数 + 系统通知聚合）SSR 单页 P95 ≤ **120ms**（基于 vitest micro-bench；500 thread + 200 messages + 500 discovery events 规模）。

## 3. 用户角色与关键场景

### 3.1 主要角色

- **已登录创作者（photographer / model）**：发起 / 回复一对一消息；接收系统通知。

### 3.2 次要角色

- **公开访客**：本增量对其完全无感；点「联系」按钮仍跳转 `/login`。
- **运营 / 管理员**：admin 后台**不**接入消息内容；只在指标层（`/api/metrics > messaging.*`）观察消息系统的健康度。

### 3.3 关键场景

- 摄影师 Avery 在模特 Jules 的公开主页点「私信」→ 进入 `/inbox/<threadId>` 空线程 → 发一条「下周末可拍吗」→ Jules 24h 后登录看到 `/inbox` 顶部新 thread + 红色未读 badge "1" → 点入 → 看到消息 + 进入即未读清零 → 回复 → Avery 端 30s 内 `/inbox/<threadId>` polling 拉到 Jules 的回复。
- Jules 收到 Avery 的关注 → 几小时后登录 → `/inbox` 系统通知段显示「Avery 关注了你」+ 一行说明 + 跳转链接到 Avery 的公开主页。
- Avery 误点「联系」按钮第二次 → 没有创建新 thread，直接 redirect 到既有 thread 详情。
- 用户 X 用 URL `/inbox/<not-mine-thread-id>` 试图猜测他人 thread → 服务端 404（不暴露存在）。
- Avery 写了一条 5000 字超长消息 → 提交 → URL 携带 `?error=message_too_long` 回 thread 详情，alert 条提示「消息过长，请控制在 4000 字以内」+ 表单不清空（V1 简单方案：alert + 重写）。

## 4. 当前轮范围与关键边界

本轮**只做**：

- 三表 schema (`message_threads` / `message_thread_participants` / `messages`) + 索引。
- `MessageThreadRepository` / `MessageRepository` / `ParticipantRepository` 接口 + sqlite + in-memory 实现。
- 3 个 server actions：`createOrFindDirectThread` / `sendMessage` / `markThreadRead`。
- `/inbox` 升级（直接消息段 + 系统通知段）+ `/inbox/[threadId]` 详情页。
- 既有 `startContactThreadAction` 迁移到 `createOrFindDirectThread`。
- 系统通知 read-only 派生：从 `discovery_events` 实时聚合 `follow` / `external_handoff_click` 两类 + 从 `work_comments` 表（既有）聚合「我的作品被评论」（authorAccountId ≠ work owner）。
- 客户端 30s 轮询单线程详情。
- `MetricsSnapshot.messaging` 加性扩展（4 counter）。
- 4000 字符消息体上限（spec 层；ENV 不可调）。

## 5. 范围外内容

明确**不在**本增量做：

- 不做富文本 / 附件 / 图片 / 语音消息（依赖 §3.1 对象存储；V2 评估）。
- 不做群聊 / 多方协作线程（V1 严格一对一）。
- 不做实时推送 SSE / WebSocket / desktop notification（V1 仅 30s 客户端轮询）。
- 不做通知偏好 / 静音 / 关键词过滤 / 邮件通知（V2 评估）。
- 不做消息内容审核 / NSFW 检测 / rate limit / 反垃圾（与 §3.2 V2 举报队列一起做）。
- 不在 admin 后台（`/studio/admin/**`）暴露任何 thread / message 内容（NFR 隐私边界）。
- 不做 thread 归档 / 删除 / 静音 / 置顶（V2 评估）。
- 不做"已读回执"展示给对方（仅自己的 last_read_at 用于本端未读计数；不暴露给对端）。
- 不持久化系统通知到独立表（read-only 从既有 discovery_events + work_comments 派生）。
- 不开放 `/api/messaging/*` REST 端点；所有写动作走 server action。
- 不做"撤回消息"（V2 评估；本 V1 消息一旦发送即不可改 / 不可删）。
- 不引入新 npm 依赖。

## 6. 功能需求

> V1 范围内 8 条 FR 互为前置（缺任一条会破坏「持久化 + 未读 + 系统通知 + 隐私边界 + 可观测性」中的一环），故全部 `Must`。

### FR-001 持久化 Thread / Message Schema
#### 需求说明
系统应在 SQLite 中新增 `message_threads` / `message_thread_participants` / `messages` 三张表 + 必要索引，并通过 `CommunityRepositoryBundle.messaging` 暴露读写 API。

#### 验收标准
- `message_threads` 至少含字段：`id (TEXT PRIMARY KEY)` / `kind (TEXT NOT NULL)`（V1 仅取值 `"direct"`，`"system_notification"` 预留但不写入）/ `subject (TEXT)` / `context_ref (TEXT)`（如 `work:<id>` / `profile:<role>:<slug>` / `opportunity:<id>` / `null`）/ `created_at (TEXT NOT NULL)` / `last_message_at (TEXT)`。
- `message_thread_participants` 至少含字段：`thread_id (TEXT NOT NULL)` / `account_id (TEXT NOT NULL)` / `role (TEXT NOT NULL)`（`"initiator"` / `"recipient"`）/ `joined_at (TEXT NOT NULL)` / `last_read_at (TEXT)`；PRIMARY KEY (`thread_id`, `account_id`)；FOREIGN KEY 指向 `message_threads.id`。
- `messages` 至少含字段：`id (TEXT PRIMARY KEY)` / `thread_id (TEXT NOT NULL)` / `author_account_id (TEXT)`（系统通知为 NULL）/ `kind (TEXT NOT NULL)`（`"text"`）/ `body (TEXT NOT NULL)` / `created_at (TEXT NOT NULL)`；FOREIGN KEY 指向 `message_threads.id`。
- 索引：`idx_messages_thread_created_at` ON `messages(thread_id, created_at ASC)`；`idx_thread_participants_account` ON `message_thread_participants(account_id, last_read_at)`；`idx_threads_last_message_at_desc` ON `message_threads(last_message_at DESC, id DESC)`。
- `MessageThreadRepository` 暴露：`createDirectThread(initiatorAccountId, recipientAccountId, contextRef?)` / `findDirectThreadByContext(initiatorAccountId, recipientAccountId, contextRef?)` / `getThreadById(threadId)` / `listThreadsForAccount(accountId, limit)` / `updateLastMessageAt(threadId, ts)`。
- `MessageRepository` 暴露：`appendMessage(input)` / `listByThreadId(threadId, limit)`。
- `ParticipantRepository` 暴露：`listForThread(threadId)` / `markRead(threadId, accountId, ts)` / `getUnreadCountForAccount(accountId)`。
- 同样的 `(initiatorAccountId, recipientAccountId, contextRef)` 元组**最多对应一个 direct thread**（unique constraint by 业务逻辑：findOrCreate 必须先查再写；不引入 sqlite UNIQUE INDEX 因为 contextRef 可空）。
- in-memory bundle 完整实现 `messaging`（数组 + Map）以保证 vitest 路径全覆盖。

#### Priority
Must

#### Source / Trace Anchor
ROADMAP §3.3「新增 `Thread` / `Message` / `Participant` schema，迁移现有联系动作生成的会话」；增量 §New。

---

### FR-002 创建 / 复用一对一线程
#### 需求说明
系统应提供 `createOrFindDirectThread` server action：给定 `recipientAccountId` 与可选 `contextRef`，若存在已匹配 thread 则返回其 id；否则原子创建 `message_threads` + 两条 `message_thread_participants`。

#### 验收标准
- Given 未登录访客调用 → 抛 `AppError("unauthenticated", 401)`；UI 入口（form action wrapper）redirect 到 `/login`。
- Given 已登录用户调用、recipient 不存在 / 不是有效账号 → 抛 `AppError("recipient_not_found", 404)`，不写库。
- Given 已登录用户 A 第一次以 `(B, "work:work-1")` 调用 → sqlite 中创建一条 `message_threads`（`kind="direct"`、`context_ref="work:work-1"`）+ 两条 `message_thread_participants`（A 为 `initiator`、B 为 `recipient`），并返回 thread id；同事务（`bundle.withTransaction`）。
- Given A 重复以**完全相同** `(B, "work:work-1")` 调用 → 返回既有 thread id，不创建新行；不写 messaging.threads_created counter（视作幂等 no-op）。
- **Given B 反向以 `(A, "work:work-1")` 调用（A 此前已建过 `(B, "work:work-1")` thread）→ 返回 A 既有 thread id（无序去重）。**`createOrFindDirectThread` 在 dedupe 查询中按 unordered pair `{accountX, accountY}` + `context_ref` 匹配；A → B 与 B → A 在同一 context 下合并为一条 thread。`message_thread_participants.role` 字段保留首次创建时的 initiator / recipient 标识，仅用于 audit / display，不影响读写权限。
- Given A 以 `(B, undefined)` 调用 → 当且仅当 A 与 B 之间已存在一条 `context_ref IS NULL` 的 thread（无序）时复用，否则新建一条 `context_ref` 为 NULL 的 thread。
- Given recipient 是 A 自己（自己给自己发） → 抛 `AppError("invalid_self_thread", 400)`，不写库。
- Given 写动作完成 → counter `messaging.threads_created` 递增 1（仅新建路径，不含复用）；通过 `wrapServerAction("messaging/createOrFindDirectThread", ...)` 接入 §3.8 V1 横切。

#### Priority
Must

#### Source / Trace Anchor
ROADMAP §3.3「迁移现有联系动作生成的会话」；增量 §New。

---

### FR-003 发送消息
#### 需求说明
系统应提供 `sendMessage(threadId, body)` server action：写入一条 `messages` 行 + 更新对应 `message_threads.last_message_at`。

#### 验收标准
- Given 未登录访客调用 → 抛 `AppError("unauthenticated", 401)`。
- Given 已登录用户但**不是 thread participant** → 抛 `AppError("forbidden_thread", 403)`，不暴露 thread 是否存在；UI 收到该错误后 redirect 到 `/inbox`。
- Given thread 不存在 → 同上 `AppError("forbidden_thread", 403)`（统一 403，不告诉客户端该 thread id 不存在 vs 不属于自己）。
- Given body 为空 / 仅空白 → 抛 `AppError("message_empty", 400)`，不写库。
- Given body 长度 > 4000 字符 → 抛 `AppError("message_too_long", 400)`，不写库。
- Given 合法消息 → `messages` 表 +1（`author_account_id` 为当前 session id、`kind="text"`、`body=trim`、`created_at=now`），`message_threads.last_message_at = now`，**同事务** (`bundle.withTransaction`)；任一抛错时回滚（messages 写失败时 last_message_at 不应该更新）。
- Given 写完成 → counter `messaging.messages_sent` 递增 1；通过 `wrapServerAction` 接入。

#### Priority
Must

#### Source / Trace Anchor
ROADMAP §3.3；增量 §New。

---

### FR-004 标记已读
#### 需求说明
系统应提供 `markThreadRead(threadId)` server action：把当前用户在该 thread 的 `last_read_at` 更新为 `now`。

#### 验收标准
- Given 未登录 → `AppError("unauthenticated", 401)`。
- Given 不是 participant → `AppError("forbidden_thread", 403)`。
- Given 合法 → `message_thread_participants.last_read_at = now`（仅当前 account 的那一行）；其他 participant 的 `last_read_at` 不动。
- Given 重复调用（已经是最新已读状态） → 仍写库（覆盖 last_read_at = now），但不抛错；counter `messaging.threads_read` 仍递增（监控调用次数即可）。
- Given 写完成 → counter `messaging.threads_read` 递增 1。
- 客户端进入 `/inbox/[threadId]` SSR 时，**SSR 入口同步阶段**自动调用 `markThreadRead`（即未读计数立即清零，不依赖客户端额外 fetch）。

#### Priority
Must

#### Source / Trace Anchor
ROADMAP §3.3「未读状态可信」；增量 §New。

---

### FR-005 `/inbox` 列表（直接消息 + 系统通知 + 未读计数）
#### 需求说明
系统应在 `/inbox` 渲染：上半部「直接消息」段（按 `last_message_at desc` 排序，未读 thread 显示 badge）；下半部「系统通知」段（最新 50 条，按时间倒序，read-only 派生自 `discovery_events` + `work_comments`）。

#### 验收标准
- Given guest → server-side `redirect("/login")`。
- Given 已登录但无任何 thread / 通知 → 渲染两段空态文案。
- Given 已登录有 N 条 thread → 列出每条：对方 display name + `last_message_at` 人类可读时间 + 未读数 badge（**`messages where thread_id = ? AND created_at > 当前 account 的 last_read_at AND author_account_id <> 当前 account_id`**：自身发出的消息**不**计入自己的未读）+ 跳转 `/inbox/[threadId]`。
- Given thread 尚无任何消息（`last_message_at IS NULL`，例：用户点了「联系」但还未发首条消息）→ 该 thread **仍然出现** 在 `/inbox` 列表中；排序按 `COALESCE(last_message_at, created_at) DESC, id DESC`，即未发消息的 thread 用 `created_at` 作为排序 fallback，仍按"最近活动"语义排序。
- Given 已登录有 M 条系统通知 → 列出每条：通知类型中文化标签（关注 / 评论 / 外链点击）+ 来源用户 display name + 跳转链接（关注 → 来源用户主页；评论 → `/works/[workId]`；外链 → 来源用户主页）。
- Given list 加载 → 直接消息段 SSR 单次 SELECT 拿 thread + 未读 count（聚合）；系统通知段 SSR 单次 SELECT discovery_events filter + 单次 SELECT work_comments filter；不允许 N+1。
- Given 计数 → counter `messaging.system_notifications_listed` 递增 1（每次 `/inbox` SSR 渲染算一次列出）。

#### Priority
Must

#### Source / Trace Anchor
ROADMAP §3.3「线程式消息中心 + 未读 + 系统通知」；增量 §New。

---

### FR-006 `/inbox/[threadId]` 单线程详情
#### 需求说明
系统应在 `/inbox/[threadId]` 渲染：thread 上下文（来源链接 + 对方 display name）+ 消息时间线（按 `created_at asc`）+ 发送表单 + 客户端 30s 轮询触发 SSR re-fetch。

#### 验收标准
- Given guest → `redirect("/login")`。
- Given 已登录但**不是 thread participant**（含 thread 不存在的所有情形） → `notFound()`（不暴露存在 / 不区分两种失败）。
- **Given SSR 入口执行顺序**：(1) 解析 session → guest 立即 redirect；(2) 从 `bundle.messaging.participants.listForThread(threadId)` 校验当前 accountId 是 participant，**不通过立即 `notFound()`，绝不触发任何写动作（含 `markThreadRead`）**；(3) 校验通过后才调用 `markThreadRead` 把当前 account 的 `last_read_at = now`；(4) 然后再 fetch thread 元数据 + messages + render。该顺序是 NFR-002 隐私边界的硬约束。
- Given 合法 → SSR 拿到 thread 元数据 + 全部 messages（V1 假设单 thread ≤ 200 message；超出后 V2 评估分页）+ participants + render。
- Given 表单提交 → 调 `sendMessage`；成功 → `redirect` 回相同 URL（清空表单 / 触发 SSR re-fetch）；失败 → `redirect("/inbox/[threadId]?error=<code>")`（同 §3.2 V1 错误回流协议）。
- Given 客户端轮询 → 客户端每 30 秒触发一次 SSR re-fetch；不引入 fetch / SWR / WebSocket / 第三方依赖；具体实现技术栈（client component + 路由刷新）由 design 选定。
- Given `?error=` → SSR 渲染顶部 alert（`role="alert" aria-live="polite"`），文案按错误码字典映射。

#### Priority
Must

#### Source / Trace Anchor
ROADMAP §3.3「实时性策略：先做轮询 + 服务器渲染」；增量 §New。

---

### FR-007 既有 `startContactThreadAction` 迁移
#### 需求说明
系统应把既有 `web/src/features/contact/actions.ts > startContactThreadAction` 的 cookie 路径替换为 `createOrFindDirectThread` 调用，redirect 到对应 `/inbox/[threadId]`。

#### 验收标准
- 既有所有公开页面（profile / work / opportunity）的「联系」按钮入口签名不变（`startContactThreadAction.bind(null, role, slug, sourceType, sourceId)`）。
- guest → 先记 `discovery_events.contact_start failed/unauthenticated` → `redirect("/login")`（与既有行为一致）。
- authenticated → 解析 recipientAccountId（通过 `slug` → `bundle.profiles.getByRoleAndSlug` → `account_id`）→ 调 `createOrFindDirectThread(recipientAccountId, contextRef)` → 记 `discovery_events.contact_start success` → `redirect("/inbox/[threadId]")`。
- recipient profile 没找到（slug 不存在 / 已下架） → 记 failed event + `redirect("/inbox?error=recipient_not_found")` + 不创建 thread；`/inbox` SSR 见 `?error=recipient_not_found` 时按 §8.3 错误码字典渲染 alert（沿用 §3.2 V1 错误回流协议）。
- 旧 cookie `lens-archive-contact-threads` 被新逻辑**完全忽略**（不读、不写、不清；自然过期）；删除 `parseContactThreads` / `serializeContactThreads` / `buildContactThread` / `upsertContactThread` 四个 cookie 工具函数。

#### Priority
Must

#### Source / Trace Anchor
ROADMAP §3.3「迁移现有联系动作」；增量 §Modified。

---

### FR-008 `messaging.*` Metrics + 隐私边界
#### 需求说明
系统应在 `MetricsSnapshot` 上加性扩展 `messaging` 顶层 optional 字段，预注册 4 个 counter；admin 后台不暴露任何 thread / message 内容；admin 邮箱不写入 messaging 相关 logger。

#### 验收标准
- `MetricsSnapshot.messaging = { threads_created, messages_sent, threads_read, system_notifications_listed }` 4 counter；零状态全 0；既有 `http` / `sqlite` / `business` / `recommendations` / `admin` / `gauges` / `labels` 字段不变。
- `messaging.*` server actions 的结构化 log（`event=server-action.completed/error`）允许的关联键**仅**为 `thread_id` 与 `recipient_account_id`（属 NFR-003 受控键扩展）；**严格不允许**记录 `messages.body` 任意子串、对方 email、对方 display name、message 行级元数据；trace id 沿用 §3.8 V1。
- admin 后台 4 路由（`/studio/admin/{,curation,works,audit}`）均**不**消费 `bundle.messaging`；admin server actions 也不接触 messaging 数据。
- 任何用户访问不属于自己的 thread → `notFound()`，不通过 logger / metrics 暴露 thread 是否存在（即不区分 "不存在" 与 "存在但非 participant"）。

#### Priority
Must

#### Source / Trace Anchor
ROADMAP §3.3 + §3.8 V1 metrics 注册表先例；增量 §New + 隐私边界。

---

## 7. 非功能需求

### NFR-001 性能
- `/inbox` 列表 SSR：在 ≤ 500 thread + ≤ 500 discovery events + ≤ 200 work_comments 规模下，单页 P95 ≤ **120ms**（vitest micro-bench）。
- `/inbox/[threadId]` SSR：在单 thread ≤ 200 messages 下 P95 ≤ **80ms**。
- `markThreadRead` server action：单次 ≤ **30ms**。
- 不引入 N+1 SQL；未读计数走 SQL 聚合（`COUNT WHERE created_at > ?`）。

### NFR-002 安全 / 隐私
- 任何 thread / message 数据仅参与人本人可读；server-side 入口必须用 `bundle.messaging.participants.listForThread(threadId)` 校验当前 account_id 在内才放行（FR-006 / FR-003 / FR-004）。
- admin 后台严格不接触 messaging 数据（FR-008）。
- `messages.body` 不进入 logger context；不进入 `discovery_events`；不进入 audit_log。
- 错误响应不区分「thread 不存在」vs「不是 participant」（统一 `forbidden_thread` 或 `notFound()`），避免 thread id 枚举攻击。
- 既有 `discovery_events.contact_start` 在 FR-007 迁移后语义不变（仍记录 contact_start，新增 `thread_id` 关联是 V2 评估）。

### NFR-003 可观测性
- `messaging.*` server actions 全部经 `wrapServerAction("messaging/<actionName>", fn)` 接入 §3.8 V1 logger / metrics / errors。
- 结构化 log `module=server-action`、`actionName=messaging/...`、`durationMs`、错误时 `code`，**不**含 message body / recipient email。

### NFR-004 可测试性
- `MessageThreadRepository` / `MessageRepository` / `ParticipantRepository` 必须 in-memory bundle 完整实现，所有 server action 单测不依赖 sqlite。
- server actions 接受 deps 注入（`session` / `bundle` / `metrics` / `logger`）。

### NFR-005 兼容性
- 既有所有公开页面 / 创作者工作台 / 推荐 / 搜索 / 关注 / 评论 / 外链跳转 / admin 后台 / `/api/health` / `/api/metrics` 行为不变。
- `startContactThreadAction` 签名不变；调用方零修改。
- 旧 cookie `lens-archive-contact-threads` 被忽略（不破坏，但不再驱动行为）。

## 8. 数据契约

### 8.1 类型扩展

```ts
// features/community/types.ts
export type ThreadKind = "direct" | "system_notification";
export type MessageKind = "text";
export type ParticipantRole = "initiator" | "recipient";

export type MessageThreadRecord = {
  id: string;
  kind: ThreadKind;
  subject?: string;
  contextRef?: string; // "work:<id>" | "profile:<role>:<slug>" | "opportunity:<id>" | undefined
  createdAt: string;
  lastMessageAt?: string;
};

export type MessageThreadParticipantRecord = {
  threadId: string;
  accountId: string;
  role: ParticipantRole;
  joinedAt: string;
  lastReadAt?: string;
};

export type MessageRecord = {
  id: string;
  threadId: string;
  authorAccountId: string | null; // null for system notifications (V1 unused)
  kind: MessageKind;
  body: string;
  createdAt: string;
};

export type MessagingRepositoryBundle = {
  threads: MessageThreadRepository;
  messages: MessageRepository;
  participants: ParticipantRepository;
};

// CommunityRepositoryBundle.messaging: MessagingRepositoryBundle (新增)
```

### 8.2 不变量

- `(initiatorAccountId, recipientAccountId, contextRef)` 元组对 direct thread 唯一；findOrCreate 必须串行 read → write。
- `messages.author_account_id` 在 V1 必须为 thread participant（server action 校验）。
- `body` trim 后非空 + 长度 ≤ 4000；server action 校验。
- `last_read_at` 仅当前 account 自己可写；server action 校验 participant + account_id 匹配。
- `last_message_at` 永不递减（应用层保证）。
- 系统通知**不持久化**到 `messages` 表；从 `discovery_events` + `work_comments` 实时派生（`messages.kind="system_notification"` 在 V1 不出现）。

### 8.3 错误码字典

| `AppError.code` | 中文文案 | 适用场景 |
|---|---|---|
| `unauthenticated` | 请先登录后再发送消息。 | guest 调任意 messaging server action |
| `forbidden_thread` | 你没有访问该消息的权限。 | 非 participant / thread 不存在统一 |
| `recipient_not_found` | 找不到该用户。 | createOrFindDirectThread recipient 解析失败 |
| `invalid_self_thread` | 不能与自己开启对话。 | recipient = self |
| `message_empty` | 消息不能为空。 | sendMessage trim 后空 |
| `message_too_long` | 消息过长，请控制在 4000 字以内。 | sendMessage > 4000 字 |
| `storage_failed` | 操作失败，请稍后重试。 | 默认兜底 |

## 9. 约束

- CON-001：仅扩展现有 `community` repository 与 3 张新 messaging 表；不引入新外部数据源 / 队列 / 缓存。
- CON-002：仅纯 TypeScript / Node 22 内置模块；不引入新 runtime npm 依赖。
- CON-003：UI 改动仅限 `/inbox` 升级 + `/inbox/[threadId]` 新建；不改既有公开页面 / 工作台 / admin 后台 / shell 组件契约（既有 `startContactThreadAction` 调用点零改）。
- CON-004：metrics 严格走 `MetricsSnapshot.messaging` 加性命名空间；既有命名空间不动。
- CON-005：messaging 写动作仅经 server action；不开放新 REST 端点。
- CON-006：消息内容仅 plain text，最大 4000 字符；不引入富文本 / markdown / HTML 渲染。
- CON-007：admin 后台严格不接触 messaging 数据。

## 10. 假设 / 待澄清

- A-001：本 V1 单 thread 消息数 ≤ 200 / 单用户 thread 数 ≤ 500；超出再评估分页（V2）。
- A-002：本 V1 系统通知 read-only 派生（不持久化），最近 50 条由实时聚合 SQL 提供；后续若需"我标记某通知已读"才需要持久化到独立表（V2）。
- A-003：30s 客户端轮询的 polling 间隔在 V1 硬编码（不引入 env 调参）；V2 评估按用户在线状态调节。
- A-004：跨设备未读一致性由 sqlite 单写源保证；任意一台设备 markRead 后其他设备下次 SSR 立即看到清零。
- A-005：旧 cookie `lens-archive-contact-threads` 不显式清除；用户清缓存后自然消失。
- A-006：`node:sqlite` 单进程下，`bundle.withTransaction` + 先 read 后 write 的 `findOrCreate` 模式可保证不会插出双向 / 同 contextRef 的重复 direct thread。前提：本应用不运行多进程 / 不接入读写分离 sqlite 集群（与 §3.1 PostgreSQL 迁移之前一致）。如未来上托管 SQL，需要在 schema 层用「ordered pair (LEAST(a,b), GREATEST(a,b))」+ `UNIQUE INDEX` 锁死，与本 V1 应用层 dedupe 互为冗余。

## 11. 影响 / 出口工件

- 新增（src）：
  - `web/src/features/messaging/{types,messaging-repository,thread-resolver,system-notifications,thread-actions,metrics,index,test-support}.ts(.test.ts)`
  - `web/src/app/inbox/[threadId]/{page,page.test}.tsx`
  - `web/src/app/inbox/[threadId]/poll-client.tsx`（30s 轮询客户端组件）

- 修改（src）：
  - `web/src/features/community/types.ts`（messaging 接口加性扩展 + 类型）
  - `web/src/features/community/sqlite.ts` + `sqlite.test.ts`（schema + 3 repository 实现）
  - `web/src/features/community/test-support.ts`（in-memory messaging 实现）
  - `web/src/features/contact/actions.ts`（迁移到 createOrFindDirectThread）
  - `web/src/features/contact/state.ts`（删除 cookie 工具，保留 `getInboxThreadsForRole` 但实现迁移）
  - `web/src/features/observability/metrics.ts` + `metrics.test.ts`（messaging namespace 加性）
  - `web/src/app/inbox/page.tsx` + `page.test.tsx`（升级为 thread + 系统通知两段）

- finalize 阶段同步：`task-progress.md`、`RELEASE_NOTES.md`、`docs/ROADMAP.md` §3.3、`README.md`。

## 12. Trace Anchor 索引

| FR | ROADMAP / 增量记录锚点 |
|----|---|
| FR-001 | §3.3「Thread / Message / Participant schema」；§New |
| FR-002 | §3.3「迁移现有联系动作」；§New |
| FR-003 | §3.3 隐含「真实消息发送」；§New |
| FR-004 | §3.3「未读状态可信」；§New |
| FR-005 | §3.3「inbox 列表 + 系统通知」；§New |
| FR-006 | §3.3「先做轮询 + SSR」；§New |
| FR-007 | §3.3「迁移现有联系动作」；§Modified |
| FR-008 | §3.3 + §3.8 V1 metrics 模式 + 隐私边界；§New |
