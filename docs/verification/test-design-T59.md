# Test Design — T59 Curation 后台 + 写动作

- Date: `2026-04-19`

## 测试单元

- `web/src/features/admin/curation-actions.test.ts`：3 个 server action × happy / invalid / target-not-found / 重复 upsert / tx fn-error 不写 audit。
- `web/src/app/studio/admin/curation/page.test.tsx`：guest → /login redirect；非 admin → /studio redirect；admin → 渲染 dashboard + 表格 + form；空态文案；?error= alert。

## fail-first 主行为

1. server actions 拒绝非 admin / guest（`forbidden_admin_only`）。
2. 非法 surface / sectionKind / targetType / order → `invalid_curation_input`，不写 sqlite/audit。
3. happy path：upsert 写库 + 一条 audit + counter +1（curation.added + audit.appended）。
4. 目标对象不存在 → 仍写库 + audit `note=target_not_found_at_write`。
5. 同主键重复 upsert → 视为更新，每次一条 audit。
6. removeSlot / reorderSlot 同形 happy path + counter。
7. reorder 不存在 slot → `invalid_curation_input`。
8. 业务写抛错时 audit 不应出现（in-memory bundle 不模拟 tx 但顺序保证 audit 在业务写之后）。
9. SSR page：guest → /login；非 admin → /studio；admin → 表格 + 表单 + alert。

## 退出标准

- vitest 子集全绿
- typecheck/lint/build baseline 不漂移
- 全套 baseline +1 passed test file (curation-actions) +1 failed test file (page.test —— 与既有 studio page tests 同形受 vite/sqlite bundling 限制)
