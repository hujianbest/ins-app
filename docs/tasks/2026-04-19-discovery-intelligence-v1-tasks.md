# Phase 2 — Discovery Intelligence V1 任务计划

- 状态: 已批准
- 批准记录: `docs/verification/tasks-approval-phase2-discovery-intelligence-v1.md`
- 主题: Phase 2 — Discovery Intelligence V1（规则化 Related Creators / Related Works）
- 输入规格: `docs/specs/2026-04-19-discovery-intelligence-v1-srs.md`（已批准）
- 输入设计: `docs/designs/2026-04-19-discovery-intelligence-v1-design.md`（已批准）
- 关联 review: `docs/reviews/spec-review-phase2-discovery-intelligence-v1.md`、`docs/reviews/design-review-phase2-discovery-intelligence-v1.md`、`docs/reviews/ui-review-phase2-discovery-intelligence-v1.md`
- 关联 approval: `docs/verification/spec-approval-phase2-discovery-intelligence-v1.md`、`docs/verification/design-approval-phase2-discovery-intelligence-v1.md`
- 当前活跃任务: `T52`（Walking Skeleton：types/env/metrics 命名空间扩展）

## 1. 概述

本计划把已批准设计拆为 5 个**可独立 fail-first 推进**的任务（`T52` ~ `T56`），覆盖：

- 类型 / env / metrics 命名空间的横切扩展（`T52`）
- 纯函数评分核心 + 权重不变量（`T53`）
- Related Creators 编排 + section 组件 + 创作者主页接入（`T54`）
- Related Works 编排 + section 组件 + 作品详情页接入（`T55`）
- DiscoveryEventType 联动 + view-beacon + /api/discovery-events route handler 类型放宽（`T56`）

拆解原则：

- 先做最薄端到端的横切骨架（`T52`：env flag + DiscoveryEventType 扩展 + MetricsSnapshot 命名空间扩展），确保 cross-cutting 契约先 work，再做业务面。
- 评分核心（`T53`）作为纯函数任务，独立 vitest 闭环；权重不变量与 SRS §8.3 一一对应。
- Related Creators 与 Related Works 同形对称，分两个任务（`T54` / `T55`），各自携带自己的 SSR section 组件、单测、page-level 集成测试与 metrics / event 接入。
- view-beacon 类型放宽 + `/api/discovery-events` route handler 本地类型放宽（`T56`）放在最后，作为 FR-005 验收 #5 的 TypeScript 穷尽性收口；该任务一旦合并会同时影响 `T54` / `T55` 已经写入的 beacon `eventType="related_card_view"`。
- 选择优先级：`T52 → T53 → T54 → T55 → T56`，同时允许 `T54` / `T55` 在依赖满足后并行（实际是否并行由 router 决定）。

每个任务遵循 `web/AGENTS.md` 的 fail-first 节奏：写测试 → 跑 → 红 → 实现 → 跑 → 绿 → 跑 `npm run test / typecheck / lint / build` 全绿。

## 2. 里程碑

### M1 横切骨架（`T52`）

- 目标：`web/src/config/env.ts` 增加 `recommendationsRelatedEnabled`（默认 `true`，非法值降级 + warn）；`web/src/features/community/types.ts` `DiscoveryEventType` 联合追加 `"related_card_view"`；`web/src/features/observability/metrics.ts` `MetricsSnapshot` 增加 optional 顶层 `recommendations` 命名空间；新增 `web/src/features/recommendations/{types,signals,metrics,config,index}.ts` 骨架与不变量单测（不引入业务 IO）。
- 退出标准：vitest 覆盖 env 默认 / 非法值 / metrics snapshot 新字段 / signals 权重不变量 / DiscoveryEventType 类型联合断言全绿；`cd web && npm run test && npm run typecheck && npm run lint && npm run build` 全绿。

### M2 评分核心（`T53`）

- 目标：实现 `scoring.ts` 的 `scoreCreator` / `scoreWork` / `rankCandidates` 三个纯函数，覆盖 SRS §8.3 不变量（`weight(city) >= weight(shootingFocus)`、`weight(sameOwner) > weight(ownerCity) >= weight(category)`）与 FR-003 / FR-007 的所有验收。
- 退出标准：`scoring.test.ts` 覆盖确定性 / 缺省字段 / `score ∈ [0,1]` / 严格序 / tie-breaker（`updatedAt` desc → `targetKey` asc）/ 自身候选过滤是上层职责（函数本身不抛错）；`npm run test / typecheck / lint / build` 全绿。

### M3 Related Creators 端到端（`T54`）

- 目标：实现 `related-creators.ts` 编排 + `related-creators-section.tsx` SSR section + 创作者主页（`profile-showcase-page.tsx`）接入；FR-001 / FR-004 / FR-006（creators 半部分）/ FR-008 全部验收闭环。
- 退出标准：`related-creators.test.ts`、`related-creators-section.test.tsx`、`profile-showcase-page` / `app/photographers/[slug]/page.test.tsx` / `app/models/[slug]/page.test.tsx` 集成断言全绿；含 disabled / 空候选池 / soft-fail / counter 递增 / logger 写入 / `updatedAt` 缺省回退；性能 micro-bench `< 30ms`；`npm run test / typecheck / lint / build` 全绿。

### M4 Related Works 端到端（`T55`）

- 目标：实现 `related-works.ts` 编排 + `related-works-section.tsx` SSR section + 作品详情页（`app/works/[workId]/page.tsx`）接入；FR-002 / FR-004 / FR-006（works 半部分）/ FR-007 / FR-008 全部验收闭环。
- 退出标准：`related-works.test.ts`、`related-works-section.test.tsx`、`app/works/[workId]/page.test.tsx` 集成断言全绿；含 disabled / 空候选池 / draft 候选过滤 / soft-fail / counter 递增 / logger 写入；性能 micro-bench `< 30ms`；`npm run test / typecheck / lint / build` 全绿。

### M5 事件入口收口（`T56`）

- 目标：`view-beacon.tsx` 的 `eventType` 放宽至完整 `DiscoveryEventType`；`web/src/app/api/discovery-events/route.ts` 本地 `DiscoveryEventRequestBody.eventType` 放宽至完整 `DiscoveryEventType`；`view-beacon.test.tsx`、`discovery-events/route.test.ts` 覆盖 `related_card_view` 路径；FR-005 验收 #5 的 TS 穷尽性约束生效。
- 退出标准：所有 vitest（含 `T54` / `T55` 写入的 beacon 调用点）继续全绿；`route.test.ts` 含 `eventType="related_card_view"` 的 happy path；`npm run test / typecheck / lint / build` 全绿。

## 3. 文件 / 工件影响图

### 新增

- `web/src/features/recommendations/types.ts` + `.test.ts`（单测覆盖类型边界 / 工厂）
- `web/src/features/recommendations/signals.ts` + `.test.ts`（权重不变量）
- `web/src/features/recommendations/scoring.ts` + `.test.ts`
- `web/src/features/recommendations/related-creators.ts` + `.test.ts`
- `web/src/features/recommendations/related-works.ts` + `.test.ts`
- `web/src/features/recommendations/related-creators-section.tsx` + `.test.tsx`
- `web/src/features/recommendations/related-works-section.tsx` + `.test.tsx`
- `web/src/features/recommendations/config.ts` + `.test.ts`
- `web/src/features/recommendations/metrics.ts`（键名常量）
- `web/src/features/recommendations/index.ts`（barrel export）
- `web/src/features/recommendations/test-support.ts`（fake bundle / fake registry helper）
- `docs/verification/test-design-T52.md` ~ `T56.md`
- `docs/verification/implementation-T52.md` ~ `T56.md`
- `docs/reviews/bug-patterns-T52.md` ~ `T56.md`
- `docs/reviews/test-review-T52.md` ~ `T56.md`
- `docs/reviews/code-review-T52.md` ~ `T56.md`
- `docs/reviews/traceability-review-T52.md` ~ `T56.md`
- `docs/verification/regression-T52.md` ~ `T56.md`
- `docs/verification/completion-T52.md` ~ `T56.md`
- `docs/verification/regression-gate-phase2-discovery-intelligence-v1.md`
- `docs/verification/completion-gate-phase2-discovery-intelligence-v1.md`
- `docs/verification/finalize-phase2-discovery-intelligence-v1.md`
- `docs/verification/release-notes-phase2-discovery-intelligence-v1.md`

### 修改

- `web/src/config/env.ts`（新增 `recommendationsRelatedEnabled`）
- `web/src/config/env.test.ts`（新增 default + 非法值降级 case）
- `web/src/features/community/types.ts`（`DiscoveryEventType` 联合追加 `"related_card_view"`）
- `web/src/features/observability/metrics.ts`（`MetricsSnapshot` 加性扩展 `recommendations` 命名空间）
- `web/src/features/observability/metrics.test.ts`（snapshot 字段断言）
- `web/src/features/discovery/view-beacon.tsx`（`eventType` 类型放宽）
- `web/src/features/discovery/view-beacon.test.tsx`（新增 `related_card_view` case）
- `web/src/app/api/discovery-events/route.ts`（本地 `DiscoveryEventRequestBody.eventType` 类型放宽）
- `web/src/app/api/discovery-events/route.test.ts`（新增 `related_card_view` happy path）
- `web/src/features/showcase/profile-showcase-page.tsx`（挂 `RelatedCreatorsSection`）
- `web/src/app/photographers/[slug]/page.test.tsx`、`web/src/app/models/[slug]/page.test.tsx`（断言 section 出现 / 空态 / disabled）
- `web/src/app/works/[workId]/page.tsx`（挂 `RelatedWorksSection`）
- `web/src/app/works/[workId]/page.test.tsx`（断言 section 出现 / 空态 / disabled）
- `task-progress.md`（每个任务完成时同步）
- `RELEASE_NOTES.md`（在 `T56` 完成后的 finalize 阶段一次性追加）
- `docs/ROADMAP.md`（finalize 阶段回写「§3.6 V1 已交付」）
- `README.md`（finalize 阶段更新功能完成度概览）

## 4. 需求与设计追溯

| 规格 / 设计锚点 | 落地任务 |
| --- | --- |
| `FR-001` Related Creators 模块 | `T54`（接入 + 编排 + section）、`T53`（评分） |
| `FR-002` Related Works 模块 | `T55`（接入 + 编排 + section）、`T53`（评分） |
| `FR-003` 纯函数打分 | `T53` |
| `FR-004` Feature flag + 零回归 | `T52`（env + config）、`T54` / `T55`（编排层闭合） |
| `FR-005` `related_card_view` 事件 | `T52`（DiscoveryEventType 扩展）、`T56`（view-beacon + route handler 类型放宽 + 测试）、`T54` / `T55`（section 内 beacon 调用） |
| `FR-006` `recommendations.*` Metrics | `T52`（MetricsSnapshot 扩展 + key 常量）、`T54` / `T55`（编排层 increment 调用） |
| `FR-007` 候选上限 + 稳定排序 | `T53` |
| `FR-008` SSR 性能 / 安全降级 | `T54` / `T55`（编排层 try/catch + 单次 repository 读 + micro-bench） |
| `NFR-001` 性能 ≤ 30ms | `T54` / `T55`（micro-bench）+ Increment 级 `hf-regression-gate` |
| `NFR-002` 隐私 | `T54` / `T55` / `T56`（不引入新事件字段；不消费 actorAccountId 个性化） |
| `NFR-003` 可观测性 | `T54` / `T55`（`event=recommendations.section.{rendered,failed}` logger 字段集合） |
| `NFR-004` 可测试性 | `T52` ~ `T56` 全部任务（编排层接受 deps 注入；evidence: `test-support.ts`） |
| `NFR-005` 兼容性 | `T54` / `T55` / `T56`（不修改任何已交付 server action / route handler 的业务行为） |
| 设计 §11 I-1 ~ I-12 不变量 | `T53`（I-1, I-2, I-7）、`T54` / `T55`（I-3, I-5, I-8, I-10, I-11, I-12）、`T56`（I-4, I-9）、`T52`（I-6） |
| 设计 ADR-1 候选获取单次读 | `T54` / `T55` |
| 设计 ADR-2 beacon 类型放宽 | `T56` |
| 设计 ADR-3 MetricsSnapshot 加性扩展 | `T52` |
| 设计 ADR-4 flag 单点闭合 | `T54` / `T55` |
| 设计 ADR-5 权重表 + 不变量单测 | `T53` |

## 5. 任务拆解

### T52. Cross-Cutting Skeleton（types / env / metrics namespace / signals 不变量）

- 目标：建立 `recommendations` feature 模块骨架；在不引入任何业务 IO 的前提下打通 cross-cutting 契约（env flag、`DiscoveryEventType` 枚举扩展、`MetricsSnapshot.recommendations` 加性字段、`signals.ts` 权重表 + 不变量单测、`metrics.ts` 键名常量、`config.ts` flag 解析、`types.ts` `CreatorSignals` / `WorkSignals` / `RankedCandidate` / `RelatedSectionResult` 类型）。
- Acceptance:
  - `web/src/config/env.ts` 新增 `recommendationsRelatedEnabled: boolean`，默认 `true`；非法值降级 + 写入 `ConfigWarning`，不抛错。
  - `web/src/features/community/types.ts` `DiscoveryEventType` 联合追加 `"related_card_view"`，TypeScript 严格模式编译通过。
  - `web/src/features/discovery/view-beacon.tsx` 的 `eventType` 类型从 `Extract<DiscoveryEventType, "work_view" | "profile_view">` 放宽至完整 `DiscoveryEventType`（type-only 改动；既有 `view-beacon.test.tsx` / `route.ts` / `route.test.ts` 在 `T56` 收口扩展，本任务不改这些文件的运行时行为）。
  - `web/src/features/observability/metrics.ts` `MetricsSnapshot` 顶层新增 optional `recommendations?: { related_creators: { cards_rendered: number; empty: number }; related_works: { cards_rendered: number; empty: number } }`；`createMetricsRegistry()` 在 `snapshot()` 中按 `RECOMMENDATIONS_COUNTER_NAMES` 输出该字段，初始值全部为 0；既有 `http` / `sqlite` / `business` / `gauges` / `labels` 字段不变。
  - `web/src/features/recommendations/signals.ts` 暴露 `RELATED_CREATORS_WEIGHTS = { city: 0.6, shootingFocus: 0.4 }`、`RELATED_WORKS_WEIGHTS = { sameOwner: 0.55, ownerCity: 0.3, category: 0.15 }`、`CARDS_LIMIT = 4`；`signals.test.ts` 断言 SRS §8.3 不变量与权重和 ≤ 1.0。
  - `web/src/features/recommendations/metrics.ts` 暴露 `RECOMMENDATIONS_COUNTER_NAMES`（4 个键名）与 `incrementRelatedCreatorsRendered(registry, n)` / `incrementRelatedCreatorsEmpty(registry)` 等薄 helper（不在散落代码中拼字符串，I-6）。
  - `web/src/features/recommendations/config.ts` 暴露 `getRecommendationsConfig(): { relatedEnabled: boolean }`，从 `getAppConfig()` / 等价入口读取。
  - `web/src/features/recommendations/types.ts` 暴露 `CreatorSignals`、`WorkSignals`、`RankedCandidate<T>`、`RelatedSectionResult<TCard>`、`RelatedCreatorCard`、`RelatedWorkCard`；`CreatorSignals.targetKey` 与 `WorkSignals.targetKey` 必填。
- 依赖: 无（首项任务）。
- Ready When: 设计 + tasks-review 已批准。
- 初始队列状态: `ready`。
- Selection Priority: 1（cross-cutting 骨架优先）。
- Files / 触碰工件:
  - 新增 `web/src/features/recommendations/types.ts`、`signals.ts`、`signals.test.ts`、`metrics.ts`、`config.ts`、`config.test.ts`、`index.ts`、`test-support.ts`
  - 修改 `web/src/config/env.ts`、`web/src/config/env.test.ts`
  - 修改 `web/src/features/community/types.ts`
  - 修改 `web/src/features/observability/metrics.ts`、`web/src/features/observability/metrics.test.ts`
  - 修改 `web/src/features/discovery/view-beacon.tsx`（type-only：放宽 `eventType` 到完整 `DiscoveryEventType`）
- 测试设计种子:
  - 主行为：`getRecommendationsConfig()` 默认返回 `{ relatedEnabled: true }`；非法值降级。
  - 关键边界：`MetricsSnapshot.recommendations` 在零状态下 4 个字段均为 0；`RELATED_*_WEIGHTS` 满足 SRS §8.3 不变量。
  - fail-first 点：`DiscoveryEventType` 联合中 `related_card_view` 必须可被显式断言。
  - 可测试性 (NFR-005)：所有断言通过显式 env 或显式注入完成；不依赖默认 sqlite 实例。
- Verify: `cd web && npm run test && npm run typecheck && npm run lint && npm run build`。
- 预期证据: `docs/verification/test-design-T52.md`、`docs/verification/implementation-T52.md`、`docs/reviews/bug-patterns-T52.md`、`docs/reviews/test-review-T52.md`、`docs/reviews/code-review-T52.md`、`docs/reviews/traceability-review-T52.md`、`docs/verification/regression-T52.md`、`docs/verification/completion-T52.md`。
- 完成条件: 所有 unit + 集成测试绿；上述 npm 链路全绿；评审链 `bug-patterns → test-review → code-review → traceability-review → regression-gate(任务级 sanity) → completion-gate` 全部通过。

---

### T53. Pure Scoring Core

- 目标：实现 `scoring.ts` 的 `scoreCreator(seed, candidate, weights?)`、`scoreWork(seed, candidate, weights?)`、`rankCandidates(seed, candidates, scoreFn, options?)` 三个纯函数；满足 FR-003 / FR-007 的全部验收与 §11 I-1 / I-2 / I-7 不变量。
- Acceptance:
  - `scoreCreator` / `scoreWork` 接受默认权重，输出 `{ score, breakdown }`；`score ∈ [0, 1]`；缺省字段贡献为 0；权重为 0 时该信号贡献为 0。
  - 同输入多次调用结果完全相同（确定性）。
  - `rankCandidates(seed, candidates, scoreFn, { limit: 4 })` 排序：`(a, b) => b.score - a.score || cmpUpdatedAtDesc(a, b) || cmpKeyAsc(a, b)`；最多返回 4 项，少于 4 项原样返回。
  - `rankCandidates` 接受 `options.isSelf` 用于排除自身；scoring 函数本身对 seed===candidate 不抛错（FR-003 验收 #4）。
  - 创作者评分严格序：同城 + 同方向 (1.0) > 同城 (0.6) > 同方向 (0.4) > 都不同 (0)。
  - 作品评分严格序：同 owner（必然同城同 category 不一定）> 同 owner 城市 / 不同 owner > 同 category / 不同 owner / 不同 owner 城市 > 都不同。
- 依赖: `T52`（需要 `signals.ts` 权重表与 `types.ts`）。
- Ready When: `T52` completion-gate 通过。
- 初始队列状态: `pending`。
- Selection Priority: 2。
- Files / 触碰工件:
  - 新增 `web/src/features/recommendations/scoring.ts`、`scoring.test.ts`
- 测试设计种子:
  - 主行为：scoreCreator / scoreWork 在 4 类组合下严格序断言（fail-first）。
  - 关键边界：`updatedAt` desc tie-breaker、`targetKey` asc tie-breaker；缺省字段贡献 0。
  - fail-first 点：`score ∈ [0,1]`；权重为 0 时贡献 0；同输入幂等。
  - 可测试性 (NFR-005)：纯函数无 IO；测试不需要任何 mock。
- Verify: `cd web && npm run test && npm run typecheck && npm run lint && npm run build`。
- 预期证据: T53 评审 / 验证文件全套。
- 完成条件: 同 T52。

---

### T54. Related Creators 编排 + Section + 创作者主页接入

- 目标：实现 `related-creators.ts` 编排函数 + `related-creators-section.tsx` SSR async server component + 在 `profile-showcase-page.tsx` 末尾挂载 section；FR-001 / FR-004（creators 半部分）/ FR-006（creators 半部分）/ FR-008 全部验收闭环。
- Acceptance:
  - `getRelatedCreators({ role, slug }, deps?)`：
    - flag disabled → 返回 `null`。
    - 读 `bundle.profiles.listPublicProfiles()` 一次（FR-008 #3 同一次 SSR 候选池只读取一次）。
    - 过滤同角色 + 排除自身 + mapping `updatedAt = record.updatedAt ?? record.publishedAt ?? ""`、`targetKey = ${role}:${slug}`。
    - 调 `rankCandidates(seed, candidates, scoreCreator, { limit: 4, isSelf })`。
    - 候选为空 → counter `recommendations.related_creators.empty` += 1，返回 `{ kind: "empty", reason: "no-candidates" }`。
    - 候选非空 → counter `recommendations.related_creators.cards_rendered` += `cards.length`，logger.info `event=recommendations.section.rendered`，返回 `{ kind: "rendered", cards }`。
    - 异常：catch → logger.warn `event=recommendations.section.failed` + counter `.empty` += 1 + 返回 `{ kind: "empty", reason: "soft-fail" }`（FR-008 #4）。
  - `RelatedCreatorsSection`（async server component）：
    - flag disabled (`getRelatedCreators` 返回 `null`) → 组件返回 `null`，DOM 中无 panel、无 `DiscoveryViewBeacon`（I-11）。
    - `kind === "empty"` → 渲染 panel + 稳定空态文案，不渲染卡片网格。
    - `kind === "rendered"` → 渲染 panel + N 张 `EditorialCard` + N 个 `<DiscoveryViewBeacon eventType="related_card_view" targetType="profile" surface="related_creators_section" ...>`。
  - `profile-showcase-page.tsx`：在原 `<header>` + `<section>` 之后挂 `<RelatedCreatorsSection seed={{ role: profile.role, slug: profile.slug }} />`。
  - 性能 micro-benchmark：100 名候选下 `getRelatedCreators` P95 ≤ 30ms（vitest bench / 100 次顺序调用 + 计算 P95）。
  - 业务零回归：`/photographers/[slug]` 与 `/models/[slug]` 既有 vitest 测试不变绿。
  - 集成测试：fake bundle 含 ≥2 名同角色 → section 渲染卡片；只 1 名 → section 渲染稳定空态；flag disabled → DOM 中无 section（截然区分两种"空"）。
- 依赖: `T52`、`T53`。
- Ready When: `T52` 与 `T53` completion-gate 都通过。
- 初始队列状态: `pending`。
- Selection Priority: 3。
- Files / 触碰工件:
  - 新增 `web/src/features/recommendations/related-creators.ts`、`related-creators.test.ts`
  - 新增 `web/src/features/recommendations/related-creators-section.tsx`、`related-creators-section.test.tsx`
  - 修改 `web/src/features/showcase/profile-showcase-page.tsx`
  - 修改 `web/src/app/photographers/[slug]/page.test.tsx`、`web/src/app/models/[slug]/page.test.tsx`
- 测试设计种子:
  - 主行为：`getRelatedCreators` 的 4 条主路径（disabled / rendered / empty-no-candidates / empty-soft-fail）。
  - 关键边界：FR-008 #3 单次 repository 读断言（spy `listPublicProfiles` 调用次数 = 1）；`updatedAt` 缺省回退稳定性；I-11 disabled 时 DOM 中无 beacon。
  - fail-first 点：counter / logger 调用形态严格匹配；自身候选过滤。
  - 可测试性 (NFR-005)：通过 `recommendations/test-support.ts` 的 fake bundle / fake registry / fake logger 注入。
- Verify: `cd web && npm run test && npm run typecheck && npm run lint && npm run build`。
- 预期证据: T54 评审 / 验证文件全套。
- 完成条件: 同 T52。

---

### T55. Related Works 编排 + Section + 作品详情页接入

- 目标：实现 `related-works.ts` 编排函数 + `related-works-section.tsx` SSR async server component + 在 `app/works/[workId]/page.tsx` 评论区上方挂载 section；FR-002 / FR-004（works 半部分）/ FR-006（works 半部分）/ FR-007 / FR-008 全部验收闭环。
- Acceptance:
  - `getRelatedWorks({ workId }, deps?)`：
    - flag disabled → 返回 `null`。
    - 读 `bundle.works.listPublicWorks()` + `bundle.profiles.listPublicProfiles()` 各一次（FR-008 #3，profile map 用于 `ownerProfileId → ownerCity / ownerShootingFocus` 查找，避免 N×repository 读放大）。
    - 候选过滤：`status === "published"`（草稿安全）+ 排除自身 workId + mapping `updatedAt = record.updatedAt ?? record.publishedAt ?? ""`、`targetKey = workId`。
    - 调 `rankCandidates(seed, candidates, scoreWork, { limit: 4, isSelf })`。
    - 空 / 非空 / 异常分支与 §T54 同形（counter 命名空间为 `recommendations.related_works.{cards_rendered,empty}`）。
  - `RelatedWorksSection`：与 §T54 section 结构对称；卡片包含 cover / title / ownerName / category；`href = "/works/${card.workId}"`；beacon `targetType="work"` `surface="related_works_section"`。
  - `app/works/[workId]/page.tsx`：在 `<section className="museum-panel p-6 md:p-8">`（评论区）**之前**挂 `<RelatedWorksSection seed={{ workId: work.id }} />`。
  - 性能 micro-benchmark：200 篇 + 50 个 profile 下 `getRelatedWorks` P95 ≤ 30ms。
  - 业务零回归：`/works/[workId]` 既有 vitest 不变绿。
  - 集成测试：fake bundle 含 ≥2 篇已发布 → section 渲染卡片；只 1 篇 → 稳定空态；flag disabled → DOM 中无 section；草稿不进入候选池。
- 依赖: `T52`、`T53`。
- Ready When: `T52` 与 `T53` completion-gate 都通过（与 `T54` 可并行）。
- 初始队列状态: `pending`。
- Selection Priority: 4（与 `T54` 同优先级；按字典序选 `T54` 先；并行授权由 router 决定）。
- Files / 触碰工件:
  - 新增 `web/src/features/recommendations/related-works.ts`、`related-works.test.ts`
  - 新增 `web/src/features/recommendations/related-works-section.tsx`、`related-works-section.test.tsx`
  - 修改 `web/src/app/works/[workId]/page.tsx`、`web/src/app/works/[workId]/page.test.tsx`
- 测试设计种子:
  - 主行为：4 条主路径同 T54。
  - 关键边界：candidate 过滤 draft；`profile-map` 单次构建；`updatedAt` 缺省回退；I-11 disabled 时 DOM 中无 beacon。
  - fail-first 点：work scoring 严格序（同 owner > 同 owner 城市 > 同 category > 都不同）；section 在评论 section 之前。
  - 可测试性 (NFR-005)：fake bundle 注入；`test-support.ts` 共用 §T54 的 helper。
- Verify: `cd web && npm run test && npm run typecheck && npm run lint && npm run build`。
- 预期证据: T55 评审 / 验证文件全套。
- 完成条件: 同 T52。

---

### T56. `/api/discovery-events` route handler 类型放宽 + beacon 测试扩展（FR-005 收口）

- 目标：（`view-beacon.tsx` 的 `eventType` 类型放宽已在 `T52` type-only 完成）`web/src/app/api/discovery-events/route.ts` 本地 `DiscoveryEventRequestBody.eventType` 从 `"work_view" | "profile_view"` 放宽至完整 `DiscoveryEventType`；`view-beacon.test.tsx` 与 `route.test.ts` 新增覆盖 `related_card_view` 路径的 vitest 用例；FR-005 验收 #5 的 TS 穷尽性约束生效。
- Acceptance:
  - （`T52` 已放宽 `view-beacon.tsx` 的 `eventType` 类型）`<DiscoveryViewBeacon eventType="related_card_view" ... />` 在 §T54 / §T55 中编译通过；既有 `work_view` / `profile_view` 调用点不变。
  - `/api/discovery-events` route handler 接收带 `eventType="related_card_view"` 的请求时，正确写入 `DiscoveryEventRepository`，并返回 `{ ok: true }`。
  - `view-beacon.test.tsx` 新增 case：`eventType="related_card_view"` 的渲染触发 `sendBeacon` 一次（含 fallback fetch 降级路径覆盖）。
  - `route.test.ts` 新增 case：POST `{ eventType: "related_card_view", targetType: "profile", targetId: "photographer:foo", surface: "related_creators_section" }` 成功入库（用 fake `recordDiscoveryEvent` 验证调用参数）。
  - 业务零回归：所有现有 vitest 不变绿；`work_view` / `profile_view` 路径继续工作。
- 依赖: `T52`（DiscoveryEventType + view-beacon.tsx 类型已扩展）AND `T54` AND `T55`（section 已写入 beacon 调用点；本任务为运行时穷尽性收口，确保 `T54 / T55` 已经写入的 `eventType="related_card_view"` 在浏览器 → route handler 全链路有 vitest 覆盖）。AND 语义：必须 `T52 / T54 / T55` 三者全部通过 completion-gate，T56 才进入 `ready`。
- Ready When: `T52` AND `T54` AND `T55` 三者 completion-gate 全部通过。
- 初始队列状态: `pending`。
- Selection Priority: 5（最后任务）。
- Files / 触碰工件:
  - 修改 `web/src/features/discovery/view-beacon.test.tsx`（仅测试，运行时类型已在 `T52` 放宽）
  - 修改 `web/src/app/api/discovery-events/route.ts`、`route.test.ts`
- 测试设计种子:
  - 主行为：beacon 渲染 `related_card_view` → sendBeacon 一次；route handler 入库成功。
  - 关键边界：fallback fetch 路径在 sendBeacon 不可用时被走到。
  - fail-first 点：现有 `work_view` / `profile_view` 路径不变。
- Verify: `cd web && npm run test && npm run typecheck && npm run lint && npm run build`。
- 预期证据: T56 评审 / 验证文件全套。
- 完成条件: 同 T52。

## 6. 依赖与关键路径

```
T52 (Cross-Cutting Skeleton)
 ├── T53 (Scoring Core)
 │    ├── T54 (Related Creators 端到端)
 │    └── T55 (Related Works 端到端)
 │              └── T56 (Beacon + /api/discovery-events 类型放宽收口)
 └── T56 also requires T52 (DiscoveryEventType extended)
```

关键路径（图论依赖，AND 语义；与 §9 queue projection / §T56 Ready When 一致）：

- `T56` 严格依赖 `{T52, T54, T55}`（AND）。语义说明：`T54 / T55` 中 `eventType="related_card_view"` 已写入；`T56` 把 view-beacon / route handler 的运行时入库链路用 vitest 端到端覆盖，必须等两个 section 都已实现，避免 route handler 测试遗漏 `related_creators_section` / `related_works_section` 任一 surface 路径。
- `T54` / `T55` 严格依赖 `{T52, T53}`，互不依赖（可并行）。
- `T53` 严格依赖 `{T52}`。

`Selection Priority` 仅用于在多个 `ready` 候选中决定 `Current Active Task`：

- `T52` 通过后 → `T53` 进入 `ready`；`T56` 仍 `pending`（依赖未满足）。
- `T53` 通过后 → `T54` / `T55` 同时 `ready`；按 priority 升序选 `T54`。
- `T54` 通过后 → `T55` 仍 ready；选 `T55`。
- `T54` 与 `T55` 都通过后 → `T56` 进入 `ready`（AND 语义）。
- `T56` 通过后 → 进入 `hf-regression-gate`（Increment 级）。

本计划默认选 `T52 → T53 → T54 → T55 → T56` 顺序推进，保证 reviewer cold-read 能看到一条线性叙事；并不禁止 router 在并发授权下让 `T54 / T55` 并行。

## 7. 完成定义与验证策略

### 任务级
- fail-first 测试 → 红 → 实现 → 绿
- `cd web && npm run test && npm run typecheck && npm run lint && npm run build` 全部 exit 0
- 评审链：`hf-bug-patterns → hf-test-review → hf-code-review → hf-traceability-review → hf-regression-gate（任务级 sanity） → hf-completion-gate`
- 评审记录与验证证据落到 `docs/reviews/*-T<id>.md` 与 `docs/verification/*-T<id>.md`

### Increment 级（T52 ~ T56 全部完成后）
- `hf-regression-gate`：执行 NFR-001 性能基线对比（设计 §13 micro-bench 协议）；记录到 `docs/verification/regression-gate-phase2-discovery-intelligence-v1.md`
- `hf-completion-gate`：聚合所有任务完成证据 + Increment 级 NFR / CON 闭合声明
- `hf-finalize`：更新 `RELEASE_NOTES.md`、`docs/ROADMAP.md`（§3.6 标记已交付 V1）、`README.md`、`task-progress.md`

## 8. 当前活跃任务选择规则

- 默认按 §6 拓扑顺序选择第一个 `ready` 任务作为 `Current Active Task`。
- 当某个任务 completion-gate 通过：
  1. 把该任务移到 `Completed Tasks`，清空 `Current Active Task`
  2. 重新扫描所有 `pending` 任务的依赖；将依赖全部 `Completed` 的任务标记为 `ready`
  3. 在 `ready` 任务集合中按 `Selection Priority` 升序选第一个作为新 `Current Active Task`
  4. 如果 `ready` 集合为空且无 `pending` → 进入 `hf-regression-gate`（Increment 级）
- 若 ready 集合包含多个候选，由 `hf-workflow-router` 按 `Selection Priority` 与依赖图权威决定；不在 `hf-test-driven-dev` 内自行选择。

## 9. 任务队列投影视图

| Task | Status | Depends On | Priority | Acceptance Headline |
| --- | --- | --- | --- | --- |
| T52 | ready | — | 1 | env flag + DiscoveryEventType 扩展 + MetricsSnapshot 加性 + signals 不变量 + 模块骨架 |
| T53 | pending | T52 | 2 | 纯函数评分 + tie-breaker + 严格序 |
| T54 | pending | T52, T53 | 3 | Related Creators 编排 + section + 创作者主页接入 |
| T55 | pending | T52, T53 | 4 | Related Works 编排 + section + 作品详情页接入 |
| T56 | pending | T52, T54, T55 | 5 | view-beacon + /api/discovery-events 类型放宽（FR-005 收口） |

## 10. 风险与顺序说明

- **R-1**：`T52` 在 `MetricsSnapshot` 上加性扩展时，必须保留既有 `http` / `sqlite` / `business` / `gauges` / `labels` 字段输出格式，否则会拖垮 §3.8 V1 的 `/api/metrics` 消费者。缓解：`T52` 测试用例直接 assert 既有字段格式不变；新增 `recommendations` 字段断言独立。
- **R-2**：`T54` / `T55` 在 `profile-showcase-page.tsx` / `app/works/[workId]/page.tsx` 改动可能与既有 page snapshot / e2e 测试产生差异。缓解：先跑既有测试拿到 baseline，section 加入后断言新 section 不破坏既有 layout（既有断言主要在文本内容与 link，section 加在末尾不会影响）。
- **R-3**：`T54` / `T55` 在 `getRelatedWorks` 中既需要 works 又需要 profiles，**必须**只各读一次（FR-008 #3）。缓解：编排函数显式构造 `Map<ownerProfileId, profile>`，并在测试中 spy `listPublicProfiles` / `listPublicWorks` 调用次数 = 1。
- **R-4**：`T56` 的 view-beacon 类型放宽如果在 `T54 / T55` 之前合并，会导致两个 section 写入的 beacon 调用在 `T56` 之前编译失败。缓解 + 修订：将 `view-beacon.tsx` 的类型放宽（type-only）从 `T56` 移到 `T52`，`T54 / T55` 中编写 `<DiscoveryViewBeacon eventType="related_card_view" ... />` 时直接编译通过；`T56` 仅负责 `view-beacon.test.tsx` 测试用例 + `/api/discovery-events/route.ts` 本地类型放宽 + `route.test.ts` 用例。已在 §3 修改清单、§T52 acceptance 与 §T56 acceptance / Files 中统一体现。
- **R-5**：NFR-001 P95 ≤ 30ms 的整页 micro-bench 在仓库测试机上可能不稳定。缓解：micro-bench 取 1000 次顺序调用（剔除前 100 次 cold call），断言 P95；如果在 CI 上偶发不稳定，将断言改为 P99 ≤ 50ms 的更宽松边界（仍在设计预算内）；不要降级 logger / metrics 实现来"通过"测试。

## 11. 修订记录

- 2026-04-19: 起草。R-4 中将 `view-beacon.tsx` 类型放宽（type-only）从 `T56` 移到 `T52`，避免 `T54 / T55` 写入的 beacon 调用点在 `T56` 之前编译失败；`T56` 仅负责 view-beacon 测试用例 + route handler 类型放宽 + route handler 测试用例。
