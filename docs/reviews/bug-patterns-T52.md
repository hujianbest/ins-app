# Bug Patterns — T52 Cross-Cutting Skeleton

- Task: T52
- Date: `2026-04-19`
- Source: 设计 §11 不变量 I-2 / I-6；SRS §8.3 不变量；`metrics.ts` 现有命名空间扩展模式

## 已规避的潜在 bug 模式

1. **MetricsSnapshot schema 漂移**：通过显式预注册 `RECOMMENDATIONS_COUNTER_NAMES` + snapshot 时统一映射，避免某条 counter 拼写不一致或忘记初始化导致的"未启用就 undefined"问题。被 `metrics.test.ts > emits zeroed recommendations namespace at startup` 覆盖。
2. **权重表反向（"同方向 > 同城"）**：`signals.test.ts` 显式断言 SRS §8.3 不变量；任何对 `RELATED_*_WEIGHTS` 的反向调整都会让单测变红。
3. **env flag 解析过于宽松**：`readRecommendationsConfig` 仅接受小写 `"true"` / `"false"`（trim + lower 后），其他值（含空字符串）走降级 + warning，避免 `"yes"` / `"1"` 等模糊语义被静默接受。
4. **散落字符串拼接 metric key**：所有 4 个 counter key 集中在 `recommendations/metrics.ts` 与 `observability/metrics.ts` 的预注册表，杜绝散落字符串 — 满足设计 I-6。
5. **类型放宽未在 view-beacon 测试链中验证**：T52 只做 type-only 放宽；运行时 fail-first 测试在 T56 覆盖；本任务不引入 view-beacon test 改动以避免与未来 T56 实现冲突。

## 候选下游 bug 模式（待后续任务关注）

- T54 / T55 编排层未在 disabled 时跳过 metrics counter 调用 → 可能在 disabled 状态下仍递增 counter。预防：编排层"flag check 必须在 metrics 之前"。
- T54 / T55 SSR error 不被 try/catch 包住 → 推荐模块异常拖垮整页。预防：strict try/catch + 单测注入抛错的 fake bundle。
- T56 route handler 类型放宽时忘记同步更新现有 `route.test.ts` mock 的入参联合 → 编译漏。预防：T56 必须在 type union 完整覆盖下断言所有现有 + 新值。

## 处置

- 本任务无需新增 bug pattern 目录条目（无新 bugfix lesson）。
- 现有不变量已覆盖。
