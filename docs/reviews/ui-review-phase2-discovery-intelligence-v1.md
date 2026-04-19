# UI Review — Phase 2 Discovery Intelligence V1

- 评审对象: `docs/designs/2026-04-19-discovery-intelligence-v1-design.md` §10（草稿）
- 关联规格（已批准）: `docs/specs/2026-04-19-discovery-intelligence-v1-srs.md`
- 关联增量记录: `docs/reviews/increment-phase2-discovery-intelligence-v1.md`
- Workflow Profile: `full`；Execution Mode: `auto`
- Reviewer 角色: `hf-ui-review`（subagent）
- Peer review: `hf-design-review`（独立返回，由父会话汇合）
- 评审日期: `2026-04-19`

## 结论

通过

## Precheck

- 已批准规格存在且声明了 UI surface（FR-001 / FR-002 / FR-005 明确「在创作者主页和作品详情页新增 section + 渲染候选卡 + 触发 view 事件」），UI surface 激活条件成立。
- UI 设计草稿存在且稳定可定位（`§10 UI 设计要点`），与 §9 模块设计中的组件实现示例一致。
- 本增量的设计文档将「UI 设计」与「架构 / 模块设计」合并在同一份文档中（§9 模块/§10 UI），peer 交接通过同文件内对齐而非跨文件 handoff，证据自洽。
- route / stage / profile 一致：`hf-ui-review` 由父会话作为 design stage 内并行 reviewer 派发，与 `hf-design-review` peer 同步执行。
- precheck 通过 → 进入正式 checklist 审查。

## 维度评分

| 维度 | 分数 | 摘要 |
|---|---|---|
| `U1` 需求覆盖与追溯 | 8/10 | 卡片字段与 FR-001 / FR-002 验收（hero / name / city / shootingFocus / 链接 / cover / title / ownerName / category）一一对应；空态与 flag-disabled 两态均落在 §10.2；§3 追溯表已显式写明 `FR-001 / FR-002 → related-*-section.tsx`。 |
| `U2` IA 与用户流完整性 | 8/10 | 注入位明确（`ProfileShowcasePage` 末尾、`/works/[workId]` 评论 section 之前）；卡片 → 链接 → 目标页路径清晰；不引入新导航或回退路径。 |
| `U3` 交互状态覆盖 | 8/10 | SSR 渲染无 loading 态（合规）；empty / soft-fail / flag-disabled 三态在 §10.2 + §9.4-9.5 + §8.3 错误降级图中均有明确处理；`disabled = no DOM` 与 `empty = section + 文案`严格区分（I-3 + ADR-4）。 |
| `U4` 视觉一致性与 Token 合规 | 9/10 | 完全沿用 `museum-panel--soft` / `museum-label` / `museum-card` / `text-[color:var(--muted-strong)]` 等 token 与 utility，未引入硬编码色值或新视觉风格；与作品详情页「创作者语境 section」视觉同构；不引入新组件。 |
| `U5` 可访问性（WCAG 2.2 AA） | 7/10 | heading 层级正确（页面 `<h1>` → `SectionHeading` `<h2>` → `EditorialCard titleTag="h3"`）；focus-visible 与 link 焦点链路继承既有 `globals.css` 中 `museum-card:focus-visible` 与 `:focus-visible ring` token；不引入新动效，自然兼容 reduced-motion；缺少：逐项 a11y 声明表（色彩对比 / focus / reduced-motion / 目标尺寸）— 但因复用既有壳层、未引入新视觉决策，不构成 critical。 |
| `U6` 响应式 / i18n / 性能 | 8/10 | 移动端断点 `1 → md:2 → xl:4` 显式落到 utility class；图片走 `EditorialCard` 默认 lazy（section 在首屏下方）；不引入额外 client runtime；i18n：沿用既有中文硬编码风格，与全站一致，规格未声明国际化要求。 |
| `U7` 决策质量与 trade-offs | 7/10 | §6.2 对 Beacon 复用 vs 新组件给出方案 X / Y 对比；但 §10 视觉决策本身未列「替代方向」（如水平 carousel / inline strip / 不同卡片密度）。考虑到本增量明确以「沿用既有 editorial-dark 壳层、不引入新视觉系统」为前提（CON-003），候选方向受到约束，缺失程度为 minor。 |
| `U8` 任务规划准备度与 peer 交接 | 9/10 | §9.6 / §9.7 已给出 section 组件的完整 TSX 骨架（含容器、SectionHeading、grid、卡片配置、Beacon 配置）；§10 + §11 不变量足以指导 `hf-tasks` 拆解任务；与 `hf-design`（同文件 §1-§9）的 peer 依赖通过共享类型 / config / metrics 显式对齐，无含糊条目。 |

任一维度 `< 6/10` → 否（最低 7/10）。U5 / U7 不构成阻塞，仅产生 `minor` findings。

## 发现项

- `[minor][LLM-FIXABLE][U5][AU5]` §10.3 a11y 描述偏简略：未按 `references/a11y-checklist.md` 列出逐项落地表（色彩对比 / focus-visible / reduced-motion / 目标大小 / 链接自说明）。虽然本增量复用既有 `museum-card:focus-visible` 与全局 token，未引入新视觉决策，但建议在 §10.3 增补一段「a11y 继承声明」，明确：(a) 所有色值继承 `globals.css` 已通过对比度审查的 token；(b) `EditorialCard` 链接焦点环复用 `museum-card:focus-visible` `box-shadow: 0 0 0 4px rgba(171,141,99,0.12)`；(c) 不新增 motion token，自然满足 `prefers-reduced-motion`；(d) 卡片整张可点击，目标尺寸 ≫ 24×24。这样下游 `hf-test-driven-dev` 在测试 a11y 时有可断言锚点。
- `[minor][LLM-FIXABLE][U3]` §10.2 描述了 empty 文案，但未说明 `kind: "empty"` 的两个 `reason`（`no-candidates` vs `soft-fail`）在 UI 层是否完全一致渲染。从 §9.4 可推断为「同一段稳定空态文案」，且在 §A-002 / NFR-002 隐私语境下这是有意为之，但建议 §10.2 显式补一句「soft-fail 与 no-candidates 在 UI 层共用同一空态文案，不向访客暴露失败信号」，避免实现期被误读为「需要不同文案」。
- `[minor][LLM-FIXABLE][U7][AU9]` §10 未列出视觉/交互方向候选矩阵（如「2x2 grid vs 横向 carousel vs inline list」）。CON-003 已限定不改 shell 组件契约，候选确实有限；但建议至少一句话说明「由于复用既有 editorial card grid 模式（与首页发现 / 作品 section 同构），未单独评估替代视觉范式」，让冷读者直接理解约束来源。
- `[minor][LLM-FIXABLE][U1]` §10.1 仅举创作者卡片字段示例，未对称展示作品卡片字段配置（`title=work.title`、`summary=ownerName・category`、`titleTag="h3"`、`assetRef=card.coverAsset`）。§9.7 写「类似 9.6」，§3 追溯表也指向 FR-002，但 UI 节内显式补一对作品卡片配置示例，可减少 `hf-tasks` 与实现期歧义。

无 `critical` / `important` 级 finding。

## 薄弱或缺失的 UI 设计点

- a11y 落地表缺逐项声明（U5 见上）。
- 视觉方向候选对比缺一句"约束说明"（U7 见上）。
- 作品 section 卡片字段示例缺对称展示（U1 见上）。
- 卡片 hover / focus 视觉行为依赖既有 `museum-card` CSS（已在 `globals.css` §museum-card hover/focus），不构成缺口，但 §10 未明确点名引用，可在 a11y 表中一并提及。

## 与 hf-design 的 peer 交接一致性

本增量的设计将 `hf-design`（§1-§9 架构 / 模块）与 `hf-ui-design`（§10 UI 要点）合并到同一份文档中，peer 交接通过同文件锚点完成；以下条目**已对齐**：

- 已对齐：
  - **Feature flag 单点闭合**（ADR-4 / I-3）：编排层 `getRelatedCreators` 在 disabled 时返回 `null`，section 组件 `if (!result) return null` 一处闭合 → §10.2 显式区分 `flag disabled = DOM 无 section` vs `empty = section + 文案`。
  - **EditorialCard 复用 + titleTag="h3"**：与 §9.6 模块 TSX 的 `titleTag="h3"` 一致，与 SectionHeading `<h2>` 形成正确 heading 层级。
  - **SSR 边界与 Beacon**：§9.6 中 `<DiscoveryViewBeacon>` 与每张 card 配对渲染（surface=`related_creators_section` / `related_works_section`），与 SRS §8.3 不变量、I-9 一致；客户端 useEffect 触发 sendBeacon 链路与既有 `view-beacon.tsx` 完全复用，仅放宽 `eventType` 类型（D-8）。
  - **Capability injection**：section 组件不接受 `bundle` 透传（I-10），从 `getDefaultCommunityRepositoryBundle()` 取实例 → UI 边界与 SSR 安全边界对齐。
  - **空态文案**：「暂无更多相关创作者」/「暂无更多相关作品」与 SRS §FR-001 / §FR-002「稳定空态文案」要求一致。

- 不一致：无。

- 本文档已锁、可供 peer 依赖：
  - section 容器 className：`museum-panel museum-panel--soft p-6 md:p-8`
  - 卡片 grid：`grid gap-5 md:grid-cols-2 xl:grid-cols-4`
  - Section 复制（中文）：「相关创作者 → 也看看这些创作者」/「相关作品 → 也看看这些作品」
  - Beacon `surface` 字符串：`related_creators_section` / `related_works_section`（hardcode，不从 props 透传）
  - `EditorialCard` 配置：`visualVariant="card"`、`titleTag="h3"`、`summary` 形如 `"上海・人像"`

## 与规格的追溯（采样）

| Spec 项 | UI 设计承接位置 | 评价 |
|---|---|---|
| FR-001 acc#6（卡片含头像 / name / city / focus / 链接） | §10.1 + §9.6 EditorialCard 配置 | ✓ 字段一一对应 |
| FR-002 acc#6（卡片含 cover / title / ownerName / category / 链接） | §10.1 + §9.7 引用「类似 9.6」 | ✓（建议 §10 显式列出） |
| FR-001 acc#5 / FR-002 acc#5（仅 1 项时稳定空态） | §10.2 | ✓ 文案+容器保留 |
| FR-004 acc#2（disabled DOM 无 section） | §10.2 + ADR-4 + §9.4 | ✓ 与 empty 严格区分 |
| FR-005 acc#1-#2（每卡 1 beacon 含 surface） | §9.6 / §9.7 + I-9 | ✓ surface 硬编码 |
| FR-008 acc#3（候选池只读一次） | §9.4 / §9.5 + I-5 | ✓ Map 索引避免 N×repo |
| FR-008 acc#4（异常安全降级） | §8.3 + §9.4 / §9.5 + I-8 | ✓ catch + warn + counter + 空态 |
| NFR-002 隐私（不暴露 score） | §10.3 + §A-003 | ✓ |
| SEO（SSR rendered） | §10.5 + §8.2 sequence | ✓ section 为 async server component，HTML 中含卡片 |

## 反模式扫描（`AU1-AU10`）

- `AU1` Happy Path Only：未触发（empty / soft-fail / disabled 三态俱在）。
- `AU2` 无根据视觉宣言：未触发（不写「现代 / 简洁」，全部走 token）。
- `AU3` 硬编码样式：未触发（无 hex / 无 px 数字）。
- `AU4` 默认 AI 审美：未触发（沿用 editorial-dark / 米白色调既有壳层，非通用 dashboard 模板）。
- `AU5` a11y 口号化：轻度触发，已记 `[minor][U5]`。
- `AU6` 跨权决策：未触发（§10 不写 API 契约）。
- `AU7` 组件名即设计：未触发（§9.6 / §9.7 给出完整 TSX 骨架）。
- `AU8` 状态转换无设计：未触发（无 motion 引入；状态转换为 SSR 边界，无 CSR 过渡）。
- `AU9` 未比较的「推荐方案」：轻度触发于视觉方向，已记 `[minor][U7]`。
- `AU10` peer 交接含糊：未触发（同文件内引用具体节号 / 类型 / 常量）。

## 下一步

- `通过` → `设计真人确认`（`needs_human_confirmation=true`，由父会话等待 `hf-design-review` 也通过后发起联合 approval）。
- 4 条 `minor` 发现项**不阻塞** approval；可在 design 进入 approval 时由作者一并合并到 §10 修订（U5 a11y 落地表、U3 双 reason 共用文案声明、U7 视觉方向约束说明、U1 作品卡片字段示例对称展示）。也可以保留至 `hf-tasks` 阶段处理，不影响任务拆解准备度。
- 若 `hf-design-review` 同时通过 → 父会话发起联合 `设计真人确认` → 进入 `hf-tasks`。
- 若 `hf-design-review` 返回 `需修改` / `阻塞` → 本 UI 评审 verdict 不解锁 approval，但 UI 部分稳定，可同步推进。

## 记录位置

- `docs/reviews/ui-review-phase2-discovery-intelligence-v1.md`

## 交接说明

- 本 reviewer 不写入 approval；联合 approval 由父会话在两条 review 都通过后发起。
- 本 reviewer 不修改设计 / 规格 / 代码。
- 4 条 `minor` 修订建议均为 `LLM-FIXABLE`，无需用户裁决。
