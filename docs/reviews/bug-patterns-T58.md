# Bug Patterns — T58

- Task: T58
- Date: `2026-04-19`

## 已规避的潜在 bug 模式

1. **Vite test bundling 限制 vs 业务代码归属**：admin policy 实现首版放在 `auth/access-control.ts` re-export，导致 `admin-policy.test.ts` 间接 import `auth-store.ts`，触发 vite/sqlite 限制。修订：把实现下沉到 `features/admin/admin-policy.ts`，`auth/access-control.ts` 反向 import 并 re-export。这是项目当前 baseline 的现实约束（多 page 集成测试都受影响），admin 模块测试侧应主动规避。
2. **adminEmails 为空 ⇒ 任意账号都能进 admin 后台**：fail-closed 由 admin-policy `if (adminEmails.has(...))` 强制；测试 `empty allowlist makes everyone non-admin (I-2)` 显式锁定。
3. **actorEmail 泄漏到结构化日志**：`runAdminAction` log ctx 仅含 `module / actionName / durationMs`；测试 `JSON.stringify(ctx).not.toContain("admin@example.com")` 显式断言。
4. **admin 校验失败时 fn 仍被调用**：测试 `rejects guest sessions` 通过 `fn: async () => "should not be called"` + `expect(...).toBeUndefined()` 锁定 fn 不被调用 + 无 completed log。
5. **withTransaction 的 fn 是 sync 还是 async 时签名不一致**：runtime.ts 使用 `Promise.resolve(opts.fn(ctx))` 包装确保兼容 sync fn 返回；测试 fn 主要是 async 但接受 sync。

## 候选下游 bug 模式

- T59 / T60 实现的 server action 调用 `runAdminAction` 时如果在 fn 内部 throw 非 AppError，外层 wrapServerAction 会归一化到 `internal_error`；但 admin 期望明确错误码（如 `work_not_found` / `invalid_curation_input`），所以 fn 内部应主动抛 AppError 而非 plain Error。
- T59 / T60 增量 metrics counter 在 tx commit 之后调用？还是在 tx 内？runAdminAction 的 logger 在 tx 之后；counter 由调用者在 fn 内部 incr，意味着 rollback 时 counter 仍递增。**在 §T59 / §T60 实现侧：counter 应在 fn 末尾递增**，让 tx 异常自动跳过。

## 处置

- 无新 bug pattern 目录条目。
