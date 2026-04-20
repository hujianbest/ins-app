# Implementation — T65 Resolver + Runtime + Server Actions

## 实现摘要

- `messaging/runtime.ts`：`runMessagingAction` helper：guest 抛 `unauthenticated` (401) 不进入 fn；`bundleWithTransaction` fallback；`messaging.action.completed` info / `messaging.action.failed` warn 双 log（仅 module / actionName / durationMs，不含 body / recipient email）。dynamic import session / bundle 默认（沿用 §3.2 admin runtime 同形）。
- `messaging/thread-actions.ts`：3 server action + 3 form-action wrappers：
  - `createOrFindDirectThread(recipientAccountId, contextRef, deps?)` → 用 `resolveCallerProfileId(session)` 推导 callerProfileId；self → invalid_self_thread；recipient `bundle.profiles.getById` 不存在 → recipient_not_found；unordered pair dedupe via `findDirectThreadByUnorderedPair`；新建 → counter `messaging.threads_created` +1。
  - `sendMessage(threadId, body)` → trim + length 校验（empty / too_long）；participant guard via `participants.listForThread`；append + updateLastMessageAt 同事务；counter +1。
  - `markThreadRead(threadId)` → participant guard；markRead；counter +1。
  - `sendMessageForm` / `markThreadReadForm` form-action wrappers：成功 redirect to `/inbox/[threadId]`；失败按错误码 redirect `/inbox/[threadId]?error=` 或（forbidden_thread）`/inbox?error=` 防止 thread 存在性泄漏。

## fail-first 证据

```
$ # 实现前
$ npx vitest run src/features/messaging/thread-actions.test.ts
（红：thread-actions 模块不存在）

$ # 实现后
$ npx vitest run src/features/messaging/
 Test Files  5 passed (5)
      Tests  29 passed (29)
```

## 全套验证

```
$ npm run typecheck   — baseline 4 errors
$ npm run lint        — 0 errors（baseline 1 warning）
$ npm run build       — success
$ npx vitest run（全套）— 18 failed | 60 passed | 2 skipped (80) | 1 failed | 315 passed (320)
                            vs T64 baseline 18 | 58 (78) | 298；新增 2 passed test files (runtime + thread-actions)
                            +17 passed tests；既有失败集合不变
```

## Acceptance 校验

| Acceptance | 证据 |
|---|---|
| runtime guest 抛 unauthenticated 不进 fn | runtime.test ✅ |
| double log 形态 | runtime.test happy + failure ✅ |
| createOrFindDirectThread happy / self / unknown / 重复 / 反向 dedupe | thread-actions.test 5 cases ✅ |
| sendMessage empty / too_long / non-participant / happy + counter | thread-actions.test 4 cases ✅ |
| markThreadRead non-participant / happy + counter | thread-actions.test 2 cases ✅ |
| tx atomicity (counter 未递增 when fn throws) | thread-actions.test ✅ |
| form-action wrappers redirect 协议 | code review (sendMessageForm / markThreadReadForm) |

## 不变量

- I-2 ✅ participant guard 前置
- I-3 ✅ guest / non-participant 不进入 fn / counter
- I-4 / I-5 ✅ message body / recipient email 不进 log
- I-7 ✅ counter 在 fn 末尾递增（fn 抛错时不递增）
- A-007 ✅ 全部 server action 用 `resolveCallerProfileId`，不依赖 `session.accountId`

## 文件改动

新增：
- `web/src/features/messaging/runtime.ts` + `runtime.test.ts`
- `web/src/features/messaging/thread-actions.ts` + `thread-actions.test.ts`
