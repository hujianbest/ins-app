# Bug Patterns — T57

- Task: T57
- Date: `2026-04-19`

## 已规避的潜在 bug 模式

1. **类型扩展 cascade typecheck breakage**：`AuthenticatedSessionContext.email` + `AccessControl.adminCapability/adminGuard` 是加性扩展，但严格模式下所有解构都需补字段。本任务在 5 个 page test + work-actions.test.ts 显式补齐，且与 baseline pre-existing 4 个 typecheck 错误（`canManageStudio` / `reason`）一致，未引入新错。
2. **env 名单解析过于宽松**：`isShallowValidEmail` 拒绝 `not-an-email` / `@bad` / `a@` / 多 `@`，避免在生产中混入畸形 piece 后默默通过；`admin-account-email-invalid` warning 单独标识。
3. **`audit_log.id` 来自外部 form 输入造成审计被伪造**：sqlite repository 默认 `randomUUID()`；类型签名虽允许 `id` 注入（仅测试用途），admin server action 不会透传外部 input id（T59/T60 实现侧 enforce）。
4. **`withTransaction` 异常 swallow rollback failure**：try/catch ROLLBACK 内部 catch 吞错，避免 rollback 二次失败掩盖原始业务错误的栈。
5. **in-memory bundle.audit 与 sqlite 行为漂移**：本任务的 in-memory `audit.record/listLatest` 严格按 `created_at desc, id desc` 排序（与 sqlite 的 `ORDER BY` 保持一致），避免 T59/T60 单测断言在 sqlite/memory 之间漂移。
6. **`MetricsSnapshot.admin` namespace 漂移**：与 `recommendations` namespace 严格同形（顶层 optional 字段 + 6 项预注册 counter + snapshot 时按命名空间路由），避免下游 metrics 消费者出现 "字段时有时无" 的不可预测行为。

## 候选下游 bug 模式

- T58 `runAdminAction` 在 in-memory bundle 没有 `withTransaction` 字段时必须 fallback；如果用 `bundle.withTransaction(fn)` 直接调用而不做 optional chaining，in-memory 测试会 TypeError。预防：T58 实现使用 `bundle.withTransaction?.(fn) ?? fn()` 模式 + 单测覆盖。
- T62 owner-side `resolveNextVisibility` throw 后，既有 `work-editor.test.ts` 中的 happy path（published → save_draft → 不变）必须仍绿；prevent regression：先跑既有测试拿 baseline，再补 moderated 三 intent throw 用例。

## 处置

- 无新 bug pattern 目录条目。
