# Code Review — T46

- Date: `2026-04-19`
- Task: T46
- Verdict: pass

## 范围

- `web/src/features/observability/trace.ts` (~25 LOC)
- `web/src/features/observability/logger.ts` (~225 LOC)
- `web/src/features/observability/init.ts` (~60 LOC)
- `web/src/features/observability/server-boundary.ts` (~95 LOC)
- `web/src/proxy.ts` (~50 LOC)
- `web/src/app/api/health/route.ts`（boundary 接入改造，行为不变）
- `web/src/app/api/health/route.test.ts`（pragma + 2 条新断言）

## Rubric 检查

| 维度 | 结果 |
| --- | --- |
| 模块边界与职责 | ✅ 每个模块的"做什么 / 不做什么"与设计 §9 模块表一致；trace 不直接 emit log；logger 不感知 reporter；reporter（占位）不持有 logger；boundary 不替业务做权限校验 |
| 可逆性 | ✅ 全部 primitives 封装在 `@/features/observability/*`，可整体替换为 OpenTelemetry 等实现 |
| YAGNI / 复杂度匹配 | ✅ 极简实现：trace.ts 25 LOC、logger.ts 225 LOC、boundary 95 LOC；无新 npm 依赖；全部使用 Node 22 内置 |
| 错误处理 | ✅ `applyTraceHeader` 提供 try/catch fallback；wrapper 失败路径**重新抛出**而非吞掉，保留业务行为 |
| 安全 (NFR-003) | ✅ logger 白名单严格（19 键），主动丢弃未授权字段；token / DSN 不进入 log；trace id 自身不带任何用户身份信息 |
| 性能 (NFR-001) | ✅ 全部内存操作 + `crypto.randomUUID()`；`als.run` 单次 ~1μs；no-op fast path 无额外分配。整体性能开销将在 increment 级 `hf-regression-gate` 验证 |
| 类型安全 | ✅ 全部公开 API 有 TypeScript 契约；`pickAllowed` 类型断言保留 unknown 字段类型；唯一 `as never` 出现在 wrapper 内部用于将 generic context 透传给原 handler，不暴露到调用方 |
| 命名 / 风格 | ✅ 与项目现有 `@/features/community/*` 风格一致；`createXxx` / `wrapXxx` 命名约定清晰 |
| Lint | ✅ `npm run lint` 0 errors（保留 1 条 baseline warning）|
| Typecheck | ✅ 仅保留 4 条 baseline `work-actions.test.ts` 错误（与 master 一致）|
| Build | ✅ `npm run build` 成功；`Proxy (Middleware)` 行确认 Next 16 识别 |

## 设计约束承接

- ADR-1 D-1：proxy 内不 als.run；wrapper 内 als.run；✅
- ADR-3：自实现 < 500 LOC 极简 logger / metrics / errorReporter（本任务仅 logger 部分）；✅
- ADR-5：boundary 改造为 export 现场最薄包装，业务零修改；✅（health 唯一一个被改造，行为完全不变）
- I-3 / I-4 / I-5（部分）：trace id 字符集 / log 体积 / token 不入日志；✅

## Findings

无 critical / important finding。

## 下一步

- `hf-traceability-review`
