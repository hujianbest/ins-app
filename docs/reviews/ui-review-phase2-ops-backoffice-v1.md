# UI Review — Phase 2 Ops Back Office V1

- 评审对象：`docs/designs/2026-04-19-ops-backoffice-v1-design.md`（DRAFT，§10 UI Design + §15 风险 + §16 ADR）
- 已批准规格：`docs/specs/2026-04-19-ops-backoffice-v1-srs.md`
- 关联增量：`docs/reviews/increment-phase2-ops-backoffice-v1.md`
- Workflow Profile：`full`；Execution Mode：`auto`
- Reviewer：`hf-ui-review` subagent（与 `hf-design-review` 为 peer，并行）
- 评审依据：`hf-ui-review` SKILL + `references/ui-review-checklist.md` + `hf-ui-design/references/{a11y-checklist,interaction-state-inventory}.md`

## Precheck

- ✅ UI 设计草稿可定位（`§10` 集中描述 admin shell 五个页面 + 状态标签 + a11y/SEO + 错误反馈 + 移动端）
- ✅ 已批准规格含 UI surface 声明（FR-002 / FR-003 / FR-004 / FR-005 显式列出 `/studio/admin/**` 与 `/studio` 入口卡）
- ✅ `hf-design` 草稿同体（§9 模块设计 + §11 不变量），可供 peer 比对，未发现规格漂移
- ✅ 评审者与起草者分离（reviewer subagent 独立执行）

precheck 通过 → 进入正式审查。

## 多维评分（0-10）

| ID | 维度 | 评分 | 说明 |
|---|---|---|---|
| U1 | 需求覆盖与追溯 | 8 | §3 需求追溯表覆盖 FR-001..FR-008；UI 决策回指 §10.1..§10.5；未引入未追溯的新 UI surface |
| U2 | IA 与用户流完整性 | 7 | dashboard / curation / works / audit 四页 + `/studio` 入口卡的 IA 清楚，但缺少：每页面包屑文案、curation 表单字段层级、错误回流的具体 URL/参数契约 |
| U3 | 交互状态覆盖 | 5 | §10 仅描述 happy path 与一次错误回流；未枚举 loading / empty（无 slot / 无 audit / 无 works）/ partial / 表单 invalid / draft 行不显示按钮的语义；FR-003 / FR-004 / FR-005 各自含 empty 与 invalid 路径，未在 §10 状态矩阵化 |
| U4 | 视觉一致性与 Design Token 合规 | 8 | 完全沿用 `museum-*` utility（`PageHero`/`museum-card`/`museum-panel`/`museum-stat`/`museum-tag`/`museum-button-secondary`/`museum-label`），明确"不引入新视觉 token"；唯一含糊点：`museum-stat` 是卡片化容器，与"语义化 `<table>` + `museum-stat` 行"语义不直接对应（见 §10.1） |
| U5 | 可访问性（WCAG 2.2 AA） | 5 | 仅声明"语义 `<table>`、`<button type=submit>`、不依赖 JS"；未逐项落地：focus-visible（globals.css 已统一，但本设计未显式继承声明）、目标大小 24×24、错误反馈的 aria-live / aria-describedby、status 标签仅文本承载需声明非颜色依赖、reduced motion（沿用既有 token，应显式说明）、跳过链接、heading 层级（h1/h2/h3 顺序）|
| U6 | 响应式 / i18n / 性能 | 6 | 移动端仅说"表格自然滚动"，缺 `overflow-x-auto` 包裹与最小列宽声明；i18n 仅给状态三个中文标签，curation 表单标签 / 错误码 → 中文文案映射缺失；NFR-001 性能在 §13.1 已交给 regression-gate（可接受）|
| U7 | 决策质量与 trade-offs | 5 | §6 充分对比了事务边界与 admin email 对齐两个跨权决策（属 hf-design 范围）；但 UI 决策（status 标签复用 `museum-tag` 不引入红/警示色、错误用 URL `?error=` 而非 toast、表格不引入响应式组件）无候选方案对比，无 ADR；§16 ADR 全部是后端/架构 ADR |
| U8 | 任务规划准备度与 peer 交接 | 7 | 组件粒度足够：每页页内组成可冷读；与 `hf-design` 的 peer 交接通过 §3 / §11 的字段约束已基本对齐；但 a11y / 状态矩阵 / 错误码字典未稳定 → 直接进入 `hf-tasks` 仍会让任务侧补设计 |

任一关键维度低于 6/10：**U3=5、U5=5、U7=5** → 不得返回 `通过`。

## 结论

需修改

核心 UI 决策（沿用 editorial-dark + `museum-*`、不引入新 token、SSR + form action、URL 携带错误码）方向正确并与既有壳层兼容；但 §10 在状态矩阵、a11y 逐项落地、UI 决策 trade-off、移动端表格细节、错误码字典等条目上覆盖偏薄，需要一轮定向修订即可补齐，不需要重做。

## 发现项

- `[important][LLM-FIXABLE][U3][AU1]` §10 仅给 happy path；未枚举关键页面状态矩阵：
  - `/studio/admin/curation`：surface 下无 slot 的 empty 态、目标对象 display name 缺失（FR-003 「目标不存在」标识）的 partial 态、表单 invalid（FR-003 `invalid_curation_input`）的 invalid 态。
  - `/studio/admin/works`：全库无作品 / 仅 draft（导致按钮全部不显示）的 empty 态；hide / restore 失败（`work_not_found` / `invalid_work_status_transition`）的 error 态。
  - `/studio/admin/audit`：零审计记录的 empty 态。
  - `/studio/admin`：admin 名单为空被 fail-closed 的状态本就 redirect 不在本页，但 dashboard 三张入口卡是否也需展示当前 admin email + 名单大小提示属于 happy path 之外的 informational 态。
  - 修复方向：在 §10 增加状态矩阵小节，按 `loading / empty / error / invalid / partial` 列举每页关键交互。
- `[important][LLM-FIXABLE][U5][AU5]` a11y 声明仅 4 行（语义 table、submit 按钮、不依赖 JS、`noindex` 留待后续），未按 `a11y-checklist.md` 落地：
  - 未声明每页 heading 层级（PageHero=h1，`SectionHeading`=h2，子 section h3 是否使用 `SectionHeading`）。
  - 未声明 form action 按钮 / status 标签 / 错误条 / table cell 的 a11y 名称（`aria-label` / `<caption>` / `scope="col"`）。
  - 未声明 status 标签为「非仅颜色」承载（当前所有 status 共用同一个 `museum-tag` 视觉，仅文本差异；这本身满足 1.4.1，但应显式写出"非颜色依赖，靠文本区分"以避免读者误以为缺差异化）。
  - 未声明 `?error=<code>` 错误条的 `role="alert"` / `aria-live="polite"`、是否聚焦。
  - 未声明 hide / restore 是否需要二次确认（WCAG 3.3.4 重要/不可逆动作；hide 立即对公开屏蔽属于业务上"重要"动作）。
  - 未显式继承 globals.css 的 `:focus-visible` token（沿用即可，但应显式声明"全部交互控件继承既有 `:focus-visible` 4px ring，不局部覆盖 outline"）。
  - 未声明目标大小 24×24（form action 按钮使用 `museum-button-secondary` 已 ≥ 40×40，可直接声明继承）。
  - 未声明 reduced motion（admin 页面无新动效，可直接声明"无新动效，沿用既有 prefers-reduced-motion 策略，无需新增降级"）。
- `[important][LLM-FIXABLE][U7][AU9]` UI 决策无候选方案对比与 ADR：
  - status 标签是否引入 warning/danger 视觉 token、是否仅靠图标差异、是否仅靠中文文案差异 — 当前设计直接选定第三种，未对比也未写 ADR；应至少在 §10.2 或 §16 列两个候选 + 选择代价（如"未来若需要批量扫描视觉强提醒，需要专门 slice 引入新 token"）。
  - 错误反馈选 URL `?error=<code>` vs. cookie/flash vs. toast portal — 当前直接选 URL，未对比；应在 §10.4 或 §16 落一条"V1 选 URL 携带错误码"ADR，含可逆性评估。
  - 移动端表格选「自然滚动」vs.「响应式 stack」vs.「复用 `museum-stat` 列表回退」— 当前选自然滚动，未对比；应短列清楚 trade-off。
- `[important][LLM-FIXABLE][U2][U6]` §10.5 移动端表格仅一行字（"自然滚动"）：
  - 未声明 wrapper（如 `overflow-x-auto` / `min-w-*`）；按当前 CSS 不会自动出现横向滚动条，`<table>` 会撑出 viewport 触发 body 横滚，破坏既有 shell。
  - 未声明各列最小宽度 / 列优先级（如 `targetKey` 列需 wrap、`updatedAt` 列允许折行）。
  - 未声明断点（`md` 起进入桌面排版？小屏 form 布局如何 stack？）。
  - 修复方向：在 §10.5 给出 `overflow-x-auto` 包裹方案 + 列宽策略 + 关键断点。
- `[important][LLM-FIXABLE][U2]` `?error=<code>` 错误码字典缺失：
  - FR-003 / FR-004 已声明 `invalid_curation_input` / `invalid_work_status_transition` / `work_not_found` 等 `AppError.code`，但 §10.4 没有把这些 code → 用户可见中文文案的映射列出来；任务侧拿不到这张表无法直接落地。
  - 未声明 URL 错误参数的命名空间（`?error=invalid_curation_input` vs. `?adminError=...`）、是否需 `?errorAction=...` 上下文、错误条多久消失 / 怎么消失、刷新页面是否仍显示。
- `[minor][LLM-FIXABLE][U4]` §10.1 中"表格用语义化 `<table>` + 既有 `museum-stat` 行"在语义上含糊：`museum-stat` 当前是 `border-radius: 1.45rem` 的卡片化容器（globals.css L296-300），与 `<tr>` 行语义不直接复用；应改为「`<table>` 内行复用 `museum-stat` 视觉风格的边框/背景，但保留 `<tr>/<td>` 语义」或干脆走「`museum-panel` 包裹 + 自定义行 hairline + 沿用 token」，避免实现侧把 `museum-stat` 直接当 `<tr>` 用。
- `[minor][LLM-FIXABLE][U2]` `/studio/admin/curation` 添加 slot 表单的字段层级 / 控件类型未画清：surface / sectionKind / targetType 是否使用 `<select>` 枚举（避免 admin 手敲非法值触发 `invalid_curation_input`）？`order` 是否 `<input type="number">`？`targetKey` 是否带客户端校验？建议在 §10.1 给出该表单的字段表与控件类型，便于 hf-tasks 拆解。
- `[minor][LLM-FIXABLE][U6]` SEO/`noindex`：admin 页面通过 server redirect 已确保未授权身份只看到 `/login` / `/studio`，搜索引擎爬虫不会抓到 admin 内容；但显式 `<meta name="robots" content="noindex,nofollow">`（或 `metadata.robots`）作为深度防御几乎零成本；§10.3 留到后续 slice 不算阻塞，但建议在 V1 同步加上。
- `[minor][LLM-FIXABLE][U3]` `/studio/admin` dashboard 与 `/studio` 入口卡未声明非 admin 用户视图（虽然 §9.7 / §9.8 已 SSR redirect / 条件渲染，但 §10 不重述会让 UI 任务侧重新去后端找）；建议在 §10.1 写一句"非 admin 用户不会到达任何 admin 页面（SSR redirect），DOM 不渲染入口卡（FR-002）"。

## 薄弱或缺失的 UI 设计点

- §10 缺统一的「状态矩阵」小节（每页 × 状态）；当前仅按页面平铺。
- §10 缺「a11y 落地表」（可直接复制 `a11y-checklist.md` §「在 UI 设计文档中的声明方式」模板）。
- §10 缺「UI 决策候选 + ADR」段（status 标签视觉、错误反馈通道、表格响应式策略至少需要 ADR 摘要）。
- §10 缺关键页面 wireframe（即便 ASCII 也可），目前只能从 prose 反推页面结构；不至阻塞但会让 hf-tasks-review 的 readiness 变弱。
- §10 缺错误码 ↔ 中文用户消息字典；目前仅 §10.4 一句 "URL `?error=<code>`"。

## 与 hf-design 的 peer 交接一致性

- 已对齐：
  - `CommunityWorkStatus = "draft" | "published" | "moderated"`（设计 §9.4 / §11 ↔ UI §10.2 status 标签三态）。
  - `getRequestAccessControl()` 输出 `adminCapability` + `adminGuard`（设计 §9.1 ↔ UI §9.7 / §9.8 / §10.1 dashboard 入口卡条件渲染）。
  - admin server action `AppError.code` 集合（设计 §9.6 / 不变量 ↔ UI §10.4 错误回流）— 字段级别已对齐，但 UI 侧缺 code → 文案字典（见上）。
  - admin server action 全经 `wrapServerAction` + redirect 回列表（设计 §8.2 / §9.6 ↔ UI §10.4「不引入 toast / portal / 客户端状态」）。
  - audit 列表最近 100 条按 `created_at desc, id desc`（设计 §9.5.4 / 规格 FR-005 ↔ UI §10.1 / §10.3 隐含）。
- 不一致 / 待协商：
  - `museum-stat` 在 UI §10.1 既被当作"表格行"又被当作"audit 单条"两种用途，建议统一选一个：要么一律 `<table>` 语义 + `museum-stat`-风格化样式，要么列表型 audit 用 `museum-stat` 卡片，表格型 works/curation 用纯 `<table>`。
  - hf-design ADR-2 锁定「业务写 + audit append 同事务（`withTransaction`）」；UI §10 未给"写动作进行中"的 loading 反馈策略 — 由于全 SSR + form action + redirect，浏览器原生导航 spinner 会接管，但应在 §10 显式说明，避免 UI 任务侧又设计客户端 pending 态。
  - hf-design §13.1 把 NFR-001 P95 ≤ 80ms 留给 regression-gate；UI §10 没写"列表上限 100 条"对页面布局的影响（如 audit 100 行是否需要分页 / 虚拟滚动）— V1 不做分页是合理选择，但应在 §10 显式声明 + 给 100 行下的 viewport 行为预期。
- 本文档已锁、可供 peer 依赖：
  - 全部 admin shell 视觉沿用 `museum-*` utility，不引入新视觉 token / 新组件库（hf-design 可据此假设无前端依赖升级）。
  - 全部 admin 写动作 UI 入口为 `<form>` + `<button type="submit">`，不引入客户端交互框架（hf-design 可据此假设 server action 是唯一调用通道，匹配 CON-005）。
  - 不修改既有 `PageHero` / `SectionHeading` / `EditorialCard` 组件契约（hf-design 可据此假设既有组件 props 表面零变动）。

## 下一步

`hf-ui-design`（回 UI 设计起草节点做一轮定向修订；本评审与 `hf-design-review` 解耦，hf-design 侧可继续推进其稳定部分，但联合 `设计真人确认` 必须等本评审通过的下一版回流）。

修订建议聚焦 5 件事，全部 `LLM-FIXABLE`：
1. 在 §10 增加「状态矩阵」小节（loading / empty / error / invalid / partial × 四个 admin 页面）。
2. 在 §10 增加「a11y 落地表」（heading 层级、focus-visible、目标大小、错误条 aria-live、status 文本承载、reduced motion、二次确认策略）。
3. 在 §10.4 增加「错误码 → 中文文案字典」与 URL 参数命名空间约束。
4. 在 §10.5 给出移动端 `overflow-x-auto` 包裹 + 列宽策略 + 断点。
5. 在 §10 或 §16 增加 3 条 UI ADR：status 标签视觉、错误反馈通道、移动端表格策略（每条至少两个候选 + 选择代价 + 可逆性）。

## 记录位置

- `docs/reviews/ui-review-phase2-ops-backoffice-v1.md`（本文件）
