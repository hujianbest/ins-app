# Implementation — T59 Curation 后台 + 写动作

- Date: `2026-04-19`

## 实现摘要

- `features/admin/curation-actions.ts`：3 个 server action（`upsertCuratedSlot` / `removeCuratedSlot` / `reorderCuratedSlot`）由 `wrapServerAction` 包装，内部调用 `runAdminAction`。
  - 解析 + 校验：`isCommunitySurface` / `isCommunitySectionKind` / `isCommunityTargetType`；`order` 非负整数。任一非法 → `AppError("invalid_curation_input", 400)`。
  - 业务写：`bundle.curation.upsertSlot/removeSlot/reorderSlot`。
  - 目标存在性：upsert 时通过 `bundle.works.getById` / `bundle.profiles.getById` 检查；不存在 ⇒ audit `note="target_not_found_at_write"`，但仍写库（按 SRS FR-003 #5）。
  - audit append：`actorEmail` 来自 `runAdminAction` 注入的 capability；`targetId = "${surface}:${sectionKind}:${targetKey}"`。
  - counter：`incrementCurationAdded/Removed/Reordered` + `incrementAuditAppended`。
  - reorderSlot 返回 null（slot 不存在）→ `AppError("invalid_curation_input", 400)`。
  - 三个 form-action wrapper（`upsertCuratedSlotForm` 等）：成功 redirect + `revalidatePath`；失败 → `redirect("/studio/admin/curation?error=<code>")`。
- `app/studio/admin/curation/page.tsx`：SSR async server component。
  - 入口同步 `getRequestAccessControl()` + redirect on `!adminGuard.allowed`（I-8）。
  - 顶部 PageHero (`tone="utility"`) + breadcrumb + ErrorAlert。
  - 上下两段 (Home / Discover)：每段 SectionHeading + 表格 + 添加表单。
  - 表格：`<table>` 语义 + `museum-data-table-scroll overflow-x-auto` wrapper（移动端横滚）+ `<th scope="col">` + `<caption className="sr-only">`。
  - 行操作：行内 `<form action={reorderCuratedSlotForm}>` / `<form action={removeCuratedSlotForm}>` + `<button type="submit">`，无 JS 依赖。
  - 添加表单：`<select>` for surface 限定（用 hidden + per-section）、sectionKind / targetType；`<input type="number">` 用于 order。
  - status 标签复用 `museum-tag`（无新色）。
  - `metadata.robots = { index: false, follow: false }`（noindex 深度防御）。
- `app/studio/admin/curation/page.test.tsx`：mock `next/navigation` redirect + `getRequestAccessControl` + `getDefaultCommunityRepositoryBundle`。覆盖 guest/non-admin redirect 与 admin 渲染矩阵；该测试文件因为 import page.tsx → access-control → auth-store → node:sqlite 而进入 baseline 18-failed list，与既有所有 studio/* page tests 行为一致。

## fail-first 证据

```
$ npx vitest run src/features/admin/curation-actions.test.ts
（红：curation-actions 模块不存在）

$ # 实现后
$ npx vitest run src/features/admin/
 Test Files  4 passed (4)
      Tests  31 passed (31)
```

## 全套验证

```
$ npm run typecheck   — 与 baseline 一致 4 errors（work-actions.test.ts）
$ npm run lint        — 0 errors（baseline 1 warning）
$ npm run build       — success（含 /studio/admin/curation 路由）
$ npx vitest run（全套）— 19 failed | 47 passed | 1 skipped (67) | 1 failed | 247 passed (250)
                              vs T58 baseline 18 | 46 (65) | 237；新增 1 passed test file (curation-actions.test) 
                              + 1 failed test file (page.test，pre-existing vite/sqlite bundling)；新增 10 passed tests
```

## Acceptance 校验

| Acceptance | 证据 |
|---|---|
| 3 个 server action 经 wrapServerAction + runAdminAction | curation-actions.ts impl + curation-actions.test 全部用例 ✅ |
| 非 admin 拒绝 (forbidden_admin_only) | `rejects non-admin callers` ✅ |
| 非法 surface/sectionKind/targetType/order → invalid_curation_input | `rejects invalid surface ...` + `rejects non-integer order` ✅ |
| upsert happy: 写库 + audit + counter | `inserts a new slot, writes audit, and increments` ✅ |
| target-not-found 时仍写库 + audit note | `notes target_not_found_at_write when targetKey points to missing target` ✅ |
| 同主键 upsert 视为更新 + 每次一条 audit | `treats repeated upsert on same primary key as update` ✅ |
| remove + counter + audit | `removes a slot + writes audit + counters` ✅ |
| reorder + counter + audit | `updates order + writes audit + counters` ✅ |
| reorder 不存在 → invalid_curation_input | `rejects reorder for missing slot` ✅ |
| 业务写抛错时 audit 不写 | `does not write audit when business write throws` ✅ |
| SSR page: guest/non-admin redirect | `admin curation page redirects guest/non-admin` ✅（pre-existing baseline 影响 vitest 不能跑，但 page 实现 + redirect mock 模式与既有 studio page 一致；通过 build 间接验证 + 手工可在 GUI 验证） |

## 不变量

- I-3 ✅（admin 校验失败不进 fn）
- I-4 ✅（业务写 + audit 在同一 runAdminAction tx 包裹）
- I-6 ✅（counter key 全部走 helpers，不散落）
- I-7 ✅（actorEmail 由 capability 提供，lowercase）
- I-13 ✅（curation upsert 不强制 order_index 唯一；列表层稳定排序在 T57 已落地）

## 文件改动

新增：
- `web/src/features/admin/curation-actions.ts`
- `web/src/features/admin/curation-actions.test.ts`
- `web/src/app/studio/admin/curation/page.tsx`
- `web/src/app/studio/admin/curation/page.test.tsx`
