# Test Design — T49 Boundary Integration

- Date: `2026-04-19`
- Task: T49

## 测试用例（new）

### `wrapServerAction` primitive
- TC-T49-1：成功路径 → emit `event=server-action.completed` info；business counter `<actionName>.success` +1；返回值与原 action 完全一致；保留 `name / length` / `this`（I-7）。
- TC-T49-2：失败路径 → 通过 normalizeError 流（reporter 调用、warn log、business `<actionName>.failure` +1）；wrapper **重新抛出** AppError，业务调用方契约不变。
- TC-T49-3：trace id 注入：在 `runWithTrace` 外调用 wrapped action，logger 记录的 `traceId='unknown'`；在 `runWithTrace('x')` 内调用，记录 `traceId='x'`。
- TC-T49-4：保留 `length`（参数个数）与 `name` 元数据，wrapped 函数仍是 async（FR-009 / I-7）。

### 接入既有 actions / route handlers
- TC-T49-5（最小代表性集成）：复跑既有 `work-actions.test.ts`（`saveStudioWorkAction`）等代表性测试，行为零变化。
- 设计上无新增功能用例，由 baseline + 新 wrap 测试覆盖。

## 接入清单（业务行为零变化）

- `src/features/auth/actions.ts`: `loginAccountAction` / `registerAccountAction` / `logoutAction`
- `src/features/community/profile-actions.ts`: `saveStudioProfileAction`
- `src/features/community/work-actions.ts`: `saveStudioWorkAction`
- `src/features/contact/actions.ts`: `startContactThreadAction`
- `src/features/engagement/actions.ts`: `toggleWorkLikeAction` / `toggleProfileFavoriteAction`
- `src/features/social/actions.ts`: `toggleProfileFollowAction`
- `src/features/social/comment-actions.ts`: `addWorkCommentAction`
- `src/app/api/discovery-events/route.ts`: `POST` handler（route handler，wrapRouteHandler）

共 10 个 server action + 1 个 route handler。

## fail-first 顺序

1. `server-boundary.test.ts` 增加 `wrapServerAction` 用例 → 红 → 实现 → 绿
2. 遍历清单，逐文件 wrap → 跑该文件 vitest 确认行为不变；若回归立即修
3. 全套 vitest 跑一次

## 不在范围
- env 字段 / `/api/health.observability/backup` 字段（T50）
- backup CLI（T51）
