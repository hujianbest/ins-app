# Code Review — T52

- Task: T52
- Date: `2026-04-19`

## 评审范围

新增：
- `web/src/features/recommendations/{types,signals,metrics,config,index}.ts`
- `web/src/features/recommendations/{signals,config}.test.ts`

修改：
- `web/src/features/community/types.ts`（DiscoveryEventType 扩展）
- `web/src/features/discovery/view-beacon.tsx`（type-only）
- `web/src/features/observability/metrics.ts`（snapshot 加性扩展）
- `web/src/features/observability/metrics.test.ts`（新增 recommendations 命名空间断言）
- `web/src/config/env.ts`（新增 recommendations 解析）
- `web/src/config/env.test.ts`（新增 recommendations 用例）

## 检查点

| 维度 | 评估 |
|---|---|
| 命名 / 文件结构 | ✅ 与 design §17 一一对应；与既有 `features/observability/*` 风格一致 |
| 纯加性变更 (ADR-3) | ✅ `MetricsSnapshot` 仅新增 `recommendations` 字段；既有字段未删 / 未改 |
| 单一职责 | ✅ scoring / 编排 / metrics / config / types 各一个文件；无 god object |
| 错误边界 | ✅ env 解析非法值降级 + warning，不抛错；唯一 hard-stop 仍是 `OBSERVABILITY_METRICS_ENABLED=true` 缺 token（既有约束未变） |
| 可测试性 | ✅ 全部公共 API 接受 env 入参注入或 registry 入参 |
| 注释质量 | ✅ 仅在权重不变量、metrics 命名空间扩展、targetKey 语义这几处加了"为什么"注释；无冗余 narration |
| 与 SRS / Design 锚点 | ✅ ADR-3 / I-2 / I-6 / FR-004 / FR-006 在代码注释或测试中可回读 |
| 性能 | ✅ snapshot 增加 4 次 `Map.get` 调用，量级不变；不影响 §3.8 V1 NFR-001 |
| 兼容性 | ✅ `view-beacon.tsx` 仅 type 放宽，运行时无变化；既有 `eventType="work_view"` / `"profile_view"` 调用点编译通过 |
| 安全 | ✅ 不引入新 PII / 新 API / 新外部依赖 |

## 发现项

无 important / blocking。

Minor（不阻塞，留待后续任务自然吸收）：
- `index.ts` barrel 现在只导出常量与类型；下一任务（T53）会补 `scoring` / `rankCandidates`。
- `metrics.ts` 中 `recommendationsCounterValue` 与 `counterValue` 形态相似；如未来需要更多命名空间扩展，可统一为通用 helper。当前 2 个调用点不触发 DRY 红线。

## 结论

通过。下一步 `hf-traceability-review`。
