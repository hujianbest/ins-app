# Traceability Review — T54

- Task: T54
- Date: `2026-04-19`

| 上游 | 工件 | 测试 |
|---|---|---|
| FR-001 #1 同角色 ≥2 → 至少 1 张，最多 4 张 | `getRelatedCreators` + `RelatedCreatorsSection` | `renders cards when there are matching same-role candidates` ✅ |
| FR-001 #2 排除自身 | `isSelf` 注入 + `seed.role/slug` 过滤 | `filters out the seed creator from candidates` ✅ |
| FR-001 #3 严格序（同城同向 > 其余三类） | `scoreCreator` 默认权重 + `RELATED_CREATORS_WEIGHTS` 不变量 | `uses card grid that hides cards in DOM order with stable scoring` ✅（端到端断言） |
| FR-001 #5 仅自身一名 → 稳定空态 | `kind=empty/no-candidates` 分支 | `returns empty (no-candidates)` + section `renders the empty-state copy` ✅ |
| FR-001 #6 卡片字段（avatar/name/city/focus/link） | `RelatedCreatorsSection` + `EditorialCard` | `renders cards + heading when candidates exist` (含 `/photographers/alpha` link) ✅ |
| FR-004 (creators 半部分) flag disabled → DOM 无 section + 不打事件 + 不计 metrics | `null` short-circuit + I-11 | `returns null when the feature flag is disabled` + section `renders no DOM` ✅ |
| FR-006 (creators 半部分) cards_rendered / empty counter | metrics helpers | counter 断言在 4 个 case 中覆盖 ✅ |
| FR-008 #3 单次 repository 读 | spy 验证 | `reads the candidate pool only once per call (FR-008 #3)` ✅ |
| FR-008 #4 SSR 安全降级 | try/catch + `kind=empty/soft-fail` | `soft-fails when the repository throws` ✅ |
| 设计 ADR-1 单次内存排序 | `rankCandidates` + 内存 mapping | 见 implementation §不变量 |
| 设计 ADR-3 metrics 加性扩展 | T52 已落地；T54 通过 helper 增量 | `metrics.test.ts` + 本任务 counter 断言 |
| 设计 ADR-4 flag 单点闭合 | I-3 / I-11 | section `node === null` 断言 ✅ |
| 设计 I-5 单次 IO | spy | ✅ |
| 设计 I-8 catch → warn + counter | warn log + counter empty 断言 | ✅ |
| 设计 I-10 section 不透传 bundle 到 client | section 是 server component；deps server-only | code review 检查 ✅ |
| 设计 I-11 disabled DOM 无 beacon | section `if (!result) return null` | `renders no DOM` ✅ |
| 设计 I-12 updatedAt 回退 | `profileToSignals` | `uses publishedAt as updatedAt fallback for stable tie-breaker (I-12)` ✅ |
| 设计 §17 出口工件 | 见 implementation §文件改动 | ✅ |

## 结论

通过。
