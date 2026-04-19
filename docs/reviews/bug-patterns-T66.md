# Bug Patterns — T66

## 已规避

1. **SSR markRead 在 guard 之前调用 → 暴露 thread 存在性**：loadInboxThreadView 严格 4 步顺序，markRead spy 断言守住（"non-participant: markRead 未调用"）。
2. **SSR markRead 把 counter 拉高 → 与用户主动 markRead 混淆**：design §9.10 显式区分；实现侧 SSR 路径仅写 log 不调 incrementThreadsRead；user-action markThreadReadForm 才递增。
3. **system_notifications 把自评论计入 inbox**：authorAccountId === accountId 显式排除；测试覆盖。
4. **system_notifications 把 NULL targetProfileId 命中所有人**：filter `event.targetProfileId !== accountId` 严格相等比较，NULL 永远不等 → 自动过滤。
5. **system-notif counter 在 listSystemNotifications 内部 unconditional 递增 → /inbox 无 metrics 注入也增加**：counter 仅在 metrics 显式注入时递增；T67 page 调用时按 spec 显式传入。
6. **in-memory bundle.discovery.listAll 返回 stub `[]` 让 system-notif 测试无法注入事件**：T66 一并升级 in-memory bundle 真正持久化 record，回填测试可控状态。

## 候选下游

- T67 /inbox SSR 渲染时必须显式传入 metrics（system-notif counter 递增依赖 metrics 参数）；否则 counter 不计。
