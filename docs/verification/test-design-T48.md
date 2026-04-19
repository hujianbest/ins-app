# Test Design — T48 Metrics + `/api/metrics`

- Date: `2026-04-19`
- Task: T48
- Anchors: spec FR-005 / NFR-003 / CON-002、design §11.1 metrics + ADR-4、tasks §5 T48

## 测试用例

### MetricsRegistry primitive
- TC-T48-1：counter `incrementCounter('http.requests_total')` 多次后 snapshot 反映累加。
- TC-T48-2：counter 支持 labels（`{ status: '500' }`），不同 label 维度不串扰。
- TC-T48-3：gauge `setGauge` 后 snapshot 反映最新值（覆盖而非累加）。
- TC-T48-4：histogram `observeHistogram` 多次后 snapshot 含 `count / sum / p50 / p95`；未观察时 `count=0`。
- TC-T48-5：业务命名空间封装 `recordBusinessAction(name, ok)` → 累加 `business.<name>.success` 或 `business.<name>.failure`。
- TC-T48-6：SQLite 慢查询 `recordSqliteQuery(durationMs, slowThresholdMs)` → 当 `durationMs > slowThresholdMs` 累加 `sqlite.slow_queries`；`sqlite.queries_total` 总加；时延进入 histogram。
- TC-T48-7：snapshot 初始为「字段完整为 0」（counter=0、histogram={count:0}），无缺失字段。
- TC-T48-8：snapshot 不含敏感字段（断言不含 token / DSN / 邮箱样本字符串）。

### `/api/metrics` route handler
- TC-T48-9：`OBSERVABILITY_METRICS_ENABLED=false` → 404 + `{ error: 'not_found' }`。
- TC-T48-10：`OBSERVABILITY_METRICS_ENABLED=true` 缺 `Authorization` → 401。
- TC-T48-11：`OBSERVABILITY_METRICS_ENABLED=true` + 错 token → 401。
- TC-T48-12：`OBSERVABILITY_METRICS_ENABLED=true` + 正确 `Authorization: Bearer <token>` → 200 + JSON snapshot。
- TC-T48-13：响应不含任何 `Authorization` 头 / token 子串。

## fail-first

1. metrics.test.ts → 红 → metrics.ts → 绿
2. app/api/metrics/route.test.ts → 红 → route.ts → 绿
