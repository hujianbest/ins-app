# Bug Patterns — T47

- Date: `2026-04-19`
- Task: T47
- Status: passed (no new bug patterns)

## 重点检查

- **Reporter 内部 throw 吞错**：`normalizeError` 在 `errorReporter.report` 调用外包 try/catch，捕获后 emit `event=error.reporter.failed` warn，**不**重新抛出 — 否则一个坏 reporter 就能让所有 server action 错误处理崩盘。`errors.test.ts` 用 `installInMemoryReporter({ onReport: throwing })` 显式覆盖。
- **Sentry SDK 未打包但 DSN 已配置**的对称降级路径：之前 spec review F-1 / design review F-?? 都显式要求；本任务在 `resolveErrorReporter` 中显式分别返回 `reason=missing-dsn` 与 `reason=sdk-not-bundled`，并各自由 `error-reporter.test.ts` 覆盖。
- **HTTP body 内部路径泄漏**：`appErrorToHttpBody` 仅 pick `code/message/traceId`，并由测试断言 serialized JSON 不含 `stack` / `cause` / 原始 message 子串。
- **AppError 上 `cause` 字段**：使用 `Object.assign-like` 写入避免 TS 严格模式下 readonly 报错；保持原始 cause 引用（方便 logger 序列化栈）。

## 结论

无 USER-INPUT 缺口；无 critical / important finding。
