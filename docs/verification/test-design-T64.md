# Test Design — T64 Cross-Cutting Skeleton (Phase 2 §3.3)

## 测试单元

| 文件 | 覆盖目标 |
|---|---|
| `web/src/features/community/sqlite.test.ts`（扩展） | 3 表 schema + 索引存在；`createDirectThread` / `findDirectThreadByUnorderedPair` 双向 dedupe + null contextRef + 同 contextRef + kind=direct；`appendMessage` + `updateLastMessageAt`；`markRead`；`getUnreadCountForAccount`；`listThreadsForAccount` 含未读聚合（排除 self-authored 消息）+ COALESCE 排序；`isDatabaseEmpty()` 在仅有 messaging 三表（无业务）时返回 `true`（R-2 不漂移） |
| `web/src/features/community/test-support.test.ts`（新增） | in-memory bundle 加 messaging 数组实现等价；`createInMemoryCommunityRepositoryBundle({ profiles, works, curation })` 不传 messaging 入参时 `bundle.messaging.threads.listThreadsForAccount(...)` 返回 `[]`（R-1 既有调用方零改）|
| `web/src/features/observability/metrics.test.ts`（扩展） | `MetricsSnapshot.messaging` 必填字段 4 counter 启动预注册全 0；增量后正确写入；既有 http/sqlite/business/recommendations/admin 字段不变 |
| `web/src/features/admin/__messaging-isolation.test.ts`（新增） | I-6: 字符串扫描断言 `features/admin/**` + `app/studio/admin/**` 子树（不含 .test.* 文件）grep `bundle.messaging` / `messaging.threads` / `messaging.messages` / `messaging.participants` 命中 0 次 |
| `web/src/features/messaging/identity.test.ts`（新增） | `resolveCallerProfileId(session)` 覆盖 photographer / model 两个 role |
| `web/src/features/messaging/context-link.test.ts`（新增） | `buildContextSourceLink(contextRef)` 4 态映射（work / profile / opportunity / undefined）|
| `web/src/features/messaging/metrics.test.ts`（新增） | 4 helpers 路由到正确 counter；MESSAGING_COUNTER_NAMES 4 项 |

## fail-first 主行为

1. **schema**：3 表 + 3 索引可读；INSERT/SELECT 通顺。
2. **dedupe SQL**：A→B vs B→A 同 contextRef → 同一 thread；不同 contextRef → 不同 thread；null contextRef 形态可空匹配；non-direct kind 不命中。
3. **listThreadsForAccount**：未读 count 排除 self-authored；按 `COALESCE(last_message_at, created_at) DESC, id DESC` 排序；空 thread 仍出现。
4. **getUnreadCountForAccount**：聚合所有 thread 的未读和；排除 self-authored。
5. **markRead**：仅当前 account 一行被更新；其他 participant 不受影响。
6. **R-1**：in-memory bundle 不传 messaging 时仍可读 `bundle.messaging.threads.listThreadsForAccount("X", 100) → []`。
7. **R-2**：empty sqlite bundle (only schema, no rows) `isDatabaseEmpty()` 仍返回 `true`。
8. **I-6**：字符串扫描 admin 模块 messaging 引用 = 0。
9. **MetricsSnapshot.messaging** 零状态 4 counter = 0；递增 1 后正确反映；既有命名空间不漂移。
10. **identity / context-link / metrics helpers** 单元覆盖。

## 退出标准

- vitest 子集全绿
- typecheck/lint/build baseline 不漂移
- 全套 vitest baseline 不漂移（既有 18 failed 集合不变）
