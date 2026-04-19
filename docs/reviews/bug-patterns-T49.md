# Bug Patterns — T49

- Date: `2026-04-19`
- Status: passed; one critical risk averted

## 关键风险

### 1. Next.js 框架控制流（redirect / notFound）被 wrapper 吞掉
- **风险**：原始实现在 wrapper 的 catch 块统一调用 `normalizeError(error)`，但 Next.js `redirect()` / `notFound()` 抛出的特殊 error（带 `digest='NEXT_REDIRECT;...'`）是框架文档化的成功语义；如果被归一化为 `AppError` 后 re-throw，会破坏所有依赖 `redirect()` 的 server action（约 7 个）。
- **缓解**：`isNextControlFlowError(error)` 检测 `error.digest && digest.startsWith('NEXT_')`，命中即按 success 路径计数 + 直接 re-throw（不调 reporter、不归一化）。同时为 `wrapRouteHandler` 加同样旁路。
- **测试覆盖**：所有现有 actions.test.ts 覆盖 redirect 路径都通过；vitest 跑过的 27 个 action / route handler 用例零回归。

### 2. Server Action ID 漂移（I-7）
- **风险**：Next 16 服务端从 export 名导出稳定 server action ID。如果通过 `re-export from another file` 包装会让 ID 漂移。
- **缓解**：所有 wrapper 在原 'use server' 模块内部调用、保持 named export 名不变；`wrapServerAction` 内通过 `Object.defineProperty` 显式恢复 `name` / `length`。

### 3. `this` 透传
- **风险**：箭头函数会丢 `this`。
- **缓解**：wrapper 用 `function (this: unknown, ...args)` + `action.apply(this, args)` 透传调用 context。

### 4. business metric 命名空间冲突
- **风险**：actionName 含 `/` 等字符，可能让 metric key 不稳定。
- **缓解**：`metricKey()` 把非 `[A-Za-z0-9_]` 字符替换为 `_`，并去首尾 `_`、转小写。每个 action 拿到稳定 metric key（如 `community/saveStudioWorkAction` → `community_savestudioworkaction`）。

## 结论
无 USER-INPUT 缺口；critical 风险已识别并消除。
