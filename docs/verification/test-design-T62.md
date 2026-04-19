# Test Design — T62 Owner-side moderated lock (FR-004 #6 / I-14)

## 测试单元

- `web/src/features/community/work-editor.test.ts`（扩展）：moderated 作品上 owner 的 3 种 intent 都 throw `moderated_work_owner_locked`；既有 published / draft 行为不变。
- `web/src/app/studio/works/page.test.tsx`（扩展）：moderated 作品行渲染只读视图 + 抑制处置按钮 + 申诉提示；?error=moderated_work_owner_locked 触发 alert。

## fail-first 主行为

1. work-editor `resolveNextVisibility` on moderated work + 任何 intent → throw AppError("moderated_work_owner_locked", 403)。
2. moderated 作品 status 不被 fail 改写（仍是 moderated）。
3. /studio/works 渲染 moderated 作品：标签「已隐藏（运营处置）」+ 申诉提示文案 + DOM 中 `<article>` 不含 `<button>`。
4. ?error= 触发 alert role + 中文文案 + 包含 code。

## 退出标准

- vitest 子集全绿
- typecheck/lint/build baseline 不漂移
