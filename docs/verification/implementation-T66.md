# Implementation — T66 Inbox model + System notifications + SSR helper

## 实现摘要

- `messaging/inbox-model.ts > listInboxThreadsForAccount(accountId, limit, bundle?)`：单点委托给 `bundle.messaging.threads.listThreadsForAccount`；不计 metric。
- `messaging/system-notifications.ts > listSystemNotificationsForAccount(accountId, limit, bundle?, metrics?)`：聚合 `discovery_events` (`follow` + `external_handoff_click` filter `target_profile_id === accountId`) + `work_comments` (owner-side：先 listByOwnerProfileId 再 listByWorkId per work)；自评论排除（authorAccountId === accountId 时跳过）；按 `createdAt desc` + slice(0, limit)；metrics 传入时 +1。
- `messaging/inbox-thread-view.ts > loadInboxThreadView(threadId, session, deps?)` SSR helper：严格 4 步顺序（design §9.10）：(1) session guest → `redirect("/login")`；(2) participant guard (callerProfileId 不在 → `notFound()`)；(3) SSR-side markRead via `bundle.messaging.participants.markRead`，写 `messaging.action.completed { actionName: "messaging/markThreadRead.ssr" }` info log，**不**递增 counter；(4) fetch thread + messages(200) + return view。
- 副作用：`community/test-support.ts` in-memory bundle 升级 `discovery.record/listAll` 真正持久化（之前只是 stub），让 system-notifications 测试可注入事件。
- in-memory bundle 升级影响：既有测试无依赖于 stub-empty 的 listAll → 不漂移。

## fail-first 证据

```
$ npx vitest run src/features/messaging/system-notifications.test.ts
（红：模块不存在）

$ # 实现后
$ npx vitest run src/features/messaging/
 Test Files  8 passed (8)
      Tests  39 passed (39)
```

## 全套验证

```
$ npm run typecheck   — baseline 4 errors
$ npm run lint        — 0 errors（baseline 1 warning）
$ npm run build       — success
$ npx vitest run（全套）— 18 failed | 63 passed | 2 skipped (83) | 1 failed | 325 passed (330)
                            vs T65 baseline 18 | 60 (80) | 315；新增 3 passed test files
                            +10 passed tests；既有失败集合不变
```

## Acceptance 校验

| Acceptance | 证据 |
|---|---|
| inbox-model 委托语义 | inbox-model.test ✅ |
| system-notifications 聚合 + 排序 + 限制 | system-notifications.test 5 cases ✅ |
| 自评论排除 | system-notifications.test ✅ |
| counter on/off | system-notifications.test 2 cases ✅ |
| inbox-thread-view 4 步顺序硬约束 | inbox-thread-view.test 3 cases (guest / non-participant / participant) ✅ |
| markRead 在 guard 失败时不调用 | inbox-thread-view.test spy ✅ |
| SSR markRead 写 log 但不递增 counter | inbox-thread-view.test ✅ |

## 不变量

- I-3 SSR 入口 4 步顺序硬约束 ✅
- I-5 logger 不含 body / recipient email（system-notif 与 inbox-thread-view 都遵守）✅
- I-9 inbox-model / system-notif / inbox-thread-view 都不接触 admin / 不消费 admin bundle (admin isolation 在 T64 字符串扫描断言守住)

## 文件改动

新增：
- `web/src/features/messaging/inbox-model.ts` + `inbox-model.test.ts`
- `web/src/features/messaging/system-notifications.ts` + `system-notifications.test.ts`
- `web/src/features/messaging/inbox-thread-view.ts` + `inbox-thread-view.test.ts`

修改：
- `web/src/features/community/test-support.ts`（in-memory `discovery` repo 真正持久化 record/listAll）
