# Bug Patterns — T68

## 已规避

1. **客户端 `<InboxThreadPoll />` 持有 thread/message 数据触发 SSR/CSR data drift**：props 仅 `intervalMs?: number`；I-9 守住；poll-client.test type-level + runtime 双重断言。
2. **客户端 polling cleanup 缺失 → 内存泄漏 + tab 切换后多 timer 叠加**：`useEffect` return `clearInterval(id)`；poll-client.test "clears the interval on unmount" 守住。
3. **30s 触发 router.refresh 在用户输入 textarea 时 reset 表单**：`router.refresh()` 不触发完全 re-mount，server component 重 fetch + diff；textarea uncontrolled，浏览器自动保留输入（V1 默认；V2 评估 controlled state + autosave）。
4. **markRead 在 page 渲染前由 server action wrapper 调用导致 transaction 双层**：T68 page 调 `loadInboxThreadView` SSR helper，内部直接调 `bundle.messaging.participants.markRead`，不经过 server action wrapper（design §9.10）。
5. **PageHero 标题暴露对方 displayName + email**：V1 仅显示 counterpartProfileId（`${role}:${slug}`，无 email）；隐私边界 NFR-002 满足。

## 候选下游

- T69 contact migration 后，所有 `startContactThreadAction` 路径 redirect 到 `/inbox/[threadId]`（T68 已实现）；T69 测试只需断言 redirect 目标即可。
