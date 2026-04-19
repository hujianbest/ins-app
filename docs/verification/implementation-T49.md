# Implementation T49 — Server Boundary Integration

- Date: `2026-04-19`
- Task: T49
- Branch: `cursor/phase2-observability-ops-051b`

## 实现内容

### `wrapServerAction` primitive
- 在 `web/src/features/observability/server-boundary.ts` 增加 `wrapServerAction(actionName, action)`：
  - 同模块内调用（'use server' 文件 export 现场），保留 `name` / `length` / `this`、保持 async（**不变量 I-7**）
  - 成功路径：emit `event=server-action.completed` info + business `<actionName>.success` counter +1
  - 失败路径：通过 `normalizeError` 走 logger + reporter + business `<actionName>.failure` counter +1，re-throw `AppError`
  - 框架控制流错误（`isNextControlFlowError`：`error.digest.startsWith('NEXT_')` — `redirect` / `notFound` / `unauthorized` 等）**不**进入 normalize 分支，直接 re-throw 并按 success 计数（这是 Next 文档化的成功语义，不是业务错误）
- `wrapRouteHandler` 同步增加 `isNextControlFlowError` 旁路，避免吞掉 framework redirect

### 接入清单（10 个 server action + 1 个 route handler）

| 文件 | 接入 export |
| --- | --- |
| `src/features/auth/actions.ts` | `loginAccountAction` / `registerAccountAction` / `logoutAction` |
| `src/features/community/profile-actions.ts` | `saveStudioProfileAction` |
| `src/features/community/work-actions.ts` | `saveStudioWorkAction` |
| `src/features/contact/actions.ts` | `startContactThreadAction` |
| `src/features/engagement/actions.ts` | `toggleWorkLikeAction` / `toggleProfileFavoriteAction` |
| `src/features/social/actions.ts` | `toggleProfileFollowAction` |
| `src/features/social/comment-actions.ts` | `addWorkCommentAction` |
| `src/app/api/discovery-events/route.ts` | `POST` (via `wrapRouteHandler`) |

接入模式（保持 I-7）：
```ts
async function fooImpl(...) { /* 原业务 */ }
export const foo = wrapServerAction("module/foo", fooImpl);
```

### 测试
- `server-boundary.test.ts` 增加 5 用例覆盖 `wrapServerAction`：success 返回值不变、trace id 注入、throw → AppError、AppError 透传保留 code/status、无 trace 上下文 → `traceId='unknown'`
- 既有 27 个 action / route handler 测试**全部通过**，业务行为零回归

## 测试结果

```
$ cd /workspace/web && npx vitest run src/features/auth/actions.test.ts src/features/community/work-actions.test.ts src/features/community/profile-actions.test.ts src/features/contact/actions.test.ts src/features/engagement/actions.test.ts src/features/social/actions.test.ts src/features/social/comment-actions.test.ts src/app/api/

 Test Files  9 passed (9)
      Tests  27 passed (27)
```

观测层：47 + 9 ＝ 全套 56 用例全绿。

## 设计 / 规格承接

- FR-009 全部 4 条验收（成功 / 失败 / route handler / 业务行为零回归）✅
- I-7（wrapper 在原 'use server' 模块 export 现场调用、async / length / name 保留）✅
- ADR-5（最薄包装；业务函数零修改：`fooImpl` 是原代码原样 + wrapper 同文件 named export）✅
- Next 16 框架控制流：`redirect()` / `notFound()` 等通过 `digest='NEXT_*'` 检测，不被 normalize 吞噬 ✅

## Verify

```
✅ npx vitest run（已接入文件 9 个）→ 27 passed
✅ npm run lint → 0 errors（baseline 1 warning）
✅ npm run typecheck → 仅 baseline 4 错（与 master 一致）
✅ npm run build → success；构建产物保留所有现有路由
```
