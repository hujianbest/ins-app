# Bug Patterns — T48

- Date: `2026-04-19`
- Status: passed (no new patterns)

## 重点检查
- **disabled 路径误返 401**：`route.ts` 在 `enabled === false` 时第一时间返回 404，**不**进入 token 检查。测试显式覆盖 `OBSERVABILITY_METRICS_ENABLED=false` + 设置正确 token 的场景，确保仍 404。
- **token 子串泄漏**：`metrics.ts` snapshot 不含任何 token / Authorization 字段；`route.test.ts` 显式 `expect(text).not.toContain(...)`。
- **histogram 空 snapshot 字段缺失**：`createMetricsRegistry()` 在构造时即 `histograms.set(name, emptyHistogram())`；snapshot 时 `summarizeHistogram([])` 返回 `{ count: 0, sum: 0, ... }`，不返回 `null`。
- **labels 串扰**：counter 内部使用 `key=val,key=val` 排序后稳定 string key 区分不同 label 维度；测试覆盖。

## 结论
无 finding。
