# Test Design — T47 Errors + ErrorReporter

- Date: `2026-04-19`
- Task: `T47` — `AppError` + `normalizeError` + `ErrorReporter` (noop / console / sentry-stub)
- Spec / Design / Tasks anchors: `docs/specs/2026-04-19-observability-ops-v1-srs.md` FR-003 / FR-004 / NFR-003、`docs/designs/2026-04-19-observability-ops-v1-design.md` §11.1 errors / error-reporter / I-2 / ADR-3、`docs/tasks/2026-04-19-observability-ops-v1-tasks.md` §5 T47

## 范围

- 仅覆盖 errors + reporter primitives；**不**接入 server boundary 的失败路径（那是 T49 的范围）。
- 不引入真实 Sentry SDK（NFR-002 / ASM-001）。

## 测试用例

### TC-T47-1（AppError 默认值）
- `new AppError()` → `code='internal_error'`、`status=500`、`message='Internal server error.'`、`name='AppError'`、`cause=undefined`、`traceId=undefined`。

### TC-T47-2（AppError 显式构造）
- `new AppError({ code: 'forbidden', status: 403, message: 'Not allowed' })` → 字段一致；`cause` 可包含原始 error。

### TC-T47-3（normalizeError - 原生 Error）
- 在 `runWithTrace('trace-x', () => normalizeError(new TypeError('oops'), { actionName: 'foo' }))`：
  - 返回的 `AppError`：`code='internal_error'`、`status=500`、`traceId='trace-x'`、`cause` 为原 `TypeError`。
  - in-memory logger 收到一条 `event=error.normalized` warn 级别记录，含 `traceId`、`actionName='foo'`、`code='internal_error'`、`errorClass='TypeError'`。
  - in-memory reporter 收到一次 `report` 调用，参数为该 `AppError`。

### TC-T47-4（normalizeError - 已是 AppError）
- 抛出 `new AppError({ code: 'forbidden', status: 403 })`：`normalizeError(err, { route: 'metrics' })` 返回原 instance（保留 code/status），但补 `traceId`；reporter 仍被调用一次。

### TC-T47-5（normalizeError - HTTP body 不含栈）
- 调用 `appErrorToHttpBody(appError)` 返回 `{ error: { code, message, traceId } }`，不含 `stack` / `cause` / 内部路径字段（I-2）。

### TC-T47-6（normalizeError - reporter 内部 throw 不冒泡）
- 注入一个 `report` 抛错的 reporter；`normalizeError(err, ctx)` 不抛出该 reporter 内部 error，并照常返回 `AppError`；logger 收到一条 `warn` 级别 `event=error.reporter.failed` 记录。

### TC-T47-7（noop reporter）
- `createNoopReporter().report(appError)` 不抛出、不调用任何外部资源；返回 undefined。

### TC-T47-8（console reporter）
- 注入 stub `stderr.write`；`createConsoleReporter().report(appError)` 调用 stub 一次，输出包含 `code` / `message` / `traceId` / `stack` 四个字段。

### TC-T47-9（sentry-stub reporter — DSN absent）
- `ERROR_REPORTER_PROVIDER=sentry`、`SENTRY_DSN` 未设置：`createReporter({ provider: 'sentry', dsn: undefined })` 返回降级 reporter；初始化时 logger 收到一条 warn `event=error-reporter.fallback` `code=missing-dsn`；后续 `report` 不发起任何外部请求。

### TC-T47-10（sentry-stub reporter — DSN set 但 SDK 未打包）
- `ERROR_REPORTER_PROVIDER=sentry`、`SENTRY_DSN='https://example/1'`：构造仍返回降级 reporter；logger warn `event=error-reporter.fallback` `code=sdk-not-bundled`；后续 `report` 不发起任何外部请求。

### TC-T47-11（resolveErrorReporterConfig）
- 给定 `{ provider: 'noop' }` → `createNoopReporter`
- 给定 `{ provider: 'console' }` → `createConsoleReporter`
- 给定 `{ provider: 'sentry', ... }` → 降级到 noop（V1 占位）
- 给定 `{ provider: 'unknown' as never }` → 降级到 noop 且 logger warn `code=unknown-provider`

## fail-first 顺序

1. errors.test.ts → 红 → errors.ts → 绿
2. error-reporter.test.ts → 红 → error-reporter.ts → 绿
3. 整合：normalizeError 测试中通过 init.ts 注入 in-memory reporter；扩展 init.ts 让其也持有 reporter 实例

## 可测试性 (NFR-005)

- 全部断言通过 `installInMemoryLogger` + `createInMemoryReporter`（新工厂）完成；`resetObservabilityForTesting()` 在 beforeEach 调用。

## 不在本任务范围

- Server boundary 失败路径接入既有 server actions（T49）
- HTTP route handler error wrapping（T49 中通过 `wrapRouteHandler` 自动获得，本任务只准备好 primitives）
- Metrics（T48）
