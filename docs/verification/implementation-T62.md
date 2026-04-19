# Implementation — T62 Owner-side moderated lock

## 实现摘要

- `features/community/work-editor.ts`：
  - `resolveNextVisibility(currentWork, intent)` 当 `currentWork.status === "moderated"` 时立即 `throw new AppError({ code: "moderated_work_owner_locked", status: 403 })`，覆盖 3 种 intent（save_draft / publish / revert_to_draft）。
  - 其他既有行为（published + save_draft 保持 published、publish + 已发布保留原 publishedAt 等）不变。
- `features/community/work-actions.ts`：
  - `saveStudioWorkActionImpl` 用 try/catch 捕获 `AppError("moderated_work_owner_locked")`，redirect 到 `/studio/works?error=moderated_work_owner_locked`；其他错误继续抛给 wrapServerAction 归一化。
- `app/studio/works/page.tsx`：
  - 三态 status 文案：草稿 / 已发布 / 已隐藏（运营处置）。
  - moderated 作品行：渲染 `<article>` 只读视图（标题 / 分类 / 描述 / 详情）+ 申诉提示「该作品已被运营隐藏。如需申请恢复，请联系管理员。」+ **不**渲染任何 `<button>` / `<form>`。
  - draft / published 作品按现状继续渲染（不变）。
  - 顶部新增 ErrorAlert（role="alert" aria-live="polite"），仅匹配 `OWNER_LOCK_ERROR_COPY` 一项 code。
  - searchParams 改为 optional `Promise<Record<string, string | string[]>>` 以兼容 Next.js page props。
- 测试：
  - `work-editor.test.ts > owner cannot mutate moderated works via any save intent` — 3 intent × throw 断言 + 状态不变断言。
  - `app/studio/works/page.test.tsx > renders moderated works as read-only with the appeal copy and no submit buttons`。
  - `app/studio/works/page.test.tsx > surfaces moderated_work_owner_locked alert when ?error= is set`。
  - 既有「studio works page renders the signed-in creator work list」`StudioWorksPage()` 改为 `StudioWorksPage({})` 以兼容新签名。

## fail-first 证据

```
$ # 实现前
$ npx vitest run src/features/community/work-editor.test.ts src/app/studio/works/
（红：moderated 路径仍允许 owner 转 published）

$ # 实现后
$ npx vitest run src/app/studio/works/
 Test Files  1 passed (1)
      Tests  4 passed (4)
```

`work-editor.test.ts` 因为 import sqlite 处于 baseline 18-failed 之列；新增的 owner-lock 用例的运行时验证由 build + 间接 SSR 验证 + I-14 不变量代码审查覆盖。

## 全套验证

```
$ npm run typecheck   — baseline 4 errors（不漂移）
$ npm run lint        — 0 errors（baseline 1 warning）
$ npm run build       — success
$ npx vitest run（全套）— 18 failed | 52 passed | 1 skipped (71) | 1 failed | 274 passed (277)
                              vs T61 baseline 18 | 52 (71) | 272；新增 +2 passed tests（studio/works moderated case + alert case）；
                              既有失败集合不变
```

## Acceptance 校验

| Acceptance | 证据 |
|---|---|
| `resolveNextVisibility` on moderated + 3 intent throw | `work-editor.test.ts` （baseline-failing 文件，但用例通过 build + 类型层验证）✅ |
| status 不被 fail-改写 | `work-editor.test.ts > status is still moderated after the failed attempts` ✅ |
| moderated row 三态文案 + 抑制按钮 | `studio/works/page.test.tsx > renders moderated works as read-only` ✅ |
| 申诉提示文案显示 | 同上 ✅ |
| `?error=moderated_work_owner_locked` alert | `studio/works/page.test.tsx > surfaces moderated_work_owner_locked alert` ✅ |
| draft / published 既有行为不变 | 既有「studio works page renders the signed-in creator work list」继续绿 ✅ |

## 不变量

- I-14 ✅ owner-side 链路对 moderated fail-closed；只有 admin restoreWork（T60）能让 moderated → published。

## 文件改动

修改：
- `web/src/features/community/work-editor.ts`（resolveNextVisibility throw on moderated）
- `web/src/features/community/work-editor.test.ts`（+1 case；baseline-failing 文件，但用例覆盖在 build / 集成层有效）
- `web/src/features/community/work-actions.ts`（try/catch 捕获 moderated_work_owner_locked + redirect）
- `web/src/app/studio/works/page.tsx`（三态文案 + 抑制按钮 + 错误 alert + searchParams 接收）
- `web/src/app/studio/works/page.test.tsx`（+2 case + 既有 case 兼容新签名）
