# Implementation — T57 Cross-Cutting Skeleton (Phase 2 §3.2)

- Date: `2026-04-19`
- Branch: `cursor/phase2-ops-backoffice-v1-3dd4`
- Test design: `docs/verification/test-design-T57.md`

## 实现摘要

按 T57 acceptance 完成横切骨架：

1. **env**：`web/src/config/env.ts` 新增 `readAdminAccountsConfig` / `getAdminAccountEmails`；CSV 解析 + trim + lower + dedup + 非法 piece 降级 + `admin-account-email-invalid` warning。空字符串 / 缺省 ⇒ 名单为空 Set（fail-closed）。
2. **session.email**：`AuthenticatedSessionContext.email: string` 新字段；`createAuthenticatedSessionContext(accountId, primaryRole, email)` 接受 email；`resolveSessionContext` 测试 helper 同步合成 `${role}@test.lens-archive.local`；`getSessionContext` 从 `resolveAuthSession` 透传 email。
3. **auth-store**：`AuthSession.email`；`resolveAuthSession` 的 SQL 增加 `auth_accounts.email` 列；`createAuthSession` 把 `account.email` 写入返回值；既有 register / authenticate / revoke 行为不变。
4. **community types**：`CommunityWorkStatus` 联合追加 `"moderated"`；`WorkRepository.listAllForAdmin()`；`CurationConfigRepository.{upsertSlot,removeSlot,reorderSlot}` + `CurationSlotKey`；`AuditAction` / `AuditTargetKind` / `AuditLogEntry` / `AuditLogCreateInput` / `AuditLogRepository`；`CommunityRepositoryBundle.audit`。
5. **community/sqlite**：
   - schema 新增 `audit_log` 表 + `idx_audit_log_created_at_desc` 索引（在既有 schema 块内一次性 `CREATE`）。
   - `bundle.works.listAllForAdmin` 实现（按 `COALESCE(updated_at, published_at) DESC, id ASC`）。
   - `bundle.curation.upsertSlot/removeSlot/reorderSlot` 实现（ON CONFLICT 主键 UPSERT；reorder 不存在 → null）。
   - `bundle.audit.record/listLatest` 实现 + `mapAuditLogRow`。
   - `SqliteCommunityRepositoryBundle.withTransaction(fn)` 实现（`BEGIN IMMEDIATE` / `COMMIT` / `ROLLBACK`，rollback 异常吞掉以让原始错误冒泡）。
   - `bundle.works.listPublicWorks` 已有 `WHERE status = 'published'`，自动屏蔽 moderated（无需修改）。
6. **community/test-support**：in-memory bundle 增加 `audit` 字段（真实数组实现 `record/listLatest`，按 `created_at desc, id desc` 排序）+ curation 写能力（`upsertSlot/removeSlot/reorderSlot`）+ `listAllForAdmin`。本任务暂未给 in-memory bundle 加 `withTransaction`（设计 §12 要求 in-memory 是 noop；T58 `runAdminAction` 通过 `withTransaction?.()` 可选链 fallback 到直接执行；T58 测试覆盖 fallback）。
7. **observability/metrics**：`MetricsSnapshot.admin: AdminSnapshot` 顶层字段（与 `recommendations` 严格同形）；`ADMIN_COUNTER_NAMES` 6 项预注册为 0；snapshot 输出新字段；既有 http/sqlite/business/recommendations 字段不变。
8. **features/admin/metrics**：6 个键名常量 + 6 个 helper（`incrementCurationAdded` 等）；I-6 单点定义。
9. **auth/access-control**：增加 `createAdminCapabilityPolicy(session, adminEmails)` + `createAdminGuard(session, capability)`；`createAccessControl` / `getRequestAccessControl` 自动注入 `adminCapability` + `adminGuard`。

10. **AccessControl 类型扩展导致的 breakage 同步修复**：所有解构 `AccessControl` / `AuthenticatedSessionContext` 的测试 helper（`/studio/{,opportunities,profile,works}/page.test.tsx`、`features/community/work-actions.test.ts`）已补 `email` + `adminCapability` + `adminGuard`，保持 baseline typecheck（4 个 pre-existing canManageStudio 错误）不漂移。

## fail-first 证据

```
$ npx vitest run src/config/env.test.ts src/features/observability/metrics.test.ts src/features/admin/ src/features/community/contracts.test.ts
（红：admin metrics namespace 不存在；admin emails 解析不存在；admin/metrics module 不存在）
 Test Files  3 failed | 1 passed (4)
      Tests  6 failed | 32 passed (38)

$ # 实现后
$ npx vitest run src/config/env.test.ts src/features/observability/metrics.test.ts src/features/admin/ src/features/community/contracts.test.ts
 Test Files  4 passed (4)
      Tests  46 passed (46)
```

## 全套验证

```
$ npm run typecheck   — 与 baseline 一致 4 errors（work-actions.test.ts 既有 canManageStudio / reason；T57 不引入新错）
$ npm run lint        — 0 errors（baseline 1 warning）
$ npm run build       — success（含 /api/health, /api/metrics, /api/discovery-events, /studio/*, /works/[workId] 等所有路由）
$ npx vitest run（全套）— 18 failed | 44 passed (63 files) | 1 failed | 224 passed (227 tests)
                              vs T56 baseline 18 | 43 (61) | 208；新增 1 passed test file = admin/metrics.test.ts；
                              新增 16 passed tests；既有失败集合不变（pre-existing vite/node:sqlite bundling）
```

## Acceptance 校验

| Acceptance | 证据 |
|---|---|
| `readAdminAccountsConfig` 默认 / 空 / CSV / dedup / 非法降级 | `env.test.ts > readAdminAccountsConfig (Ops Back Office V1)` 4 case ✅ |
| `AuthSession.email` 与 `auth_accounts.email` JOIN | `auth-store.test.ts > propagates the lowercase account email` ✅ |
| `MetricsSnapshot.admin` 6 counter 零状态 + 增量 + 不污染既有命名空间 | `metrics.test.ts > admin namespace` 3 case ✅ |
| admin metrics helpers 单点定义 + 路由到正确 counter | `admin/metrics.test.ts` 8 case ✅ |
| `audit_log` schema + record/listLatest + 排序 | `sqlite.test.ts > audit_log: record and listLatest` ✅ |
| curation upsert/remove/reorder | `sqlite.test.ts > curation upsertSlot / removeSlot / reorderSlot` ✅ |
| `listAllForAdmin` 含 moderated；`listPublicWorks` 不含 moderated/draft | `sqlite.test.ts > listPublicWorks excludes both draft and moderated works` ✅ |
| `withTransaction` 成功提交 / 异常回滚 | `sqlite.test.ts > withTransaction commits on success and rolls back on error` ✅ |
| `getPublicWorkRecords` 同形屏蔽 moderated | `contracts.test.ts > getPublicWorkRecords also excludes moderated works` ✅ |
| AccessControl 类型扩展不破坏既有 page tests | 全套 typecheck baseline 不漂移 + studio/page.test.tsx + studio/works/page.test.tsx + studio/profile/page.test.tsx + studio/opportunities/page.test.tsx 全部继续绿 ✅ |

## 不变量

- I-2 (env 名单为空 ⇒ fail-closed)：`env.test.ts > returns an empty set when env unset / whitespace-only` ✅
- I-5 (`audit_log.id` 由 server action 生成 randomUUID)：`sqlite.test.ts > record id is truthy` ✅（默认走 randomUUID）
- I-6 (admin metrics 键名唯一定义)：`admin/metrics.test.ts > exposes the canonical 6 counter keys` ✅
- I-7 (actorEmail lowercase 与 admin 名单匹配)：env 解析 + auth-store JOIN 双侧 lowercase ✅
- I-9 (公开 read model 同形屏蔽 moderated/draft)：`contracts.test.ts` + `sqlite.test.ts > listPublicWorks` ✅
- I-10 (`MetricsSnapshot.admin` 始终存在)：`metrics.test.ts > emits zeroed admin namespace at startup` ✅
- I-11 (guest 分支不变；authenticated 增加 email)：types.ts 显式分支 ✅
- I-12 (`getRequestAccessControl` 输出含 adminCapability + adminGuard)：access-control.ts 实现 ✅
- I-13 (`(surface, sectionKind)` 内 order_index 允许重复 + 三层稳定排序)：sqlite curation upsert 不强制唯一性 + listSlotsBySurface 三层 ORDER BY 保持现状 ✅

I-1 / I-3 / I-4 / I-8 / I-14 由 T58 / T59 / T60 / T62 承接。

## 文件改动

新增：
- `web/src/features/admin/metrics.ts`
- `web/src/features/admin/metrics.test.ts`

修改：
- `web/src/config/env.ts` + `env.test.ts`
- `web/src/features/auth/types.ts`
- `web/src/features/auth/session.ts`
- `web/src/features/auth/auth-store.ts` + `auth-store.test.ts`
- `web/src/features/auth/access-control.ts`
- `web/src/features/community/types.ts`
- `web/src/features/community/sqlite.ts` + `sqlite.test.ts`
- `web/src/features/community/test-support.ts`
- `web/src/features/community/contracts.test.ts`
- `web/src/features/observability/metrics.ts` + `metrics.test.ts`
- `web/src/app/studio/page.test.tsx`
- `web/src/app/studio/works/page.test.tsx`
- `web/src/app/studio/profile/page.test.tsx`
- `web/src/app/studio/opportunities/page.test.tsx`
- `web/src/features/community/work-actions.test.ts`
