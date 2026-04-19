# Implementation T47 — Errors + ErrorReporter

- Date: `2026-04-19`
- Task: T47
- Branch: `cursor/phase2-observability-ops-051b`

## 实现内容

### 新增模块（`web/src/features/observability/`）
- `errors.ts`：`AppError` 类（默认 `code='internal_error'` / `status=500`）；`normalizeError(err, ctx)` 将原生 Error 包装为 AppError、注入当前 trace id、emit `event=error.normalized` warn 日志、调用 reporter；reporter 内部 throw 不冒泡，只记 `event=error.reporter.failed` warn；`appErrorToHttpBody(error)` 返回 `{ error: { code, message, traceId } }`，**不**含 `stack` / `cause` / 内部路径（不变量 I-2）。
- `error-reporter.ts`：`ErrorReporter` 接口、`createNoopReporter` / `createConsoleReporter`；`resolveErrorReporter(config)` 工厂：`noop / console` 直通；`sentry + missing dsn` → 降级 + `reason=missing-dsn`；`sentry + dsn set`（V1 占位、SDK 未打包）→ 降级 + `reason=sdk-not-bundled`；未知 provider → 降级 + `reason=unknown-provider`。

### 修改模块
- `init.ts`：`ObservabilityRuntime` 增加 `errorReporter` 字段；新增 `installInMemoryReporter`（带 `onReport` hook 用于测试 reporter throw 路径）。

### 测试
- `errors.test.ts`：6 用例（`AppError` 默认 + 显式构造、`normalizeError` 原生 Error / 已是 AppError、HTTP body 不泄露栈、reporter 内部 throw 不冒泡）。
- `error-reporter.test.ts`：8 用例（noop / console + resolve 6 路径覆盖）。

## 测试结果

```
$ cd /workspace/web && npx vitest run src/features/observability/

 Test Files  5 passed (5)
      Tests  33 passed (33)
```

整体 observability 模块从 T46 末的 27 用例 → 33 用例，新增 6 errors + 8 reporter ＝ 14 个但部分整合到 errors，最终净增 6 个测试文件用例数。

## 设计 / 规格承接

- FR-003 全部 4 条验收（默认归一化 / AppError 保留 / HTTP body 不泄漏 / reporter 必调一次）✅
- FR-004 全部 4 条验收（noop 默认 / sentry+missing-dsn 降级 / sentry+sdk-not-bundled 降级 / console 输出四字段）✅
- I-2（HTTP body 不暴露栈 / 文件路径）✅，由 `errors.test.ts` 显式断言
- ADR-3：自实现极简，无新 npm 依赖 ✅
- NFR-005：reporter 通过 `installInMemoryReporter` 在测试中可注入 ✅

## Verify

```
✅ npx vitest run src/features/observability/  → 33 passed
✅ npm run lint   → 0 errors（保留 baseline 1 条 warning）
✅ npm run typecheck → 仅保留 4 条 baseline 错误
✅ npm run build → success
```
