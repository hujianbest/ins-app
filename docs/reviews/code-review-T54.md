# Code Review — T54

- Task: T54
- Date: `2026-04-19`

## 评审范围

新增：
- `web/src/features/recommendations/related-creators.ts`
- `web/src/features/recommendations/related-creators-section.tsx`
- `web/src/features/recommendations/test-support.ts`

修改：
- `web/src/features/showcase/profile-showcase-page.tsx`
- `web/src/features/recommendations/index.ts`

## 检查点

| 维度 | 评估 |
|---|---|
| 单一职责 | ✅ orchestration / SSR section / test-support 三文件各司其职 |
| 命名 | ✅ `getRelatedCreators` / `RelatedCreatorsSection` / `RelatedCreatorsSeed` 与设计一致 |
| 错误边界 | ✅ try/catch 包住 IO + 排序，soft-fail 走稳定空态 |
| 单次 IO (FR-008 #3) | ✅ `listPublicProfiles` 一次；mapping / find 都在内存中 |
| Flag 单点闭合 (I-3) | ✅ 编排层 disabled → null，section `if (!result) return null` |
| disabled DOM 无 beacon (I-11) | ✅ section 早 return，beacon 不挂载 |
| updatedAt 回退 (I-12) | ✅ `profileToSignals` `record.updatedAt ?? record.publishedAt ?? ""` |
| Card 字段映射 | ✅ heroAsset 来自 `getProfileHeroAssetRef`；name / city / shootingFocus 透传 |
| Server-side dynamic import | ✅ `loadDefaultBundle` 通过动态 import 避免 vite 在客户端 bundle `node:sqlite`（与既有 `public-read-model` 等模块的风格一致；本次 SSR 入口在测试中通过 `deps.bundle` 显式注入跳过） |
| Section a11y | ✅ `<section>` + `SectionHeading` 内 h2 + EditorialCard 内 h3 |
| 注释 | ✅ 仅在 I-3 / I-12 / FR-008 / safety lookup 处加"为什么"注释 |
| Trace 锚点 | ✅ FR-001 / FR-004 / FR-006 / FR-008 / I-3 / I-5 / I-8 / I-10 / I-11 / I-12 在源码或测试可回读 |

## 发现项

无 important / blocking。Minor：
- `RelatedCreatorsSection` 在 `summary` 字段 fallback 顺序为 `city ? "city・focus" : focus || "—"`，能覆盖 city 缺失但 focus 仍存在的情况；可读。
- `loadDefaultBundle` 通过动态 import 把 sqlite 加载推迟到运行时，符合 Next.js server-only 边界。

## 结论

通过。
