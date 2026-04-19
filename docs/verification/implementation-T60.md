# Implementation — T60 Work moderation 后台 + 公开屏蔽闭环

## 实现摘要

- `features/admin/work-moderation-actions.ts`：
  - `hideWork(workId)` / `restoreWork(workId)` server actions（wrapServerAction 包装）。
  - `transitionWork` 内部 helper：getById → 校验存在 + status 状态机 → save + audit + counter。
  - status 校验：hide 仅允许 `published`；restore 仅允许 `moderated`。其他状态 → `AppError("invalid_work_status_transition", 400)`。
  - 不存在 workId → `AppError("work_not_found", 404)`。
  - hide / restore 都保留 `existing.publishedAt`，不重置；`updatedAt = new Date().toISOString()`。
  - audit `targetKind="work"` `targetId=workId`；counter `admin.work_moderation.{hidden,restored}` + `admin.audit.appended`。
  - form-action wrappers (`hideWorkForm` / `restoreWorkForm`) 走 redirect on success / `?error=` on failure。
- `app/studio/admin/works/page.tsx`：
  - SSR async server component；admin guard 同步阶段执行。
  - `bundle.works.listAllForAdmin()` 返回所有 status；表格按 `updatedAt desc`（in-memory + sqlite 都已实现）。
  - status 标签三态（草稿 / 已发布 / 已隐藏）走 `museum-tag` 不引入新色（UI-ADR-1）。
  - 处置按钮：published → 「隐藏」；moderated → 「恢复」；draft → 「—」（无按钮）。
  - 空态：全库 0 作品 / 全库仅 draft 两种文案。
  - `metadata.robots = { index: false, follow: false }`。
- `features/community/public-read-model.test.ts`：新增 `public read paths hide moderated works the same way as drafts` 用例覆盖 `getPublicWorkPageModel` / `listPublicWorkPageParams` / `showcaseItems` 三处。
- `features/recommendations/related-works.test.ts`：新增 `excludes moderated works from the candidate pool` 用例。

## fail-first 证据

```
$ npx vitest run src/features/admin/work-moderation-actions.test.ts
（红：work-moderation-actions 模块不存在）

$ # 实现后
$ npx vitest run src/features/admin/work-moderation-actions.test.ts
 Test Files  1 passed (1)
      Tests  10 passed (10)
```

## 全套验证

```
$ npm run typecheck   — baseline 4 errors（不漂移）
$ npm run lint        — 0 errors（baseline 1 warning）
$ npm run build       — success（含 /studio/admin/works 路由）
$ npx vitest run（全套）— 20 failed | 48 passed | 1 skipped (69) | 1 failed | 258 passed (261)
                              vs T59 baseline 19 | 47 (67) | 247；新增 1 passed test file (work-moderation-actions) 
                              + 1 failed test file (page test，与既有 studio page tests 同形)；新增 11 passed tests
```

## Acceptance 校验

| Acceptance | 证据 |
|---|---|
| hide/restore 拒绝非 admin | `rejects non-admin callers` ✅ |
| 不存在 workId → work_not_found | `rejects unknown workId with work_not_found` ✅ |
| hide 状态机：仅 published；其他 → invalid_work_status_transition | `rejects hide on draft` + `rejects hide on already moderated work` ✅ |
| restore 状态机：仅 moderated | `rejects restore on published work` + `rejects restore on draft work` ✅ |
| hide → moderated + audit + counter | `flips published → moderated, writes audit, increments counters` ✅ |
| restore → published + audit + counter | `flips moderated → published, writes audit, increments counters` ✅ |
| restore 保留 publishedAt | `preserves existing publishedAt when restoring` ✅ |
| tx atomicity（业务写错 → audit 不写） | `does not write audit when business write throws (tx atomicity)` ✅ |
| 公开 read model 屏蔽 moderated（5 surface） | `public-read-model.test > public read paths hide moderated works the same way as drafts` + 推荐 `excludes moderated works from the candidate pool` ✅ |
| SSR page: guest/non-admin redirect / admin 渲染 / 空态 / alert | page test 4 case（受 vite/sqlite bundling 限制；行为通过 build + GUI 可验证） |

## 不变量

- I-3 / I-4 / I-6 / I-7：admin 校验失败 不进 fn；audit 在同一 tx；counter 走 helpers；actorEmail lowercase ✅
- I-9：moderated 与 draft 同形屏蔽（5 公开 surface 全覆盖）✅

## 文件改动

新增：
- `web/src/features/admin/work-moderation-actions.ts` + `.test.ts`
- `web/src/app/studio/admin/works/page.tsx` + `.test.tsx`

修改：
- `web/src/features/community/public-read-model.test.ts`（+1 case）
- `web/src/features/recommendations/related-works.test.ts`（+1 case）
