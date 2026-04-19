# Release Notes — Phase 2 Discovery Intelligence V1

- Date: `2026-04-19`
- Increment: Phase 2 §3.6 — Discovery Intelligence V1（规则化 Related Creators / Related Works）
- Source ROADMAP: `docs/ROADMAP.md` §3.6

## 用户可见变化

- 创作者公开主页（`/photographers/[slug]`、`/models/[slug]`）底部新增「相关创作者 — 也看看这些创作者」section：最多 4 张同角色创作者卡片，按城市 + 拍摄方向相似度倒序，点击直达对应公开主页。
- 作品详情页（`/works/[workId]`）评论区上方新增「相关作品 — 也看看这些作品」section：最多 4 张已发布作品卡片，按同 owner / 同 owner 城市 / 同 category 相似度倒序，点击直达对应作品详情。
- 当系统中只有当前创作者本人 / 当前作品本身时，section 显示稳定空态文案（「暂无更多相关创作者」/「暂无更多相关作品」），不报错、不渲染空卡片网格。
- 关闭 feature flag `RECOMMENDATIONS_RELATED_ENABLED=false` 后，两个 section 在 SSR 层 DOM 中均不渲染，且不再产生事件 / metrics 增量。
- 既有 Phase 1 + Discovery Quality + Observability & Ops V1 的所有用户可见行为均不发生变化。

## 内部新增 / 改动

- 新 feature 模块 `web/src/features/recommendations/`（types / signals / scoring / config / metrics / related-creators / related-works / 两个 SSR section / index / test-support）。
- 新事件类型 `related_card_view`（`DiscoveryEventType` 联合扩展）。
- 新 4 个 metrics counter（`recommendations.related_{creators,works}.{cards_rendered,empty}`），通过 `MetricsSnapshot.recommendations` 加性扩展暴露。
- 新 env 字段 `RECOMMENDATIONS_RELATED_ENABLED`（默认 `true`）。
- 类型穷尽性放宽：`view-beacon.tsx` `eventType` 与 `/api/discovery-events/route.ts` `DiscoveryEventRequestBody.eventType` 都已绑定到完整 `DiscoveryEventType` 联合。

## 性能 / 质量基线

- NFR-001 micro-bench：`getRelatedCreators` P95 = 0.05ms / `getRelatedWorks` P95 = 0.04ms；30ms 预算下余量 ≈ 600× / 750×。
- 业务零回归：全套 vitest baseline 不漂移；新增 7 个 passed test files / 65 个 passed tests。
- 不引入运行时 npm 依赖；`package.json` / lockfile 未变。

## 显式延后 / 仍未做

- 向量检索 / pgvector / ML 排序
- A/B 框架与流量分桶
- 基于用户行为的个性化推荐（`discovery_events` 个性化通路）
- 首页 / 发现页 / 搜索页 Related 模块注入
- 跨角色推荐
- `dwell time` / `scroll depth` 事件扩展
- 「为什么推荐」解释面（NFR-002 + SRS A-003）

## 关键工件索引

- 增量记录: `docs/reviews/increment-phase2-discovery-intelligence-v1.md`
- SRS / Design / Tasks: 见 `docs/specs/`、`docs/designs/`、`docs/tasks/` 同名 `2026-04-19-discovery-intelligence-v1-*.md`
- 5 任务全套评审 / 验证证据: `docs/reviews/*-T52..T56.md` + `docs/verification/*-T52..T56.md`
- Increment regression / completion / finalize: `docs/verification/{regression-gate,completion-gate,finalize}-phase2-discovery-intelligence-v1.md`
