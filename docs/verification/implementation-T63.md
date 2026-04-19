# Implementation — T63 Admin Dashboard + /studio admin entry card

## 实现摘要

- `app/studio/admin/page.tsx`：SSR async server component。
  - admin guard 同步阶段执行 redirect。
  - 顶部 `museum-panel museum-panel--soft` 显示「当前管理员: <email>」+「admin 名单大小: N」。
  - 三张 `museum-card` 入口卡链向 `/studio/admin/curation` / `/studio/admin/works` / `/studio/admin/audit`，含中文 label + description。
  - `metadata.robots = { index: false, follow: false }`。
- `app/studio/admin/page.test.tsx`：3 case 覆盖 guest redirect / non-admin redirect / admin 渲染 + 邮箱 + 名单大小 + 三张卡链接。
- `app/studio/page.tsx`：在既有 4 张 studio 入口卡之后，conditionally render 第五张 admin 入口卡 → `accessControl.adminCapability.isAdmin === true` 才显示。
- `app/studio/page.test.tsx`：现有 model 用例补 `queryByRole(... /进入运营后台/) === null`；新增 admin 用例断言 link href = `/studio/admin`。

## fail-first 证据

```
$ # 实现前
$ npx vitest run src/app/studio/admin/
（红：admin/page.tsx 不存在）

$ # 实现后
$ npx vitest run src/app/studio/
 Test Files  8 passed (8)
      Tests  26 passed (26)
```

## 全套验证

```
$ npm run typecheck   — baseline 4 errors（不漂移）
$ npm run lint        — 0 errors（baseline 1 warning）
$ npm run build       — success（含 /studio/admin 路由）
$ npx vitest run（全套）— 18 failed | 53 passed | 1 skipped (72) | 1 failed | 278 passed (281)
                              vs T62 baseline 18 | 52 (71) | 274；新增 1 passed test file (admin dashboard) +4 passed tests
```

## Acceptance 校验

| Acceptance | 证据 |
|---|---|
| /studio/admin guest → /login | page test `redirects guest` ✅ |
| /studio/admin 非 admin → /studio | page test `redirects non-admin` ✅ |
| dashboard 三张入口卡 | page test `renders three entry cards + admin email + allowlist size` ✅ |
| dashboard 显示 admin 邮箱 + 名单大小 | 同上 ✅ |
| /studio admin 显示入口卡 | studio/page test `renders the admin entry card for admin users` ✅ |
| /studio 非 admin 不显示入口卡（FR-002 #5） | studio/page test `queryByRole ... === null` ✅ |

## 不变量

- I-8 SSR 入口同步阶段 redirect ✅
- I-12 getRequestAccessControl 输出含 admin 字段 ✅
- FR-002 #5：非 admin 用户 DOM 中不暴露入口卡（对 admin 后台存在性零暴露）✅

## 文件改动

新增：
- `web/src/app/studio/admin/page.tsx` + `page.test.tsx`

修改：
- `web/src/app/studio/page.tsx`（条件渲染 admin 入口卡）
- `web/src/app/studio/page.test.tsx`（+1 case + 既有 case 补 query null 断言）
