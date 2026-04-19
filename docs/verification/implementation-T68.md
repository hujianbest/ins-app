# Implementation — T68 /inbox/[threadId] + 30s polling

## 实现摘要

- `app/inbox/[threadId]/page.tsx`：SSR async server component；调 `loadInboxThreadView(threadId, session, { bundle, logger })`（T66 helper）→ guest redirect / non-participant notFound 由 helper 兜底；解析 `searchParams.error` → ErrorAlert。
  - PageHero：`eyebrow="对话"`, `title=<counterpartProfileId>`, `description=<contextLink.label>`。
  - 顶部「← 返回收件箱」link。
  - 主面板 `museum-panel museum-panel--soft`：消息时间线（`<ol>` + `<li>` `museum-stat`，自己消息 `ml-auto text-right` flex 布局）+ 发送表单 `<form action={sendMessageForm}>`（hidden threadId + textarea name="body" maxLength=4000 + 「发送」museum-button-primary）。
  - 末尾挂 `<InboxThreadPoll intervalMs={30_000} />`。
  - `metadata.robots = noindex,nofollow`。
- `app/inbox/[threadId]/poll-client.tsx`：`'use client'`；`useEffect(() => setInterval(() => router.refresh(), intervalMs), [router, intervalMs])` + cleanup；返回 `null`；props 仅 `intervalMs?: number`，不传任何 thread / message 数据（I-9 隐私不变量）。

## fail-first 证据

```
$ npx vitest run "src/app/inbox/[threadId]/"
（红：模块不存在）

$ # 实现后
$ npx vitest run src/app/inbox/
 Test Files  3 passed (3)
      Tests  13 passed (13)
```

## 全套验证

```
$ npm run build       — success（含 /inbox + /inbox/[threadId] 两个路由 build）
$ npx vitest run（全套）— 18 failed | 65 passed | 2 skipped (85) | 1 failed | 336 passed (341)
                            vs T67 baseline 18 | 63 (83) | 328；新增 2 passed test files
                            (poll-client + threadId page)；新增 8 passed tests；既有失败集合不变
```

## Acceptance 校验

| Acceptance | 证据 |
|---|---|
| guest → /login | threadId page.test ✅ |
| non-participant → notFound | threadId page.test ✅ |
| participant 渲染消息时间线 + 表单 | threadId page.test ✅ |
| markRead 已写 last_read_at | threadId page.test ✅ |
| ?error= alert 7 codes 映射 | threadId page.test ✅ |
| `<InboxThreadPoll />` 不传 thread / message data | poll-client.test "props 仅 intervalMs" ✅ |
| 30s 轮询 router.refresh + cleanup | poll-client.test fake timer ✅ |
| metadata.robots = noindex,nofollow | page metadata 显式 |

## 不变量

- I-3 SSR 4 步顺序硬约束（loadInboxThreadView 已锁；page.tsx 只调 helper）|
- I-9 client poll 数据无关；props 仅 intervalMs ✅
- I-11 thread 不存在 vs 非 participant 统一 notFound（loadInboxThreadView ✅）

## 文件改动

新增：
- `web/src/app/inbox/[threadId]/page.tsx` + `page.test.tsx`
- `web/src/app/inbox/[threadId]/poll-client.tsx` + `poll-client.test.tsx`
