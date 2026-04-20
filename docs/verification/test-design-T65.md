# Test Design — T65 Resolver + Runtime + Server Actions

## 测试单元

- `messaging/runtime.test.ts`：`runMessagingAction` guest 抛 unauthenticated；happy path 写 `messaging.action.completed`；fn throw 写 `messaging.action.failed`；in-memory bundle (无 withTransaction) 直接执行 fallback。
- `messaging/thread-actions.test.ts`：3 个 server action × 全部错误码路径 + happy + counter 形态 + tx atomicity（in-memory bundle counter 在 fn 抛错前不递增）。

## fail-first 主行为

1. runtime guest → unauthenticated；fn 不被调用。
2. createOrFindDirectThread guest / self / unknown recipient / happy / 重复 / 反向 dedupe.
3. sendMessage empty / too long / non-participant / happy.
4. markThreadRead non-participant / happy.
5. tx atomicity: fn 内部抛错 → counter 未递增（计数发生在 fn 末尾）。

## 退出标准

- vitest 子集全绿；typecheck/lint/build baseline 不漂移。
