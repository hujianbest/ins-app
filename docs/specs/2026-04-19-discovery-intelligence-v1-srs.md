# Phase 2 — Discovery Intelligence V1 需求规格说明

- 状态: 已批准
- 批准记录: `docs/verification/spec-approval-phase2-discovery-intelligence-v1.md`
- 主题: Phase 2 — Discovery Intelligence V1（发现智能化第一阶段：规则化 Related Creators / Related Works）
- 输入来源: `docs/ROADMAP.md` §3.6；`docs/reviews/increment-phase2-discovery-intelligence-v1.md`
- Execution Mode 偏好: `auto`

## 1. 背景与问题陈述

Lens Archive 已经在 `2026-04-10` 完成 `Hybrid Platform Relaunch` 阶段 1 与 `Lens Archive Discovery Quality` 增量，并在 `2026-04-19` 完成 `Phase 2 — Observability & Ops V1`。当前主线已经在创作者主页、作品详情页、搜索页、首页发现分区上稳定承载「高匹配发现」叙事，但仍有一类清晰且阻塞性的发现短板：

- 当用户进入一名摄影师 / 模特公开主页后，只能看到该创作者**自己**的作品和资料；下一个相关创作者必须靠「回到首页 / 发现页 / 搜索」重新挑选，承接链路是断的。
- 当用户进入一篇作品详情页后，看完封面、说明、评论之后，下一个动作只能是「私信」「关注创作者主页」「外链跳转」三选一；没有任何「类似的作品」承接，使得对应"高匹配发现"叙事的关键证据缺失。
- 已采集的 `discovery_events`（`work_view` / `profile_view` / `follow` / `contact_start` / `external_handoff_click`）尚没有被任何模块消费，无法支撑 ROADMAP §3.6 的「相关推荐 vs 基线」量化对比。

本增量要解决的，不是引入完整推荐系统、向量检索或 ML 排序，而是**用已经存在的字段（`city`、`shootingFocus`、`category`、`ownerProfileId`）以纯规则、纯函数的方式，把"相关创作者"和"相关作品"两块最小可承接模块挂到创作者主页与作品详情页**，并通过新的 `related_card_view` 事件 + `recommendations.*` metrics，为后续 §3.6 的离线分析与 A/B 评估打下证据采集基线。

## 2. 目标与成功标准

### 2.1 总体目标

- 让访问任意创作者公开主页的用户，能在不离开当前页面的前提下，看到 1–4 张「与该创作者高匹配」的其他创作者卡片，并能直接跳转。
- 让访问任意作品详情页的用户，能在评论区上方看到 1–4 张「与该作品高匹配」的其他作品卡片，并能直接跳转。
- 让平台在不引入向量检索 / ML 的前提下，把「相关性打分」的规则口径与权重显式化、可单元测试、可灰度关闭。
- 让推荐模块产生的曝光与跳转事件可被 `discovery_events` 记录，且关键模块产生的 metrics 可被 `/api/metrics` 消费，从而为后续 §3.6 的智能化升级提供可对比的基线证据。

### 2.2 成功标准

- 对任意一名公开摄影师 / 模特：进入其公开主页后，应至少看到 1 张候选「相关创作者」卡片（除非系统中只有 1 名同角色公开创作者，此时呈现稳定空态），最多 4 张；这些候选必须与当前创作者**角色相同**，按规则化打分倒序，且不重复出现该创作者本人。
- 对任意一篇已发布作品：进入其详情页后，应至少看到 1 张候选「相关作品」卡片（除非系统中只有 1 篇已发布作品，此时呈现稳定空态），最多 4 张；候选必须为已发布作品，按规则化打分倒序，且不重复出现该作品本身。
- 关闭 feature flag (`RECOMMENDATIONS_RELATED_ENABLED=false`) 后，两个 section 在 SSR 层面**不渲染**（DOM 中既不出现 section 容器，也不打事件、不计 metrics），且其余页面行为零回归。
- 在 flag 打开的默认状态下，每次卡片渲染都应记录一条 `related_card_view` 事件到 `discovery_events`（按 surface 区分），并使 `recommendations.related_creators.cards_rendered` / `recommendations.related_works.cards_rendered` counter 递增对应张数。
- 当前主线的所有公开页 / studio / 搜索 / 关注 / 评论 / 联系 / 外链跳转 / 健康检查 / metrics 行为**不发生回归**：单元 / 组件 / 端到端测试在本增量结束时全部继续通过。
- 性能：在创作者主页与作品详情页的 SSR 中加入推荐模块后，单页 P95 服务端渲染时延增加不超过 **30ms**（基于本地 vitest 性能 micro-benchmark + `OBSERVABILITY_*` metrics 抽样）。

## 3. 用户角色与关键场景

### 3.1 主要角色

- 公开访客（未登录）：在创作者主页 / 作品详情页浏览时，期望"还有谁 / 还有什么作品"的承接。
- 已登录创作者 / 模特：除了浏览还可能直接关注 / 收藏新发现的相关创作者，或对相关作品点赞。
- 平台运营开发者：上线后通过 `/api/metrics` 与 `discovery_events` 表确认推荐模块生效与覆盖度。

### 3.2 次要角色

- 数据持有者：未来在 §3.6 后续 slice 接入离线分析时，依赖本增量产出的事件与 metrics 作为基线对照。

### 3.3 关键场景

- 一名访客打开摄影师 A 的公开主页，看完作品后页面底部出现 3 张「相关摄影师」卡片，按城市 + 方向相似度排序；点击其中一张直接进入对应公开主页，过程中无任何 404 / 状态错乱。
- 一名访客打开模特 B 的公开主页，由于系统中只有 1 名公开模特，相关创作者区域呈现稳定空态文案（不报错、不显示空 grid）。
- 一名访客打开作品 W 的详情页，评论区上方出现 4 张「相关作品」卡片，按同 owner / 同 category / 同 owner 城市的复合规则排序；点击其中一张直接进入作品详情页。
- 平台运营开发者把 `RECOMMENDATIONS_RELATED_ENABLED` 设为 `false` 后，所有创作者主页与作品详情页都不再渲染推荐 section，也不再产生新的 `related_card_view` 事件 / `recommendations.*` 指标递增，但其余功能照常工作。
- 调用 `GET /api/metrics`（带 token）后，可以在 `business` 命名空间下读取到 `recommendations.related_creators.cards_rendered`、`recommendations.related_works.cards_rendered`、`recommendations.related_creators.empty`、`recommendations.related_works.empty` 四个 counter。

## 4. 当前轮范围与关键边界

本轮**只做**以下能力：

- 新 feature 模块 `web/src/features/recommendations/`，包含纯函数打分、上下文构造、卡片渲染。
- 在创作者公开主页（`/photographers/[slug]`、`/models/[slug]`）底部新增 `RelatedCreatorsSection`（同角色，最多 4 张）。
- 在作品详情页（`/works/[workId]`）评论区上方新增 `RelatedWorksSection`（最多 4 张）。
- 新事件类型 `related_card_view`（复用 `DiscoveryEventRepository`）。
- 新 metrics：4 个 counter（`recommendations.related_creators.cards_rendered`、`.empty`、`recommendations.related_works.cards_rendered`、`.empty`）。
- 新 env 字段 `RECOMMENDATIONS_RELATED_ENABLED`（默认 `true`）。

## 5. 范围外内容

明确**不在**本增量做：

- 不引入向量检索 / pgvector / 任何 ML 推理 / 任何外部检索服务。
- 不在首页 / 发现页 / 搜索结果页注入 Related 模块（首期仅创作者主页和作品详情页两处）。
- 不引入"基于用户历史 `discovery_events` 的个性化推荐"——本增量是「内容相似性」推荐，不是个性化推荐。
- 不引入跨角色推荐（摄影师主页只推摄影师，模特主页只推模特；作品只推已发布作品）。
- 不引入 A/B 实验框架与流量分桶（关闭推荐只能整站二选一，没有按用户分桶）。
- 不引入 `dwell time`、`scroll depth` 等新事件字段；只新增一个 `related_card_view` 事件类型。
- 不引入新外部 API；事件复用 `POST /api/discovery-events`；指标复用 `/api/metrics`。
- 不引入 UI 上的"为什么推荐"解释面（仅在 a11y 层面给可读的 `aria-label` / 卡片副标题，不展示 score 数字、不展示规则名）。

## 6. 功能需求

### FR-001 Related Creators 模块（创作者主页）
#### 需求说明
系统应在 `/photographers/[slug]`、`/models/[slug]` 公开主页底部新增 `RelatedCreatorsSection`：在 SSR 层基于当前 profile 与所有同角色公开 profile 的字段（`city`、`shootingFocus`、`discoveryContext`、`tagline`），用规则化打分函数挑出最多 4 张候选创作者卡片；候选不包含当前创作者本人。

#### 验收标准
- Given 系统中存在至少 2 名同角色公开创作者，When 访问当前创作者公开主页，Then 主页底部出现 `RelatedCreatorsSection`，至少包含 1 张候选卡片，最多 4 张。
- Given 当前创作者本人，When 渲染推荐区，Then 候选列表中不包含当前 `(role, slug)` 自身。
- Given 候选与当前创作者**同城且同 shootingFocus**，When 排序，Then 该候选 `score` 应严格高于「同城 / 不同方向」「不同城 / 同方向」与「都不同」三类候选。
- Given 候选与当前创作者**完全不同 city / shootingFocus**，When 排序，Then 仍允许出现在结果中（兜底显示），但 `score` 应严格小于上述三类有公共字段的候选。
- Given 系统中仅存在 1 名同角色公开创作者（即当前创作者本人），When 渲染推荐区，Then `RelatedCreatorsSection` 仍然出现，但显示稳定空态文案（如"暂无更多相关创作者"），不报错、不渲染空卡片网格。
- Given 候选卡片，When 渲染，Then 每张卡片至少包含创作者头像 / 视觉、name、city、shootingFocus、跳转链接（指向其公开主页）。

#### Priority
Must

#### Source / Trace Anchor
ROADMAP §3.6「『相关创作者』『相关作品』模块灰度上线」；增量记录 §变更包/New。

---

### FR-002 Related Works 模块（作品详情页）
#### 需求说明
系统应在 `/works/[workId]` 评论区**上方**新增 `RelatedWorksSection`：在 SSR 层基于当前 work 的 `ownerProfileId`、`category` 与 owner profile 的 `city` / `shootingFocus`，从所有已发布作品中挑出最多 4 张候选作品卡片；候选不包含当前作品本身。

#### 验收标准
- Given 系统中存在至少 2 篇已发布作品，When 访问当前作品详情页，Then 评论区上方出现 `RelatedWorksSection`，至少包含 1 张候选卡片，最多 4 张。
- Given 当前作品本身，When 渲染推荐区，Then 候选列表中不包含当前 `workId` 自身。
- Given 候选作品与当前作品**同 owner**（同 `ownerProfileId`），When 排序，Then 该候选 `score` 应严格高于「同 owner 城市 / 不同 owner」「同 category / 不同 owner / 不同 owner 城市」与「都不同」三类候选。
- Given 候选作品仍处于 `draft` 状态，When 抓取候选集合，Then 该作品不应进入候选池（草稿安全沿用 §3 阶段 1 的规则）。
- Given 系统中仅存在 1 篇已发布作品（即当前作品本身），When 渲染推荐区，Then `RelatedWorksSection` 仍然出现，但显示稳定空态文案（如"暂无更多相关作品"），不报错、不渲染空卡片网格。
- Given 候选卡片，When 渲染，Then 每张卡片至少包含 cover 视觉、title、ownerName、category、跳转链接（指向 `/works/[candidateId]`）。

#### Priority
Must

#### Source / Trace Anchor
ROADMAP §3.6「『相关作品』模块灰度上线」；增量记录 §变更包/New。

---

### FR-003 规则化打分函数
#### 需求说明
系统应提供一个**纯函数** `scoreCandidate(seed, candidate, weights)`，输入 seed（profile 或 work 的归一化信号）与候选项（同型）+ 权重表，输出 `{ score: number, breakdown: Record<string, number> }`；该函数不依赖 IO、不依赖请求上下文，可被单元测试穷尽。

#### 验收标准
- Given 任意 seed / candidate，When 调用 `scoreCandidate`，Then 返回值 `score` 应满足 `0 <= score <= 1`。
- Given 同一对 seed / candidate / weights，When 多次调用 `scoreCandidate`，Then 应返回完全一致的 `score` 与 `breakdown`（确定性 / 幂等）。
- Given 一对 candidate A、B，A 命中所有权重信号，B 不命中任一信号，When 比较二者 `score`，Then `score(A) > score(B)` 严格成立。
- Given 候选与 seed 完全相同（同一 `targetKey`），When 调用 `scoreCandidate`，Then 该 candidate 必须在上层链路中被显式过滤（即"不与自身比较"是上层职责，但函数本身不应抛错）。
- Given 任一信号字段缺省（如 `city=""`），When 调用 `scoreCandidate`，Then 该信号贡献为 0 而非 `NaN`，且整体 `score` 不会因为缺省字段而崩溃。
- Given 权重表中某项设为 0，When 调用 `scoreCandidate`，Then 该信号对 `score` 的贡献也必须为 0。

#### Priority
Must

#### Source / Trace Anchor
ROADMAP §3.6「相关推荐模块在不损害『高匹配』叙事的前提下，可量化提升下游承接动作」；增量记录 §变更包/New。

---

### FR-004 Feature Flag 与零回归保证
#### 需求说明
系统应在 `web/src/config/env.ts` 中新增 `RECOMMENDATIONS_RELATED_ENABLED` 字段（默认 `true`）；当其为 `false` 时，两个 section 在 SSR 层面不渲染，下游事件 / metrics 也不应被触发。

#### 验收标准
- Given `RECOMMENDATIONS_RELATED_ENABLED` 未设置，When 系统启动，Then 默认值生效为 `true`。
- Given `RECOMMENDATIONS_RELATED_ENABLED=false`，When 渲染创作者公开主页 / 作品详情页，Then DOM 中不应出现 `RelatedCreatorsSection` / `RelatedWorksSection` 容器（既不渲染容器、也不渲染空态文案）。
- Given `RECOMMENDATIONS_RELATED_ENABLED=false`，When 渲染上述页面，Then 不应触发 `related_card_view` 事件入库，也不应使任何 `recommendations.*` counter 递增。
- Given `RECOMMENDATIONS_RELATED_ENABLED` 设为非法字符串（如 `RECOMMENDATIONS_RELATED_ENABLED=maybe`），When 系统启动，Then 应回退到 `true` 并产生一条 `warn` 级别启动日志说明降级原因（不阻塞启动）。
- Given flag 在两种状态来回切换，When 重启进程，Then 行为应严格只取决于当前进程读取到的 env 值，不残留前一进程状态。

#### Priority
Must

#### Source / Trace Anchor
ROADMAP §3.6「灰度上线」；ROADMAP §3.8 V1 已交付的 env 契约风格沿用；增量记录 §变更包/New。

---

### FR-005 `related_card_view` 事件类型扩展
#### 需求说明
系统应在 `DiscoveryEventType` 类型联合中新增 `"related_card_view"`，并在 `RelatedCreatorsSection` / `RelatedWorksSection` 渲染候选卡片时，由现有的 `DiscoveryViewBeacon` 入口产生对应事件；事件 schema 复用既有 `DiscoveryEventRecord` 字段。

#### 验收标准
- Given `RECOMMENDATIONS_RELATED_ENABLED=true`，When 一次创作者主页 SSR 渲染了 N 张相关创作者卡片，Then 后续浏览器水合时应至少触发 N 条 `related_card_view` 事件入库，每条 `targetType=profile`、`targetId=<creator profile id>`、`surface=related_creators_section`、`success=true`。
- Given `RECOMMENDATIONS_RELATED_ENABLED=true`，When 一次作品详情页 SSR 渲染了 N 张相关作品卡片，Then 后续浏览器水合时应至少触发 N 条 `related_card_view` 事件入库，每条 `targetType=work`、`targetId=<work id>`、`surface=related_works_section`、`success=true`。
- Given 一条 `related_card_view` 事件，When 通过 `DiscoveryEventRepository.listAll()` 读取，Then 该记录与既有事件一同返回，且不破坏旧事件类型的解析。
- Given 用户在卡片上**实际点击**跳转，When 跳转目标渲染，Then 跳转目标页（创作者主页 / 作品详情页）的现有 `profile_view` / `work_view` 事件按现有规则产生（推荐模块不重复打 view 事件）。
- Given 类型扩展，When 既有所有依赖 `DiscoveryEventType` 的代码（如 `view-beacon.tsx`、`events.ts`）被重新编译，Then 应在 TypeScript 类型层显式覆盖新值（穷尽式 switch / 联合判定），不应只是非穷尽兜底。

#### Priority
Must

#### Source / Trace Anchor
ROADMAP §3.6「Discovery 事件扩展（dwell time、scroll depth）需在隐私评估后再补」（本增量只新增 `related_card_view` 一类，不引入隐私敏感字段）；增量记录 §变更包/New。

---

### FR-006 `recommendations.*` Metrics
#### 需求说明
系统应在 §3.8 V1 的 `MetricsRegistry` 中预注册以下 4 个 counter，并由推荐模块在 SSR 渲染完成时同步递增；这些指标随 `/api/metrics` 输出。

预注册集合：

- `recommendations.related_creators.cards_rendered`
- `recommendations.related_creators.empty`
- `recommendations.related_works.cards_rendered`
- `recommendations.related_works.empty`

#### 验收标准
- Given `OBSERVABILITY_METRICS_ENABLED=true` + 正确 token，When 请求 `/api/metrics`，Then 响应 JSON 中 `business`（或 §3.8 设计选定的命名空间）下应至少包含上述 4 个 counter，初始值为 0。
- Given `RECOMMENDATIONS_RELATED_ENABLED=true`，When 一次创作者主页 SSR 渲染并选出 N 张相关创作者卡片（N≥1），Then `recommendations.related_creators.cards_rendered` counter 应增加 N，`recommendations.related_creators.empty` 不变。
- Given `RECOMMENDATIONS_RELATED_ENABLED=true`，When 一次创作者主页 SSR 渲染但候选集合为空（即 FR-001 的稳定空态分支），Then `recommendations.related_creators.empty` counter 应增加 1，`cards_rendered` 不变。
- Given `RECOMMENDATIONS_RELATED_ENABLED=false`，When 任意页面 SSR，Then 上述 4 个 counter 均**不应**变化。
- Given Related Works 渲染分支，When 触发 cards_rendered 与 empty 路径，Then 对 `recommendations.related_works.*` 两个 counter 满足同样规则。

#### Priority
Must

#### Source / Trace Anchor
ROADMAP §3.6「可量化提升下游承接动作」；ROADMAP §3.8 V1 已交付的 metrics 注册表；增量记录 §变更包/New。

---

### FR-007 候选集合上限与稳定排序
#### 需求说明
推荐模块在 SSR 层每次最多挑出 **4 张**候选；候选 `score` 相同时应使用稳定 tie-breaker（建议：`updatedAt` desc，再 `targetKey` asc），避免同一对 seed / 候选集出现不一致顺序。

#### 验收标准
- Given 候选池中存在 ≥4 个候选，When SSR 渲染，Then 渲染卡片数严格等于 4（不多不少）。
- Given 候选池中存在 N 个候选（1 ≤ N ≤ 3），When SSR 渲染，Then 渲染卡片数严格等于 N。
- Given 候选池中存在 0 个候选（即 FR-001 / FR-002 描述的"系统中只有当前自身一项"分支），When SSR 渲染，Then 进入稳定空态分支。
- Given 同一组 seed + 候选池 + weights，When 多次 SSR 渲染，Then 候选顺序必须完全一致（确定性）。
- Given 两个候选 `score` 相同，When 排序，Then tie-breaker 应严格为：`updatedAt` 倒序优先，再 `targetKey` 升序兜底（无论 `targetKey` 命名规则）。

#### Priority
Must

#### Source / Trace Anchor
ROADMAP §3.6「灰度上线」隐含的稳定性诉求；增量记录 §变更包/New。

---

### FR-008 SSR 性能预算
#### 需求说明
推荐模块的 SSR 处理应在受控时延内完成；不允许把候选池抓取与排序变成 O(N²) 的读放大。

#### 验收标准
- Given 创作者主页 SSR，When 推荐模块跑完，Then 推荐模块自身的服务端处理时延应 ≤ **30ms**（基于 vitest 内 micro-benchmark；模拟同角色 100 名公开创作者的池子）。
- Given 作品详情页 SSR，When 推荐模块跑完，Then 推荐模块自身的服务端处理时延应 ≤ **30ms**（基于 vitest 内 micro-benchmark；模拟 200 篇已发布作品的池子）。
- Given 推荐模块运行，When repository 读取，Then 同一次 SSR 请求中候选池只能被读取**一次**（即不能对每个候选重新读 owner profile）。
- Given 推荐模块运行，When 出现任何 repository 异常，Then 推荐模块应安全降级到「不渲染、不打事件、不计 metrics」（不让推荐模块的失败导致整页 500）。

#### Priority
Must

#### Source / Trace Anchor
ROADMAP §3.6「不损害『高匹配』叙事的前提下」；增量记录 §变更包/New。

---

## 7. 非功能需求

### NFR-001 性能
- 创作者主页 / 作品详情页加入推荐模块后，SSR P95 增加 ≤ 30ms（FR-008）。
- 推荐模块本身 micro-benchmark 在 100 名 / 200 篇候选池上 P95 ≤ 30ms。

### NFR-002 安全 / 隐私
- 推荐模块**不**消费 `discovery_events` 中的用户行为字段（不做个性化推荐）；只读公开字段（`CreatorProfileRecord`、`CommunityWorkRecord`）。
- `related_card_view` 事件的 `actorAccountId` 复用 `DiscoveryViewBeacon` 既有口径（未登录时为 `null`），不新增任何 PII。

### NFR-003 可观测性
- 推荐模块产生的 server log 至少包含 `event=recommendations.section.rendered`，字段：`traceId`、`module=recommendations`、`section`、`seedKey`、`candidateCount`、`durationMs`。
- 推荐模块异常时记录 `event=recommendations.section.failed` 的 warn 级别日志，并安全降级（FR-008）。

### NFR-004 可测试性
- `scoring.ts` 必须为纯函数，可被 vitest 直接覆盖到 `score` / `breakdown` 字段断言。
- `related-creators.ts` / `related-works.ts` 必须支持显式注入 `CommunityRepositoryBundle` 与 `MetricsRegistry`，以便 vitest 单元覆盖不依赖默认 sqlite。

### NFR-005 兼容性
- 推荐模块**不修改**任何已交付的 server action / route handler 行为，只新增独立模块与新 UI 注入位。
- env 字段缺省时全行为与当前主线一致（默认开启，但旧候选池为 0 时呈现稳定空态）。

## 8. 数据契约

### 8.1 新增类型

```ts
type RecommendationSection = "related_creators" | "related_works";

type RankedCandidate<T> = {
  candidate: T;
  score: number;
  breakdown: Record<string, number>;
};

type RecommendationContext = {
  surface: RecommendationSection;
  flagEnabled: boolean;
};
```

### 8.2 类型扩展

- `DiscoveryEventType`：新增 `"related_card_view"`。
- `EnvConfig`（`web/src/config/env.ts`）：新增 `RECOMMENDATIONS_RELATED_ENABLED: boolean`。

### 8.3 不变量

- `targetType`：`related_creators` 总是 `profile`；`related_works` 总是 `work`。
- `surface`：`related_creators_section` 与 `related_works_section`，对外字符串不允许漂移。
- 信号权重不变量（用于固化"同城 vs 同方向"的相对大小，避免实现层漂移）：
  - `related_creators` 权重表必须满足 `weight(city) >= weight(shootingFocus) > 0`；即「同城」对相似度的贡献不小于「同方向」。
  - `related_works` 权重表必须满足 `weight(sameOwner) > weight(ownerCity) >= weight(category) > 0`；即「同 owner」对相似度的贡献严格大于「同 owner 城市」与「同 category」。

## 9. 约束

- CON-001：仅使用现有 repository 层；不能新建 SQL 表 / schema 迁移（避免与 §3.1 冲突）。
- CON-002：仅引入纯 TypeScript 实现；不引入 `pgvector`、`faiss`、`onnxruntime`、`tensorflow.js` 等任何 ML 运行时。
- CON-003：UI 改动仅限两处注入位；不改动 `SiteHeader` / `SiteFooter` / `PageHero` / `SectionHeading` 等 shell 组件契约。
- CON-004：事件复用 `POST /api/discovery-events`；不新建 API 路由。
- CON-005：metrics 复用 §3.8 V1 的 `MetricsRegistry` 抽象；不引入新 metrics 库。

## 10. 假设 / 待澄清

- A-001：当前 `node:sqlite` 候选池规模（< 1000 名 profile + < 5000 篇 works）下，全候选 in-memory 排序是可接受的；后续上量后再评估懒加载或预聚合。
- A-002：`related_card_view` 事件的 `success` 始终为 `true`（卡片渲染本身不会"失败"）；后续 §3.6 增量再决定是否引入 `success=false` 的语义（如点击后跳转 404 等）。
- A-003：本增量不展示"为什么推荐"的解释；`breakdown` 字段仅供单元测试与未来调参，不暴露给 UI / 事件 / metrics。

## 11. 影响 / 出口工件

- 新增：`web/src/features/recommendations/{scoring,signals,related-creators,related-works,types,index}.ts` + 单测。
- 修改：`web/src/features/showcase/profile-showcase-page.tsx`、`web/src/app/works/[workId]/page.tsx`。
- 修改：`web/src/features/community/types.ts`（`DiscoveryEventType` 扩展）、`web/src/config/env.ts`（flag）、`web/src/features/discovery/view-beacon.tsx`（类型放宽，零运行时变化）。
- 复用：`web/src/features/observability/metrics.ts`（注册新 counter）。
- finalize 阶段同步：`task-progress.md`、`RELEASE_NOTES.md`、`docs/ROADMAP.md` §3.6、`README.md`。

## 12. Trace Anchor 索引

| FR | ROADMAP / 增量记录锚点 |
|----|---|
| FR-001 | §3.6「相关创作者模块」；增量 §变更包/New |
| FR-002 | §3.6「相关作品模块」；增量 §变更包/New |
| FR-003 | §3.6「可量化提升下游承接动作」；增量 §变更包/New |
| FR-004 | §3.6「灰度上线」；§3.8 env 契约风格 |
| FR-005 | §3.6「Discovery 事件扩展」；增量 §变更包/New |
| FR-006 | §3.6「可量化」；§3.8 metrics 注册表 |
| FR-007 | §3.6「灰度上线」隐含稳定性 |
| FR-008 | §3.6「不损害『高匹配』叙事的前提下」 |
