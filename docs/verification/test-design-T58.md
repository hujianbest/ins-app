# Test Design — T58 Admin Policy + runAdminAction

- Date: `2026-04-19`

## 测试单元

- `web/src/features/admin/admin-policy.test.ts`（新增）：覆盖纯函数 policy / guard 三态。
- `web/src/features/admin/runtime.test.ts`（新增）：覆盖 `runAdminAction` 主路径 + tx 注入 + 失败/成功 log + actorEmail 不进 log。
- `web/src/features/admin/test-support.ts`（新增）：fakeAdminSession / fakeNonAdminSession / fakeGuestSession + createAdminTestDeps。
- `web/src/features/auth/access-control.test.ts`：保留既有 4 case；admin policy / guard 由 admin-policy.test 覆盖（access-control.test 受 vite/sqlite bundling 限制无法跑）。

## fail-first 主行为

1. policy：guest → isAdmin=false；非 admin → isAdmin=false；email 在名单（大小写）→ isAdmin=true；空名单 → isAdmin=false。
2. guard：guest → /login + unauthenticated；非 admin → /studio + not_admin；admin → allowed。
3. `runAdminAction` 拒绝 guest / 非 admin 抛 `forbidden_admin_only` (403)，不调用 fn，不写 metrics。
4. 成功 → fn 调用，写 `event=admin.action.completed` info log + 不含 actorEmail。
5. fn 抛 → 写 `event=admin.action.failed` warn log + 抛错。
6. bundle 无 `withTransaction` → fallback 直接执行 fn。
7. bundle 有 `withTransaction` → 成功 commit；fn throw → rollback。

## 退出标准

- 上述 vitest 子集全绿
- typecheck/lint/build baseline 不漂移
