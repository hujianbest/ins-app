# Bug Patterns — T64

## 已规避

1. **`createInMemoryCommunityRepositoryBundle` 必填 messaging 破坏既有调用方**：fixtures 字段全部 optional + auto `[]` 初始化（R-1）；既有 admin / community / recommendations / contact 测试零修改即可继续工作。
2. **isDatabaseEmpty 引入 messaging 表 → seed 漂移**：实现保持不引用 messaging 表（R-2）；空 DB 仍触发既有 seed 逻辑。
3. **unordered pair SQL 在 contextRef=undefined 时落库 `"undefined"` 字符串**：`stmt.get(contextRef ?? null, ...)` 严格归一化（设计 §9.2.2 binding contract）。
4. **未读 SQL 把 self-authored 消息计入未读**：`AND (m.author_account_id IS NULL OR m.author_account_id <> ?)` 显式排除（spec USER-INPUT 决策）；in-memory 等价同形。
5. **空 thread 不在 inbox 列出**：listThreadsForAccount 用 `COALESCE(t.last_message_at, t.created_at) DESC` 兜底，empty thread 仍参与排序（spec FR-005 验收）。
6. **admin 模块意外 import bundle.messaging 触发隐私边界 silent regression**：`__messaging-isolation.test.ts` 字符串扫描断言守住（I-6）。

## 候选下游

- T65 server actions 在 SSR / form-action 入口必须用 `resolveCallerProfileId(session)` 派生身份键，不能直接用 `session.accountId`（A-007）。
- T67 / T68 page tests 走 vite/sqlite 限制，预期会进入 baseline-failed list（与 §3.2 V1 admin pages 同形）；T68 client poll 需要 fake timers + `useEffect` mock。
