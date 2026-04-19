# Test Design — T61 Audit Log 后台页面

## 测试单元

- `web/src/features/admin/audit-log.test.ts`：`formatAuditAction` / `formatAuditTargetKind` 中文化映射。
- `web/src/app/studio/admin/audit/page.test.tsx`：guest redirect、admin 渲染最新 N 条 newest-first、空态文案。

## fail-first 主行为

1. formatters 返回中文标签（5 actions + 2 target kinds）。
2. SSR：guest → /login redirect。
3. SSR：admin + 0 entries → 空态文案。
4. SSR：admin + N entries → `<li>` × N，按 createdAt desc 排序，actorEmail 显示在时间戳行。

## 退出标准

- vitest 子集全绿
- typecheck/lint/build baseline 不漂移
- T57+T58+T59∪T60 → T61 ready 满足
