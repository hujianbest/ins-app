# Implementation T48 — Metrics + `/api/metrics`

- Date: `2026-04-19`
- Task: T48
- Branch: `cursor/phase2-observability-ops-051b`

## 实现内容

### 新增模块（`web/src/features/observability/`）
- `metrics.ts`：`createMetricsRegistry()`（counter / gauge / histogram in-memory）；预置 5 个 counter（`http.requests_total / http.errors_total / sqlite.queries_total / sqlite.errors_total / sqlite.slow_queries`）+ 2 个 histogram（`http.request_duration_ms / sqlite.query_duration_ms`）+ business 命名空间 → snapshot 形态对齐设计 §11.1 `MetricsSnapshot`；helper `recordBusinessAction(action, success|failure)` 与 `recordSqliteQuery(durationMs, threshold)`。

### 修改模块
- `init.ts`：`ObservabilityRuntime` 增加 `metrics` 字段；新增 `installFreshMetricsRegistry()`（测试隔离）。

### 新增路由
- `web/src/app/api/metrics/route.ts`：`GET` 接 `wrapRouteHandler('metrics', ...)`：disabled→`Response.json({ error: 'not_found' }, { status: 404 })`；缺/错 token→401；ok→200 + JSON snapshot。

### 测试
- `metrics.test.ts`：9 用例（counter 累加、labels 不串扰、gauge 覆盖、histogram count/sum/p50/p95、business 命名空间、sqlite 慢查询、初始零值完整 schema、不含敏感字段）。
- `app/api/metrics/route.test.ts`：7 用例（disabled / missing env → 404、缺/错 token → 401、ok → 200 + schema、business 累加反映、响应体不含 token / Authorization 子串）。

## 测试结果

```
$ cd /workspace/web && npx vitest run src/app/api/metrics/ src/features/observability/

 Test Files  7 passed (7)
      Tests  49 passed (49)
```

## 设计 / 规格承接

- FR-005 全部 6 条验收 ✅
- CON-002（disabled→404，不返回 401）✅
- I-1（disabled 绝不返回 401/200，只能 404）✅，由 route 测试断言
- I-5（token 不出现在响应/日志）✅，由 "never echoes Authorization or token" 断言
- ADR-3（自实现 in-memory metrics，无新依赖）✅
- ADR-4（route handler 内部判断 disabled→404，不通过条件 export）✅
- NFR-005（`installFreshMetricsRegistry` + `installInMemoryReporter` + `installInMemoryLogger` 全部支持注入）✅

## Verify

```
✅ npx vitest run src/app/api/metrics/ src/features/observability/  → 49 passed
✅ npm run lint   → 0 errors
✅ npm run typecheck → 仅 baseline 4 错
✅ npm run build → success；构建输出含 `/api/metrics` 路由
```
