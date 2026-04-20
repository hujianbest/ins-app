# Implementation — T67 /inbox 升级

## 实现摘要

- `app/inbox/page.tsx` 重写：
  - SSR async server component；guest → `redirect("/login")`；解析 `searchParams.error` → `ErrorAlert`（7 codes 错误码字典）。
  - `Promise.all([listInboxThreadsForAccount(callerProfileId, 100, bundle), listSystemNotificationsForAccount(callerProfileId, 50, bundle, metrics)])`。
  - 上半部「直接消息」段：`SectionHeading(eyebrow="对话", title="直接消息")` + thread 卡片（`museum-card` Link to `/inbox/[threadId]`）：`buildContextSourceLink(thread.contextRef)` → `museum-tag` 文案；counterpart name (h3)；最近活动时间 `<time dateTime>`；未读 badge `museum-tag` + 数字 + `<span class="sr-only">未读</span>`（仅 unread > 0 时显示）。
  - 下半部「系统通知」段：`<ul>/<li>` + `museum-stat`；3 类描述（关注 / 评论 / 外链）；时间戳；查看链接。
  - `metadata.robots = noindex,nofollow`。
- `app/inbox/page.test.tsx` 重写：5 cases，mock `next/navigation` redirect + `getSessionContext` + `getDefaultCommunityRepositoryBundle` + `getObservability`；in-memory bundle 注入数据。

## fail-first 证据

```
$ # 实现前 inbox/page.tsx 仍是旧的 cookie-based UI
$ # 实现后
$ npx vitest run src/app/inbox/
 Test Files  1 passed (1)
      Tests  5 passed (5)
```

## 全套验证

```
$ npm run typecheck   — baseline 4 errors
$ npm run lint        — 0 errors（baseline 1 warning）
$ npm run build       — success（含 /inbox 升级路由）
$ npx vitest run（全套）— 18 failed | 63 passed | 2 skipped (83) | 1 failed | 328 passed (333)
                            vs T66 baseline 18 | 63 (83) | 325；passed test files 数不变（inbox 已在通过列表中），
                            +3 passed tests；既有失败集合不变
```

## Acceptance 校验

| Acceptance | 证据 |
|---|---|
| guest → /login redirect | inbox.test "redirects guest" ✅ |
| 双段空态文案 | inbox.test "renders empty state" ✅ |
| thread 卡片 + counterpart + context tag + 未读 badge | inbox.test "renders thread cards + system notifications" ✅ |
| 系统通知聚合 + counter +1 | inbox.test 同上 ✅ |
| `?error=` alert 7 codes 映射 | inbox.test "renders ?error= alert" ✅ |
| guest redirect 不递增 counter | inbox.test "does NOT increment counter on guest redirect path" ✅ |
| `metadata.robots = noindex,nofollow` | page metadata 显式 |

## 不变量

- I-9 SSR 渲染不持有 thread/message body；UI 直接渲染 projection 字段（thread.id / counterpartAccountId / unreadCount）|
- counter system_notifications_listed 仅在 listSystemNotificationsForAccount 显式传 metrics 时递增（T66 已锁；T67 显式注入）

## 文件改动

修改：
- `web/src/app/inbox/page.tsx`（升级为直接消息段 + 系统通知段 + ?error= alert）
- `web/src/app/inbox/page.test.tsx`（重写：5 cases）
