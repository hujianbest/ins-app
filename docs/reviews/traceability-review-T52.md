# Traceability Review — T52

- Task: T52
- Date: `2026-04-19`

## 锚点 ↔ 工件 ↔ 测试 ↔ 实现

| 上游条目 | 工件 | 测试 | 实现 |
|---|---|---|---|
| FR-004 (env flag) | `RECOMMENDATIONS_RELATED_ENABLED` 字段 | `env.test.ts > readRecommendationsConfig` 5 case | `config/env.ts > readRecommendationsConfig` |
| FR-005 (related_card_view 类型) | `DiscoveryEventType` 联合 | 通过 `metrics.test.ts` / `view-beacon.tsx` 编译断言 | `community/types.ts` 联合追加 |
| FR-006 (recommendations.* metrics) | `MetricsSnapshot.recommendations` 字段 | `metrics.test.ts > recommendations namespace` 3 case | `observability/metrics.ts` snapshot 扩展 |
| SRS §8.3 invariants | `RELATED_*_WEIGHTS` | `signals.test.ts` 4 不变量 | `recommendations/signals.ts` |
| 设计 ADR-3 | `MetricsSnapshot` 加性扩展 | `metrics.test.ts > does not pollute existing` | `observability/metrics.ts` snapshot |
| 设计 I-2 | 权重不变量 | `signals.test.ts` | `signals.ts` |
| 设计 I-6 | 键名常量唯一定义 | 间接覆盖（`recommendations/metrics.ts` 只导出常量） | `recommendations/metrics.ts` + `observability/metrics.ts` 预注册表 |
| 设计 §9.1 类型 | `CreatorSignals` / `WorkSignals` 等 | 编译时类型断言 | `recommendations/types.ts` |
| 设计 R-4 (T52 含 view-beacon type-only 放宽) | `view-beacon.tsx` `eventType: DiscoveryEventType` | 编译断言 | `discovery/view-beacon.tsx` |
| 设计 §17 出口工件 | 7 新增 + 6 修改 | 见上 | 见 implementation §文件改动 |

## 缺失

无。所有 T52 acceptance / 设计承接点均映射到测试 + 实现。

## 结论

通过。下一步 `hf-regression-gate（任务级 sanity）`。
