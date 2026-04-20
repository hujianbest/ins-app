# Bug Patterns — T65

## 已规避

1. **`forbidden_thread` from sendMessage redirect 暴露 thread 存在性**：form-action wrapper 在 forbidden_thread 时 redirect 到 `/inbox?error=` 而非 `/inbox/[threadId]?error=`，避免攻击者通过 URL 反弹推断 thread id 是否存在。
2. **counter 在 fn 失败时仍递增**：3 server actions 都把 `incrementXxx(metrics)` 放在 fn 内部业务写之后；fn throw → counter 不变（thread-actions tx atomicity test 覆盖）。
3. **`session.accountId` 直接用做 messaging 身份键**：违反 §1 ID 空间假设；3 server actions 全部用 `resolveCallerProfileId(session)`。
4. **message body 进入 logger context 触发隐私泄漏**：runtime 内 logger.info 仅写 `{ module, actionName, durationMs }`；fn 抛错时 warn log 字段相同（不展开 error details 到 controlled keys）。
5. **dynamic import 让 page tests 走通**：runtime 模仿 §3.2 V1 admin runtime 的 dynamic import 模式；session / bundle 默认仅在生产路径 lazy load，测试路径全部 deps 注入。

## 候选下游

- T66 SSR-side markRead 不走 server action 包装，直接调 `bundle.messaging.participants.markRead`；该路径是 SSR 副作用，counter 不递增（设计 §9.10 说明），但仍写一条 `messaging.action.completed { actionName: 'messaging/markThreadRead.ssr' }` info log（NFR-003）。
