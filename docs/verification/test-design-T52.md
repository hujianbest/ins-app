# Test Design — T52 Cross-Cutting Skeleton

- Date: `2026-04-19`
- Task: T52（types / env / metrics namespace / signals 不变量 / view-beacon type-only 放宽）
- Spec: `docs/specs/2026-04-19-discovery-intelligence-v1-srs.md`
- Design: `docs/designs/2026-04-19-discovery-intelligence-v1-design.md`
- Mode: `auto` / approved

## 测试单元

| 测试文件 | 覆盖目标 |
|---|---|
| `web/src/config/env.test.ts` | 新增 `recommendationsRelatedEnabled` 默认 `true` + 非法值降级 + warning |
| `web/src/features/observability/metrics.test.ts` | `MetricsSnapshot.recommendations` 4 字段在零状态全为 0；既有 http/sqlite/business/gauges/labels 字段不变；`recommendations.related_creators.cards_rendered` 命名空间增量正确写入 |
| `web/src/features/recommendations/signals.test.ts` | `RELATED_CREATORS_WEIGHTS.city >= shootingFocus`；`RELATED_WORKS_WEIGHTS.sameOwner > ownerCity >= category`；权重和 ≤ 1；`CARDS_LIMIT === 4` |
| `web/src/features/recommendations/config.test.ts` | `getRecommendationsConfig()` 默认 `relatedEnabled: true`；非法 env 值降级 + warning；env 关闭时 `relatedEnabled: false` |
| `web/src/features/recommendations/types.ts`（编译时） | `CreatorSignals.targetKey` / `WorkSignals.targetKey` 必填；`DiscoveryEventType` 联合包含 `"related_card_view"` |

## fail-first 主行为

1. **env：默认值** — `readRecommendationsConfig({})` 返回 `{ config: { relatedEnabled: true }, warnings: [] }`
2. **env：显式禁用** — `readRecommendationsConfig({ RECOMMENDATIONS_RELATED_ENABLED: "false" })` → `relatedEnabled: false`
3. **env：非法值降级** — `readRecommendationsConfig({ RECOMMENDATIONS_RELATED_ENABLED: "maybe" })` → `relatedEnabled: true` + warning slug `recommendations-related-enabled-invalid`
4. **MetricsSnapshot.recommendations 默认零** — `createMetricsRegistry().snapshot().recommendations` = `{ related_creators: { cards_rendered: 0, empty: 0 }, related_works: { cards_rendered: 0, empty: 0 } }`
5. **MetricsSnapshot.recommendations 增量** — 调用 `incrementCounter("recommendations.related_creators.cards_rendered", undefined, 3)` 后，snapshot 中 `recommendations.related_creators.cards_rendered === 3`
6. **既有 snapshot 字段未漂移** — 既有 http/sqlite/business 测试全部继续通过
7. **signals 不变量** — 见 §测试单元

## 关键边界

- `RECOMMENDATIONS_RELATED_ENABLED` 接受 `"true"` / `"false"` / 缺省 / 非法值 4 种输入
- `MetricsSnapshot.recommendations` 是 optional 字段；snapshot 输出时若无任何 recommendations 命名空间增量也应输出 0 而非 undefined（按设计 §11 / FR-006 验收 #1）
- `view-beacon.tsx` `eventType` 类型从 `Extract<...>` 放宽为 `DiscoveryEventType`，运行时无变化（仅类型放宽）

## 不会覆盖

- Related Creators / Related Works 的实际编排（属于 T54 / T55）
- 评分函数（属于 T53）
- view-beacon 测试（属于 T56）

## 退出标准

- 上述 5 个测试文件全绿
- `cd web && npm run typecheck && npm run lint && npm run build` 全绿
- vitest 子集（仅 T52 触碰文件）全绿；不重新引入既有 baseline 之外的失败

## 准备就绪

- ✅ 设计 / spec / 任务计划已批准
- ✅ baseline 已固定（18 failed pre-existing 文件不在 T52 触碰范围内）
