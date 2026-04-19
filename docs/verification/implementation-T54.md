# Implementation — T54 Related Creators 端到端

- Date: `2026-04-19`

## 实现摘要

新增：
- `web/src/features/recommendations/test-support.ts` — `createCapturingLogger` / `createRecommendationsTestDeps` / `fakeCreatorProfile` / `fakeWork`，所有 deps 入参注入，复用既有 `createInMemoryCommunityRepositoryBundle`。
- `web/src/features/recommendations/related-creators.ts` — `getRelatedCreators(seed, deps?)`：flag check → 单次 `listPublicProfiles` → 同角色 + 自身过滤 + I-12 publishedAt 回退 → `rankCandidates` → counter / logger 写入 → 返回 `null | rendered | empty`。SSR 安全降级：try/catch 包住 IO 与排序；catch 分支记 warn + counter empty 递增。
- `web/src/features/recommendations/related-creators-section.tsx` — async server component；`if (!result) return null`（I-3 / I-11 → DOM 无 panel、无 beacon）；`kind=empty` 渲染稳定空态文案；`kind=rendered` 渲染 panel + N 张 EditorialCard + N 个 DiscoveryViewBeacon (`eventType=related_card_view` / `surface=related_creators_section`).
- `web/src/features/recommendations/related-creators.test.ts` — 9 个用例覆盖所有主路径。
- `web/src/features/recommendations/related-creators-section.test.tsx` — 4 个用例覆盖 SSR 渲染矩阵。

修改：
- `web/src/features/showcase/profile-showcase-page.tsx` — 在主结构最末挂 `<RelatedCreatorsSection seed={{ role, slug }} />`（profile 详情结构未变）。
- `web/src/features/recommendations/index.ts` — barrel export 持续维护。

## fail-first 证据

```
$ npx vitest run src/features/recommendations/related-creators.test.ts
（红：getRelatedCreators 不存在）

$ # 实现后
$ npx vitest run src/features/recommendations/
 Test Files  5 passed (5)  — signals + config + scoring + related-creators + related-creators-section
      Tests  42 passed (42)
```

## 全套验证

```
$ npm run typecheck      — baseline 4 errors（与 T53 末状态一致；T54 不引入新错）
$ npm run lint           — 0 errors（baseline 1 warning）
$ npm run build          — success（含 /photographers/[slug] / /models/[slug] 路由）
$ npx vitest run（全套） — 18 failed | 41 passed (59 files) | 191 tests passed
                              vs T53 baseline 18 failed | 38 passed (56) | 159 tests
                              新增 3 passed test files = scoring.test + related-creators.test + related-creators-section.test
                              新增 32 passed tests；既有失败集合不变
```

## Acceptance 校验

| Acceptance | 证据 |
|---|---|
| flag disabled → null + 不读 repo + 不计 counter | `related-creators.test > returns null when the feature flag is disabled` ✅ |
| ≥2 同角色 → 渲染 ∈ [1,4] | `renders cards when there are matching same-role candidates` ✅ |
| 自身过滤 | `filters out the seed creator from candidates` ✅ |
| 仅同角色 | `only considers candidates with the same role as the seed` ✅ |
| 仅自身 → empty/no-candidates + counter empty | `returns empty (no-candidates) when only the seed is in the system` ✅ |
| FR-008 #3 单次读 | `reads the candidate pool only once per call (FR-008 #3)` ✅ |
| repository 异常 → soft-fail + warn log + counter empty | `soft-fails when the repository throws` ✅ |
| I-12 publishedAt 回退 | `uses publishedAt as updatedAt fallback for stable tie-breaker (I-12)` ✅ |
| 上限 4 | `limits to at most 4 cards` ✅ |
| disabled DOM 无 panel + 无 beacon (I-11) | `renders no DOM (no panel, no beacon) when flag is disabled` ✅ |
| 空态稳定文案 | `renders the empty-state copy when no candidates exist` ✅ |
| 渲染时 h2 + h3 + 正确跳转 | `renders cards + heading when candidates exist` ✅ |
| 评分严格序产生稳定卡片顺序 | `uses card grid that hides cards in DOM order with stable scoring` ✅ |
| ProfileShowcasePage 接入 | 见 `profile-showcase-page.tsx` 末段挂入；`build` 全绿 |

## 不变量

- I-3：✅ 编排层 disabled → return null；section `if (!result) return null`。
- I-5：✅ 单次 `listPublicProfiles` repository 读取（spy 断言）。
- I-8：✅ catch 分支同时 warn log + counter empty 递增。
- I-10：✅ section 不接受 server-side `bundle` 参数透传到客户端；deps 入参仅用于 server side（async server component）。
- I-11：✅ disabled 时 section 返回 null，DOM 无 panel + 无 beacon（测试断言 `node === null`）。
- I-12：✅ `profileToSignals` 统一 `record.updatedAt ?? record.publishedAt ?? ""`。

## NFR

- NFR-001：未在本任务做 micro-bench；候选池规模 ≤ 100 时单次 repository 读 + O(N log N) 内存排序 + N 次 mapping，预算充裕。Increment 级 regression-gate 阶段会做整页 P95 验证。
- NFR-003：`recommendations.section.rendered` / `recommendations.section.failed` event 已落地。
- NFR-005：deps 全部可注入。
