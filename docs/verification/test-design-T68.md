# Test Design — T68 /inbox/[threadId] + 30s poll

## 测试单元

- `app/inbox/[threadId]/page.test.tsx`：4 cases — guest redirect / non-participant notFound / participant 渲染消息时间线 + 表单 + markRead 已写 / ?error= alert。
- `app/inbox/[threadId]/poll-client.test.tsx`：4 cases — render no DOM / 30s 轮询 router.refresh / cleanup on unmount / props 仅 intervalMs (I-9)。

## fail-first 主行为

- guest → /login。
- non-participant → notFound（不暴露 thread 是否存在）。
- participant → 消息时间线 + 表单 + 标记已读。
- ?error= → alert role + 中文 copy。
- poll-client：fake timer 推进 → router.refresh() 调用计数 + cleanup 不再触发。

## 退出标准

- vitest 子集全绿；既有 baseline 18 不变。
