# Increment: Phase 2 — Discovery Intelligence V1

- Date: `2026-04-19`
- Theme: Phase 2 — Discovery Intelligence V1（发现智能化第一阶段：规则化 Related Creators / Related Works）
- Source of truth: `docs/ROADMAP.md` §3.6
- Execution Mode: `auto`

## 变更摘要

- 变更摘要：在 `Lens Archive` 完成阶段 1 + Discovery Quality + Observability & Ops V1 之后，启动 ROADMAP §3.6 的第一块独立可交付：**基于已有 `CreatorProfileRecord` / `CommunityWorkRecord` 字段（city、shootingFocus、ownerProfile、category）的纯规则化 "相关创作者" / "相关作品" 模块**。本 increment 不引入向量检索 / ML / 第三方服务，所有打分逻辑在应用进程内完成；不依赖 `discovery_events`，但会埋一个新的 `related_card_view` 事件以便后续 A/B 评估。
- 当前判断：真实 increment（新增需求 / 新规格 / 新设计 / 新任务计划），不是 hotfix、不是范围澄清。
- 影响级别：medium（不修改现有发现/搜索叙事；新增独立 feature 模块 + 2 个 UI 注入位 + 1 个新事件类型 + 内部 metrics 一档）。

## 基线快照

- `Workflow Profile`：`full`（无新规格；新增 feature 模块涉及新 UI surface、新事件类型、跨 repository 读取与排序契约）
- `Current Stage`：post-finalize → 进入 `hf-increment` → 即将转 `hf-specify`
- `Current Active Task`：`None（T46-T51 已 finalized）`
- `Pending Reviews And Gates`：`None`
- `Worktree Path`：`/workspace`（in-place；后续 `hf-test-driven-dev` 阶段按 router 决策再评估）
- `Worktree Branch`：`cursor/phase2-discovery-intelligence-v1-3dd4`

## 变更包

- New
  - 新 feature 模块 `web/src/features/recommendations/`：
    - `scoring.ts`：纯函数，输入 `seedProfile` / `seedWork` + 候选集合，输出按 `score` 倒序的 `RankedCandidate[]`。
    - `related-creators.ts` / `related-works.ts`：编排 repository 读取 + 调用 `scoring`，返回 `RelatedCreatorCard[]` / `RelatedWorkCard[]`。
    - `signals.ts`：城市、方向、分类等信号的归一化与权重定义。
    - `types.ts`：`RankedCandidate`、`RecommendationContext` 等。
  - 新 UI 注入点：
    - 创作者主页 `ProfileShowcasePage`：底部新增 `RelatedCreatorsSection`（最多 4 张卡）。
    - 作品详情页 `/works/[workId]`：评论区上方新增 `RelatedWorksSection`（最多 4 张卡）。
  - 新事件类型：`related_card_view`（离散事件，复用既有 `DiscoveryEventRepository`，沿用 `targetType=profile|work` 语义；由 `DiscoveryViewBeacon` 触发）。
  - 新 metrics：`recommendations.related_creators.cards_rendered`、`recommendations.related_works.cards_rendered`（counter，复用 §3.8 V1 已交付的 metrics 注册表）。
  - 新 feature flag：`RECOMMENDATIONS_RELATED_ENABLED`（env，默认 `true`；关闭时不渲染 section、不打事件、不计 metrics）。

- Modified
  - `web/src/features/showcase/profile-showcase-page.tsx`（或对应组件）：在原内容后挂 `RelatedCreatorsSection`。
  - `web/src/app/works/[workId]/page.tsx`：在评论区上方挂 `RelatedWorksSection`。
  - `web/src/features/community/types.ts`：扩展 `DiscoveryEventType` 增加 `"related_card_view"`，并补 unit 覆盖。
  - `web/src/config/env.ts`：新增 `RECOMMENDATIONS_RELATED_ENABLED` 字段。
  - `web/src/features/discovery/view-beacon.tsx`：允许 `eventType` 接收 `"related_card_view"`（类型放宽到 `DiscoveryEventType` 即可，无运行时变化）。

- Deprecated
  - 无（不替换任何已交付能力，纯新增）

## 影响矩阵

- 受影响工件
  - 新增 SRS：`docs/specs/2026-04-19-discovery-intelligence-v1-srs.md`（待创建）
  - 新增 Design：`docs/designs/2026-04-19-discovery-intelligence-v1-design.md`（待创建）
  - 新增 Tasks：`docs/tasks/2026-04-19-discovery-intelligence-v1-tasks.md`（待创建）
  - `web/src/features/recommendations/*`、`web/src/features/showcase/*`、`web/src/app/works/[workId]/page.tsx`
  - `web/src/features/community/types.ts`、`web/src/config/env.ts`、`web/src/features/discovery/view-beacon.tsx`
  - `task-progress.md`（活跃任务字段、Pending Reviews、Next Action）
  - `RELEASE_NOTES.md`（finalize 时追加 Discovery Intelligence V1 release section）
  - `docs/ROADMAP.md`（§3.6 完成后回写"V1 已交付"标记，finalize 阶段处理）
  - `README.md` 的功能完成度概览（finalize 阶段处理）

- 失效的批准状态：无（前置增量工件保持有效；本 increment 为新主题）
- 失效的任务 / `Current Active Task`：无（无在途任务）
- 失效的测试设计 / 验证证据 / review 结论：无
- 需重新派发的 reviewer / review 节点：本 increment 自身按 full profile 走 `hf-spec-review` → `hf-design-review` →（`hf-ui-design` 并行 → `hf-ui-review`）→ `hf-tasks-review` → 每任务的 `hf-bug-patterns/hf-test-review/hf-code-review/hf-traceability-review` → `hf-regression-gate` → `hf-completion-gate` → `hf-finalize`
- Profile 升级信号：无；保持 `full`

## 同步更新项

- 已更新工件
  - 创建本变更记录：`docs/reviews/increment-phase2-discovery-intelligence-v1.md`
  - 创建本地工作分支：`cursor/phase2-discovery-intelligence-v1-3dd4`

- 已回写内容
  - `task-progress.md`：将由 spec 起草时一并同步（避免与 spec 起草并发写）

- 明确不做的内容
  - 不引入向量检索 / pgvector / 任何 ML 推理
  - 不接入 §3.1 生产数据（仍走单实例 `node:sqlite`）
  - 不引入 A/B 实验框架（只埋事件，分析在后续 slice）
  - 不在首页 / 发现页 / 搜索页注入 Related 模块（首期仅创作者主页和作品详情页两处）
  - 不增加新外部 API（事件复用 `POST /api/discovery-events`）

## 待同步项

- 工件：`task-progress.md`
  - 原因：本步只产出 increment 记录；规格起草后将一并把 `Current Stage / Current Spec / Pending Reviews / Next Action` 同步
  - 建议动作：在 `hf-specify` 完成草稿后回写

- 工件：`RELEASE_NOTES.md`、`docs/ROADMAP.md` §3.6、`README.md`
  - 原因：finalize 阶段才会追加 release section / 标记 V1 / 更新概览
  - 建议动作：`hf-finalize` 时同步

## 状态回流

- `Current Stage`：`hf-specify`
- `Workflow Profile`：`full`
- `Current Active Task`：`pending reselection`（任务计划批准前不指派活跃任务）
- `Pending Reviews And Gates`：`hf-spec-review`、`hf-design-review`、`hf-ui-review`、`hf-tasks-review`
- `Next Action Or Recommended Skill`：`hf-specify`
