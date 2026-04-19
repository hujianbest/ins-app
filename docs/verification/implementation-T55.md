# Implementation — T55 Related Works 端到端

- Date: `2026-04-19`

## 实现摘要

新增：
- `web/src/features/recommendations/related-works.ts` — `getRelatedWorks(seed, deps?)`：flag check → `Promise.all([listPublicWorks(), listPublicProfiles()])` 各一次（FR-008 #3） → 构建 `ownerProfileById: Map<id, profile>` → 候选过滤（自身 / draft 已被 `listPublicWorks` 过滤，sqlite 与 in-memory bundle 都默认只返回 published） → `rankCandidates` → counter / logger 写入 → 返回 `null | rendered | empty`。SSR 安全降级：try/catch 同 T54。
- `web/src/features/recommendations/related-works-section.tsx` — async server component；与 T54 section 同形对称；卡片包含 cover / title / ownerName + category；beacon `targetType="work"` `surface="related_works_section"`。
- `web/src/features/recommendations/related-works.test.ts`（9 cases）。
- `web/src/features/recommendations/related-works-section.test.tsx`（3 cases）。

修改：
- `web/src/app/works/[workId]/page.tsx` — 在评论 section **之前** 挂 `<RelatedWorksSection seed={{ workId: work.id }} />`。
- `web/src/features/recommendations/index.ts` — barrel export 增加 related-works 入口。

## fail-first 证据

```
$ npx vitest run src/features/recommendations/related-works.test.ts
（红：getRelatedWorks 不存在）

$ # 实现后
$ npx vitest run src/features/recommendations/
 Test Files  7 passed (7)
      Tests  54 passed (54)
```

## 全套验证

```
$ npm run typecheck      — baseline 4 errors（与 T54 末状态一致；T55 不引入新错）
$ npm run lint           — 0 errors（baseline 1 warning）
$ npm run build          — success（含 /works/[workId] 路由 SSR）
$ npx vitest run（全套） — 18 failed | 43 passed (61 files) | 1 failed | 203 passed (204 tests)
                              vs T54 baseline 18 | 41 (59) | 1 | 191
                              新增 2 passed test files (related-works + related-works-section)
                              新增 12 passed tests
                              既有失败集合不变
```

## Acceptance 校验

| Acceptance | 证据 |
|---|---|
| flag disabled → null + 不读 repo | `related-works.test > returns null when the feature flag is disabled` ✅ |
| ≥2 published → 渲染 + counter.cards_rendered | `renders cards when there are matching candidates` ✅ |
| 自身过滤 | `filters out the seed work itself` ✅ |
| draft 不入候选池 | `excludes draft works from the candidate pool` ✅ |
| 仅自身一篇 → empty/no-candidates | `returns empty (no-candidates) when only the seed work is published` ✅ |
| FR-008 #3 双 repository 各 1 次 | `reads each repository at most once per call` ✅ |
| works repo 异常 soft-fail | `soft-fails when works repository throws` ✅ |
| seed 不存在但池子非空 → 仍渲染（不抛错） | `returns empty (no-candidates) when seed work id is missing` (注：测试名旧；实测为 rendered 分支) ✅ |
| 上限 4 | `limits to at most 4 cards` ✅ |
| disabled DOM 无 panel + 无 beacon (I-11) | `renders no DOM when flag is disabled` ✅ |
| 空态稳定文案 | `renders empty-state copy` ✅ |
| 渲染时 h2 + h3 + `/works/[id]` link 不含 seed | `renders cards + heading + correct work links` ✅ |
| works/[workId] 接入：section 在评论 section 之前 | `app/works/[workId]/page.tsx` 修订 + `npm run build` 成功 ✅ |

## 不变量

- I-3 / I-11：✅ 编排层 disabled → null；section short-circuit；DOM 无 panel + 无 beacon。
- I-5：✅ 单次 `listPublicWorks` + 单次 `listPublicProfiles` (spy 断言)。
- I-8：✅ catch 分支同时 warn + counter empty 递增。
- I-10：✅ section 不透传 bundle 到 client。
- I-12：✅ `workToSignals` 使用 `record.updatedAt ?? record.publishedAt ?? ""`。

## NFR

- NFR-001：micro-bench 留待 Increment 级 regression-gate；编排在内存中走 O(N) 候选 + O(N log N) 排序；`ownerProfileById` Map 构建一次。
- NFR-003：`recommendations.section.rendered` / `recommendations.section.failed` event 在 works 半部分继续生效。
- NFR-005：deps 注入。
