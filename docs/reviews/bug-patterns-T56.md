# Bug Patterns — T56

- Task: T56
- Date: `2026-04-19`

## 已规避的潜在 bug 模式

1. **route handler 本地类型联合不与 `DiscoveryEventType` 同步漂移**：T56 把 `DiscoveryEventRequestBody.eventType` 直接绑定到 `DiscoveryEventType`，未来任何对该联合的扩展（例如后续 §3.6 增量补 `related_card_click`）都自动被 route handler 接受，避免"上层联合扩展但 route handler 忘记同步"造成 5xx。
2. **dedupe key 跨 surface 误吞**：`buildDedupeKey` 的 key 为 `${eventType}:${targetId}:${surface}`，dedupe 测试显式断言"换了 surface 仍各自 fire"避免漂移。
3. **sendBeacon 不可用时静默失败**：fallback fetch 路径覆盖，确保 SSR 后浏览器 hydrate 阶段没有 sendBeacon 时仍能投递 `related_card_view` 事件。
4. **未登录用户 actorAccountId 没传 null 而是 undefined**：route handler 写 `session.accountId`，session.accountId 在 guest 状态返回 `null`；`recordDiscoveryEvent` 接收的 `actorAccountId` 类型是 `string | null`；测试显式断言 guest 路径 `actorAccountId === null`。

## 候选下游 bug 模式

- 未来如果新增 `related_card_click`：必须同步在 view-beacon 里 emit 该事件 + 在 route handler 测试中加 case；type 层会编译通过但运行时 dedupe 与 metrics 命名空间不会自动出现，需要新 metrics counter（仿照 §3.6 V2 增量）。
