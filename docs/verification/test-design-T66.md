# Test Design — T66 Inbox model + System notifications + SSR helper

## 测试单元

- `messaging/inbox-model.test.ts`：listInboxThreadsForAccount empty + delegate to bundle.
- `messaging/system-notifications.test.ts`：5 cases (empty / aggregate + sort desc / self-comment 排除 / limit / counter on/off).
- `messaging/inbox-thread-view.test.ts`：3 cases (guest redirect / non-participant notFound (markRead 不调用) / happy: markRead → fetch → return view + logger.info + counter 不递增).

## fail-first 主行为

- inbox-model 委托语义。
- system-notifications：discovery + work_comments 聚合 + self-comment 过滤 + 时间倒序 + limit + counter on metric provided.
- inbox-thread-view 4 步顺序硬约束：guest 不调 markRead；non-participant 不调 markRead；只有 participant 才进 markRead → fetch；SSR markRead 写 log 但不 +counter。

## 退出标准

- vitest 子集全绿；typecheck/lint/build baseline 不漂移。
