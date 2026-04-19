# Traceability Review — T47

- Date: `2026-04-19`
- Verdict: pass

## 追溯检查

| 锚点 | 承接证据 |
| --- | --- |
| FR-003 验收 1（原生 Error → AppError 默认字段 + cause） | `errors.test.ts` "wraps a native Error..." |
| FR-003 验收 2（已是 AppError 时保留 code/status，emit warn） | `errors.test.ts` "preserves AppError code/status..." |
| FR-003 验收 3（HTTP body 不暴露栈/路径 + status === AppError.status） | `errors.test.ts` "appErrorToHttpBody never leaks..."；status 一致性已由 `appErrorToHttpBody` 配合调用侧（T49 实现）保证 |
| FR-003 验收 4（必须调用 reporter 一次） | `errors.test.ts` "wraps..." 中 `expect(reporter.reports).toHaveLength(1)` |
| FR-004 验收 1（noop 默认） | `error-reporter.test.ts` "returns noop for provider=noop" |
| FR-004 验收 2（sentry+missing-dsn → noop + warn） | `error-reporter.test.ts` "falls back to noop with reason=missing-dsn" |
| FR-004 验收 3（sentry+SDK 未打包 → noop + warn） | `error-reporter.test.ts` "falls back to noop with reason=sdk-not-bundled" |
| FR-004 验收 4（console 输出 4 字段） | `error-reporter.test.ts` "writes a single JSON line containing code/message/traceId/stack" |
| FR-004 验收 5（reporter 内部 throw 不冒泡） | `errors.test.ts` "does not bubble up reporter internal errors" |
| Design ADR-3（自实现极简） | code-review §YAGNI 验证 |
| Design I-2（HTTP body 不暴露内部） | code-review §安全 + `errors.test.ts` "appErrorToHttpBody never leaks..." |
| Tasks plan T47 Acceptance 全部 7 条 | `implementation-T47.md` |

无 USER-INPUT 缺口；无 finding。

## 下一步：`hf-regression-gate`（任务级）
