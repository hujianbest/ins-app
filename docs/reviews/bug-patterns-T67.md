# Bug Patterns — T67

## 已规避

1. **counter 在 guest redirect 路径仍递增**：guest redirect 在 `Promise.all` 之前；counter 仅在 SSR 走到 listSystemNotificationsForAccount 时调用，guest 永远不到。专门测试用例守住。
2. **未读 badge 仅依赖颜色**：使用 `museum-tag` + 数字 + `<span class="sr-only">未读</span>`，符合 WCAG 1.4.1。
3. **错误 alert 抢占焦点**：`role="alert"` + `aria-live="polite"` 不抢焦点；alert 不替换主体内容。
4. **counterpartAccountId 直接渲染为 h3 暴露原始 profile id 字符串**：V1 显示原始 `${role}:${slug}` 作为 placeholder（spec 已声明 V2 评估查 profile.name）；不展示对方 email；NFR-002 隐私保持。
5. **inbox 直接消费 getInboxThreadsForRole（旧 cookie 路径）**：T67 直接消费新 `listInboxThreadsForAccount`，T69 再清理 contact/state.ts；解耦避免 T67/T69 互相阻塞。

## 候选下游

- T68 `/inbox/[threadId]` 详情页同样使用 4 步 SSR helper + `<InboxThreadPoll />` client component；错误码字典与 T67 共享文案。
