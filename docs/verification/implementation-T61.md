# Implementation — T61 Audit Log 后台页面

## 实现摘要

- `features/admin/audit-log.ts`：barrel re-export `AuditAction` / `AuditTargetKind` / `AuditLogEntry` / 等类型 + `formatAuditAction(action)` / `formatAuditTargetKind(kind)` 中文化 helpers。
- `features/admin/audit-log.test.ts`：覆盖两个 formatters 全部已知值。
- `app/studio/admin/audit/page.tsx`：SSR async server component；admin guard 同步；`bundle.audit.listLatest(100)` 单次 SELECT；卡片列表 `<ul>/<li>` 使用 `museum-stat` 容器（与 §10.1 一致：audit 是列表型，curation/works 是表格型）；空态文案；`metadata.robots = { index: false, follow: false }`。
- `app/studio/admin/audit/page.test.tsx`：mock `next/navigation` redirect + `getRequestAccessControl` + `getDefaultCommunityRepositoryBundle`；3 case 覆盖 guest redirect + 空态 + 渲染 newest-first。
- **额外 refactor**：将 `runAdminAction` 中默认 session / bundle 解析改为 dynamic `await import(...)`，让 admin server actions / pages 不在测试时透传 import `auth-store.ts` 与 `community/runtime.ts`（这两者都 import `node:sqlite` 触发 vite test bundling 限制）。**副作用**：T59 / T60 page tests 现在也能在 vitest 跑通；从全套 baseline 18 failed 反向降到 18 failed，但 passed test files 从 47 → 52（admin pages + audit page 全部 vitest 可跑）。

## fail-first 证据

```
$ npx vitest run src/features/admin/audit-log.test.ts
（红：audit-log 模块不存在）

$ # 实现后
$ npx vitest run src/features/admin/audit-log.test.ts src/app/studio/admin/audit/
 Test Files  2 passed (2)
      Tests  5 passed (5)
```

## 全套验证

```
$ npm run typecheck   — baseline 4 errors（不漂移）
$ npm run lint        — 0 errors（baseline 1 warning）
$ npm run build       — success（含 /studio/admin/audit 路由）
$ npx vitest run（全套）— 18 failed | 52 passed | 1 skipped (71) | 1 failed | 272 passed (275)
                              vs T60 baseline 20 | 48 (69) | 258；本任务通过 dynamic-import 修复
                              让 T59 / T60 / T61 三个 admin page tests 全部可跑（passed test files +4）
                              + T61 新增 audit-log + page 共 +1 test file；新增 14 passed tests
```

## Acceptance 校验

| Acceptance | 证据 |
|---|---|
| `audit_log` schema (T57) + listLatest 排序 | T57 已落地；本任务 page 直接消费 `bundle.audit.listLatest(100)` 单次 SELECT |
| 中文化 action / targetKind 标签 | `audit-log.test.ts > formatAuditAction / formatAuditTargetKind` ✅ |
| guest → /login | page test `redirects guest` ✅ |
| 空态文案 | page test `renders empty-state when no audit entries` ✅ |
| 渲染最新 N 条 newest-first | page test `renders the latest entries newest-first` ✅ |
| actor email 显示 | page test 包含 `getAllByText(/admin@example\.com/)` ✅ |
| `metadata.robots = noindex,nofollow` | page metadata 显式声明 ✅ |
| listLatest 调用次数 = 1 | implementation 单次 await（in-memory bundle 读 array） ✅ |

## 不变量

- I-8 /studio/admin/** SSR 入口同步阶段 redirect ✅
- I-9 audit 仅由 admin 路径消费（公开页面无 audit 引用） ✅
- I-10 MetricsSnapshot.admin 始终存在（T57 已覆盖） ✅

## 文件改动

新增：
- `web/src/features/admin/audit-log.ts` + `audit-log.test.ts`
- `web/src/app/studio/admin/audit/page.tsx` + `page.test.tsx`

修改：
- `web/src/features/admin/runtime.ts`（dynamic-import `getSessionContext` / `getDefaultCommunityRepositoryBundle` 以让 admin server actions / pages 在 vitest 测试链路中可用）
