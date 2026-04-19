# Implementation — T58 Admin Policy + runAdminAction

- Date: `2026-04-19`

## 实现摘要

- `features/admin/admin-policy.ts`：`createAdminCapabilityPolicy` / `createAdminGuard` 纯函数实现。**关键决策**：实现放在 admin-policy.ts（而非 access-control.ts re-export）以避免 vite/sqlite bundling 影响测试 — `auth-store.ts` import `node:sqlite`，其测试当前在 baseline 18 failed 之列；admin policy 现在可独立测试。
- `features/auth/access-control.ts`：从 admin-policy 导入并 re-export；`createAccessControl` 自动注入 `adminCapability` + `adminGuard`。
- `features/admin/runtime.ts`：`runAdminAction` helper：
  - admin 校验失败 → `AppError("forbidden_admin_only", 403)`，不调用 fn。
  - 成功 → `bundle.withTransaction(fn)` 包裹（in-memory bundle 无该字段时 fallback 直接执行）+ logger.info `admin.action.completed` + 不含 `actorEmail`。
  - fn 抛 → logger.warn `admin.action.failed` + 抛错；tx 自动 rollback（如 bundle 支持）。
  - deps 全部可注入：session / adminEmails / bundle / metrics / logger（NFR-005）。
- `features/admin/test-support.ts`：fakeAdminSession / fakeNonAdminSession / fakeGuestSession（用 `createAuthenticatedSessionContext` 合成 email）+ `createAdminTestDeps` + `createCapturingLogger`。
- `features/admin/index.ts`：barrel export 新增 admin policy / runtime 入口。

## fail-first 证据

```
$ npx vitest run src/features/admin/
（红：runAdminAction / admin-policy import 不存在）

$ # 实现后
$ npx vitest run src/features/admin/
 Test Files  3 passed (3)
      Tests  21 passed (21)
```

## 全套验证

```
$ npm run typecheck   — 与 baseline 一致 4 errors（work-actions.test.ts）；T58 不引入新错
$ npm run lint        — 0 errors（baseline 1 warning）
$ npm run build       — success
$ npx vitest run（全套）— 18 failed | 46 passed (65) | 1 failed | 237 passed (240)
                              vs T57 baseline 18 | 44 (63) | 224；新增 2 passed test files = admin-policy.test + runtime.test；
                              新增 13 passed tests；既有失败集合不变
```

## Acceptance 校验

| Acceptance | 证据 |
|---|---|
| `createAdminCapabilityPolicy` 三态 | `admin-policy.test.ts` 4 case ✅ |
| `createAdminGuard` 三态 | `admin-policy.test.ts` 3 case ✅ |
| `getRequestAccessControl()` 输出含 admin 字段（I-12） | T57 实现 + studio page tests 已断言 ✅ |
| `runAdminAction` admin 校验失败抛 `forbidden_admin_only` (I-3) | `runtime.test.ts > rejects guest sessions` + `rejects non-admin authenticated sessions` ✅ |
| 成功路径 fn 调用 + completed log + 不含 actorEmail | `runtime.test.ts > invokes fn and writes admin.action.completed log` ✅ |
| 失败路径 warn log + rethrow | `runtime.test.ts > writes admin.action.failed warn log and rethrows` ✅ |
| `withTransaction` fallback (in-memory) | `runtime.test.ts > falls back to direct execution when bundle has no withTransaction` ✅ |
| `withTransaction` 有时正确 commit/rollback | `runtime.test.ts > uses bundle.withTransaction when available and rolls back on fn error` ✅ |

## 不变量

- I-1 admin policy 纯函数：admin-policy.ts 无 IO ✅
- I-3 admin 校验失败时不进入 fn / audit / metrics：`runtime.test.ts > rejects ... ` 验证 fn 未被调用 + 无 completed log ✅
- I-7 actorEmail lowercase 与 admin 名单匹配：admin-policy `candidate.toLowerCase()` ✅

## 文件改动

新增：
- `web/src/features/admin/admin-policy.ts`
- `web/src/features/admin/admin-policy.test.ts`
- `web/src/features/admin/runtime.ts`
- `web/src/features/admin/runtime.test.ts`
- `web/src/features/admin/test-support.ts`

修改：
- `web/src/features/admin/index.ts`（barrel export）
- `web/src/features/auth/access-control.ts`（移除原始 admin policy impl，从 admin-policy re-export；`createAccessControl` 调用 admin-policy 的实现）
- `web/src/features/auth/access-control.test.ts`（恢复原始 4 case；admin 部分由 admin-policy.test 覆盖）
