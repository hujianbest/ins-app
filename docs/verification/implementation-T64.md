# Implementation — T64 Cross-Cutting Skeleton (Phase 2 §3.3)

- Date: `2026-04-19`

## 实现摘要

按 T64 acceptance 完成横切骨架：

1. **community/types.ts**：加 `ThreadKind` / `MessageKind` / `ParticipantRole` / `MessageThreadRecord` / `MessageThreadParticipantRecord` / `MessageRecord` / `CreateDirectThreadInput` / `AppendMessageInput` / `InboxThreadProjection` / 3 repository interfaces (`MessageThreadRepository` / `MessageRepository` / `ParticipantRepository`) / `MessagingRepositoryBundle` / `CommunityRepositoryBundle.messaging` 字段。所有命名与 spec FR-001 验收一致。
2. **community/sqlite.ts**：
   - 加 3 表 schema (`message_threads` / `message_thread_participants` / `messages`) + 3 索引 (`idx_threads_last_message_at_desc` / `idx_thread_participants_account` / `idx_messages_thread_created_at`)。
   - 加 3 repository 实现：
     - `threads.createDirectThread` / `findDirectThreadByUnorderedPair`（unordered pair SQL §9.2.2，参数绑定严格 `contextRef ?? null`）/ `getThreadById` / `updateLastMessageAt` / `listThreadsForAccount`（含未读聚合 + COALESCE 排序 + 排除 self-authored）。
     - `messages.appendMessage` / `listByThreadId`。
     - `participants.listForThread` / `markRead` / `getUnreadCountForAccount`（聚合所有 thread 未读 - 排除 self-authored）。
   - 加 3 个 row mapper helpers + row type 定义。
   - **R-2**：`isDatabaseEmpty()` 不引用任何 messaging 表，baseline 行为不变。
3. **community/test-support.ts**：in-memory bundle 加 messaging 数组实现（`createDirectThread` / `findDirectThreadByUnorderedPair` 等价 + `listThreadsForAccount` 排除 self-authored 等价 + `markRead` / `getUnreadCountForAccount` 等价）；fixtures 字段加 `messageThreads` / `messageThreadParticipants` / `messages` 三个 optional 数组。**R-1**：所有 fixtures 入参都是 optional，不传 messaging 时自动 `[]` 初始化。
4. **observability/metrics.ts**：`MessagingSnapshot` 类型；`MetricsSnapshot.messaging` 必填顶层字段（与 admin / recommendations 同形）；`MESSAGING_COUNTER_NAMES` 4 项预注册全 0；snapshot 输出 messaging 字段。既有 http/sqlite/business/recommendations/admin 字段不变。
5. **observability/logger.ts > AllowedContextKey**：加 `recipientAccountId`（`threadId` 已存在）。
6. **features/messaging/**：
   - `types.ts` re-export community types。
   - `identity.ts > resolveCallerProfileId(session)`（基于 `getStudioProfileSlugForRole`）。
   - `context-link.ts > buildContextSourceLink(contextRef)` 4 态映射（work / profile / opportunity / undefined）。
   - `metrics.ts` 4 helpers + `MESSAGING_COUNTER_NAMES` 常量。
   - `test-support.ts` `createMessagingTestDeps` + `createCapturingLogger` + 3 session factories。
   - `index.ts` barrel export。
7. **admin 隔离断言（I-6）**：新增 `features/admin/__messaging-isolation.test.ts`，对 `features/admin/**` + `app/studio/admin/**` 子树（不含 `.test.*`）字符串扫描 4 个 forbidden tokens，断言 0 命中。
8. **R-1 / R-2 / I-6 测试**：新增 `community/test-support.test.ts` 3 case 覆盖 R-1；`sqlite.test.ts` 新增 R-2 sanity case；`__messaging-isolation.test.ts` 覆盖 I-6。

## fail-first 证据

```
$ # 实现前
$ npx vitest run src/features/messaging/
（红：messaging 模块不存在）

$ # 实现后
$ npx vitest run src/features/messaging/ src/features/observability/metrics.test.ts src/features/admin/__messaging-isolation.test.ts src/features/community/test-support.test.ts
 Test Files  6 passed (6)
      Tests  35 passed (35)
```

## 全套验证

```
$ npm run typecheck   — baseline 4 errors（与 §3.2 V1 末状态一致；T64 不引入新错）
$ npm run lint        — 0 errors（baseline 1 warning + 1 fixed unused import）
$ npm run build       — success（含所有既有路由 build）
$ npx vitest run（全套）— 18 failed | 58 passed | 2 skipped (78) | 1 failed | 298 passed (303)
                            vs §3.2 V1 末 baseline 18 | 53 (72) | 278；新增 5 passed test files
                            （identity + context-link + metrics + admin-isolation + test-support）；
                            新增 20 passed tests；既有失败集合不变
```

## Acceptance 校验

| Acceptance | 证据 |
|---|---|
| 3 表 schema + 3 索引 | sqlite.ts schema + sqlite.test 隐式覆盖（CREATE INDEX IF NOT EXISTS 在第一次连接即落地）|
| 3 repository 接口 + 实现 + spec FR-001 命名一致 | types.ts + sqlite.ts; sqlite.test 双向 dedupe / 未读聚合 / getUnreadCount 三大操作 ✅ |
| in-memory bundle 等价 | test-support.test.ts 3 case ✅ |
| **R-1**: in-memory bundle 不传 messaging 自动空 | test-support.test "auto-initializes empty messaging arrays" ✅ |
| **R-2**: isDatabaseEmpty baseline 不漂移 | sqlite.ts isDatabaseEmpty 实现未引用 messaging 表（code review）+ sqlite.test sanity ✅ |
| **I-6**: admin 模块零耦合 messaging | `__messaging-isolation.test.ts` 字符串扫描 0 命中 ✅ |
| MetricsSnapshot.messaging 4 counter 必填零状态 | metrics.test 3 case ✅ |
| AllowedContextKey 加 recipientAccountId（threadId 已有） | logger.ts 类型扩展 + 既有 logger.test 不漂移 ✅ |
| identity / context-link / metrics helpers 单测 | 3 文件 ✅ |
| sqlite 参数绑定 `contextRef ?? null` 契约 | sqlite.ts findDirectThreadByUnorderedPair 实现严格遵守 |

## 不变量

- I-1 / I-7 / I-10 / I-11 / I-12 在 schema + 接口层落地。
- I-6 由 `__messaging-isolation.test.ts` 字符串扫描守住。
- A-007 (creator_profiles ↔ auth_accounts 桥接缺) 在 §1 关键 ID 空间假设 + identity.ts 注释中显式记录；后续任务 (T65 / T66 / T67 / T68 / T69) 依赖此契约。

## 文件改动

新增：
- `web/src/features/messaging/{types,identity,identity.test,context-link,context-link.test,metrics,metrics.test,index,test-support}.ts`
- `web/src/features/admin/__messaging-isolation.test.ts`
- `web/src/features/community/test-support.test.ts`

修改：
- `web/src/features/community/types.ts`（messaging 接口加性扩展 + 类型）
- `web/src/features/community/sqlite.ts`（3 表 schema + 3 索引 + 3 repository impl + 3 row mapper）
- `web/src/features/community/test-support.ts`（in-memory messaging 实现）
- `web/src/features/community/sqlite.test.ts`（4 messaging 测试用例）
- `web/src/features/observability/metrics.ts`（messaging namespace 加性扩展）
- `web/src/features/observability/metrics.test.ts`（3 messaging namespace case）
- `web/src/features/observability/logger.ts`（AllowedContextKey 加 recipientAccountId）
