# Implementation — T52 Cross-Cutting Skeleton

- Date: `2026-04-19`
- Branch: `cursor/phase2-discovery-intelligence-v1-3dd4`
- Spec: `docs/specs/2026-04-19-discovery-intelligence-v1-srs.md`
- Design: `docs/designs/2026-04-19-discovery-intelligence-v1-design.md`
- Tasks: `docs/tasks/2026-04-19-discovery-intelligence-v1-tasks.md` § T52
- Test design: `docs/verification/test-design-T52.md`

## 实现摘要

按 T52 acceptance 完成横切骨架：

1. `web/src/features/community/types.ts`：`DiscoveryEventType` 联合追加 `"related_card_view"`。
2. `web/src/features/discovery/view-beacon.tsx`：`eventType` 类型从 `Extract<...>` 放宽至完整 `DiscoveryEventType`（type-only，运行时无变化）。
3. `web/src/features/observability/metrics.ts`：
   - `MetricsSnapshot` 顶层加性扩展 optional 必填字段 `recommendations`，含 `related_creators` / `related_works` 两个子命名空间，每个子命名空间含 `cards_rendered` / `empty` 两个 counter。
   - 新增 `RECOMMENDATIONS_COUNTER_NAMES` 预注册常量；`createMetricsRegistry()` 启动时把 4 个 counter 初始化为 0。
   - `snapshot()` 增加 `recommendationsCounterValue(name)` helper 输出 `recommendations` 命名空间字段。
   - 既有 `http` / `sqlite` / `business` / `gauges` / `labels` 字段不变。
4. `web/src/config/env.ts`：新增 `RecommendationsConfig`、`RecommendationsConfigResult`、`readRecommendationsConfig()`、`getRecommendationsConfig()`；非法值降级 + warning slug `recommendations-related-enabled-invalid`；缺省默认 `relatedEnabled: true`。
5. `web/src/features/recommendations/`：新增 `types.ts` / `signals.ts` / `metrics.ts` / `config.ts` / `index.ts`：
   - `types.ts`：`CreatorSignals.targetKey` / `WorkSignals.targetKey` 必填；声明 `RankedCandidate` / `RelatedSectionResult` / 卡片类型。
   - `signals.ts`：硬编码 `RELATED_CREATORS_WEIGHTS = { city: 0.6, shootingFocus: 0.4 }` + `RELATED_WORKS_WEIGHTS = { sameOwner: 0.55, ownerCity: 0.3, category: 0.15 }` + `CARDS_LIMIT = 4`；权重和 = 1.0 ≤ 1.0 ✓，符合 SRS §8.3 不变量。
   - `metrics.ts`：4 个 counter key 常量 + 4 个 helper，杜绝散落字符串拼接（I-6）。
   - `config.ts`：转发 env 层的 recommendations 配置入口，让 feature 代码只 import 自 `@/features/recommendations/config`。

## fail-first 证据

测试先写后跑，先红再实现：

```
$ npx vitest run src/features/recommendations/ src/features/observability/metrics.test.ts src/config/env.test.ts
 Test Files  4 failed (4)
      Tests  5 failed | 19 passed (24)
```

实现完成后：

```
$ npx vitest run src/features/recommendations/ src/features/observability/metrics.test.ts src/config/env.test.ts
 Test Files  4 passed (4)
      Tests  34 passed (34)
```

## 全套验证

```
$ cd web && npm run typecheck
（baseline 4 errors in work-actions.test.ts；与 T51 末状态一致；本任务未引入新 typecheck 错误）

$ cd web && npm run lint
✖ 1 problem (0 errors, 1 warning) — baseline，与 T51 末状态一致

$ cd web && npm run build
✓ build success — /api/metrics、/api/discovery-events 等所有现有路由编译通过

$ cd web && npx vitest run（全套）
 Test Files  18 failed | 38 passed (56)
      Tests  1 failed | 159 passed (160)
（与 T51 baseline 18 failed | 36 passed 对比：新增 2 passed test files = signals.test.ts + config.test.ts；
  metrics.test.ts 与 env.test.ts 虽各新增了用例但仍计为既有 passed 文件；新增 16 个 tests 全绿。）
```

## Acceptance 校验

| Acceptance | 证据 |
|---|---|
| `recommendationsRelatedEnabled` 默认 `true` | `env.test.ts > readRecommendationsConfig defaults to relatedEnabled=true` ✅ |
| 非法值降级 + warning | `env.test.ts > falls back to true on invalid value with warning` ✅ |
| `DiscoveryEventType` 含 `"related_card_view"` | `community/types.ts` 联合定义 + `metrics.test.ts` 通过编译 ✅ |
| `MetricsSnapshot.recommendations` 4 字段零状态 | `metrics.test.ts > emits zeroed recommendations namespace at startup` ✅ |
| `incrementCounter("recommendations.*")` 写入对应字段 | `metrics.test.ts > incrementCounter under recommendations.* increments the matching snapshot field` ✅ |
| 不污染既有 http/sqlite/business 命名空间 | `metrics.test.ts > does not pollute existing http/sqlite/business namespaces` ✅ |
| `RELATED_*_WEIGHTS` 满足 SRS §8.3 + 权重和 ≤ 1 | `signals.test.ts` 4 条不变量断言 ✅ |
| `CARDS_LIMIT === 4` | `signals.test.ts > CARDS_LIMIT is 4` ✅ |
| `view-beacon.tsx` 类型放宽（type-only） | `view-beacon.tsx` 中 `eventType: DiscoveryEventType` ✅ |
| 模块骨架 (`recommendations/{types,signals,metrics,config,index}.ts`) | 全部新增并被 `index.ts` barrel export ✅ |

## 不变量

- I-2 权重不变量已被 `signals.test.ts` 覆盖。
- I-6 metrics 键名常量唯一定义已落到 `metrics.ts`（`RECOMMENDATIONS_COUNTER_NAMES`）。
- 其余不变量（I-1, I-3, I-4 等）由后续任务承接。

## 文件改动

新增：
- `web/src/features/recommendations/types.ts`
- `web/src/features/recommendations/signals.ts`
- `web/src/features/recommendations/signals.test.ts`
- `web/src/features/recommendations/metrics.ts`
- `web/src/features/recommendations/config.ts`
- `web/src/features/recommendations/config.test.ts`
- `web/src/features/recommendations/index.ts`

修改：
- `web/src/features/community/types.ts`
- `web/src/features/discovery/view-beacon.tsx`（type-only）
- `web/src/features/observability/metrics.ts`
- `web/src/features/observability/metrics.test.ts`
- `web/src/config/env.ts`
- `web/src/config/env.test.ts`
