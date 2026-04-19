# UI 评审记录 — Phase 2 — Threaded Messaging V1

- 评审日期: 2026-04-19
- 评审对象: `docs/designs/2026-04-19-threaded-messaging-v1-design.md`（DRAFT；§10 UI 设计要点 + §11 不变量 + §16 ADR 摘要）
- 已批准规格: `docs/specs/2026-04-19-threaded-messaging-v1-srs.md`
- 增量记录: `docs/reviews/increment-phase2-threaded-messaging-v1.md`
- Workflow Profile: `full`
- Execution Mode: `auto`
- Reviewer skill: `hf-ui-review`
- Peer review: `hf-design-review`（独立返回，由父会话汇总联合 approval）

## 1. Precheck

| 检查 | 结论 |
|---|---|
| UI 设计草稿是否稳定可定位 | ✅ §10 提供 `10.1` 视觉层级 / `10.2` 状态矩阵 / `10.3` a11y 落地表 / `10.4` 错误码字典引用 / `10.5` 移动端 / `10.6` SEO / `10.7` UI ADR 7 段，配 §11 不变量 + §16 ADR |
| 已批准规格是否声明 UI surface | ✅ 规格 §6 FR-005 / FR-006 + §3 关键场景明确声明 `/inbox` + `/inbox/[threadId]` 两条 UI surface；§8.3 给出 7 条错误码字典 |
| route / stage / profile 与证据是否一致 | ✅ 增量记录 + 规格批准记录对齐 `full`；当前为 `hf-ui-review` 节点 |
| `hf-design` 草稿是否进入可比对状态 | ✅ 同一份 design 文档同时承载 `hf-design` 与 `hf-ui-design` 章节；§9 / §11 / §16 提供 peer 比对依据 |

precheck 通过 → 进入正式 8 维评审。

## 2. 维度评分

| ID | 维度 | 评分 | 说明 |
|---|---|---|---|
| `U1` | 需求覆盖与追溯 | 9/10 | §10 各小节均回指 spec FR-005 / FR-006 / §8.3 / NFR-002；I-9 显式锚定 FR-008 隐私边界；新增 UI 能力均可追溯 |
| `U2` | IA 与用户流完整性 | 7/10 | `/inbox` 两段 + `/inbox/[threadId]` 时间线 + 表单 + 客户端 poll 描述清晰；guest redirect / `notFound()` 路径与 §8.3 流程图对齐；但 `supporting=<context 来源链接>` 未说明 `context_ref`（`work:<id>`/`profile:<role>:<slug>`/`opportunity:<id>`/null）→ 人类可读 label/href 的映射规则 |
| `U3` | 交互状态覆盖 | 7/10 | 6×2 状态矩阵主体齐全；FR-003 中 `sendMessage` 收到 `forbidden_thread` 后 redirect 回 `/inbox` 时是否携带 `?error=forbidden_thread` 未在 §10.2 `/inbox` 行声明；30s polling 触发的 `router.refresh()` 无可见 loading 反馈未显式作为 trade-off 记录 |
| `U4` | 视觉一致性与 Design Token 合规 | 9/10 | 严格沿用 `museum-panel(--soft)` / `museum-stat` / `museum-tag` / `museum-label` / `museum-button-primary` / `museum-empty` / `museum-textarea` 既有 utility（globals.css L254–L404 验证）；`PageHero` / `SectionHeading` 复用一致；UI-ADR-2 显式承诺无新 token；未读 badge 视觉样式（museum-tag? inline-block?）未显式选定 |
| `U5` | 可访问性（WCAG 2.2 AA） | 9/10 | heading 层级 h1→h2→h3 连续；`:focus-visible` 4px ring 复用全局；目标大小 ≥ 40×40；`role="alert" aria-live="polite"`；未读 badge `<span class="sr-only">未读</span>`（UI-ADR-3 选 (a) 数字+sr-only，**优于** spec §3 关键场景中"红色 badge"提议，遵循 WCAG 1.4.1）；`<time dateTime>` 包裹；textarea `aria-label="消息正文"` + sr-only `maxlength` 提示；reduced-motion 通过"无新动画"自然满足；I-9 保证 client poll 不暴露数据 |
| `U6` | 响应式 / i18n / 性能预算适配 | 8/10 | 移动端单列 `grid gap-5`；时间线 `flex` + `ml-auto` 自然适配；textarea `min-h-[6rem]`；性能预算（NFR-001 P95 ≤ 120/80/30ms）由 §13 承接；i18n 全中文文案与既有页面同形（无 RTL/多语种要求） |
| `U7` | 决策质量与 trade-offs | 9/10 | UI-ADR-1..5 五条 ADR 均含候选 (a)(b)(c) + 选定 + 理由 + 可逆性；与 §16 ADR 主表对齐；UI-ADR-3 主动避开颜色依赖优于 spec 描述 |
| `U8` | 任务规划准备度与 peer 交接 | 8/10 | `<InboxThreadPoll />` props 边界（`intervalMs?: number`）/ a11y 语义 / sr-only 处理均清晰；与 `hf-design` peer 共享同一份文档天然一致；§17 出口工件齐全；待补：`/inbox` 上 `forbidden_thread` 状态的 alert/不展示 alert 的明确选择会影响 task 拆解 |

无任一维度 < 6/10；U2 / U3 < 8/10 → 对应至少各一条 finding。U5 关键项（色彩对比 / 键盘可达 / focus 可见 / 错误非仅颜色）均显式声明且可冷读，未触发自动 critical。

## 3. 结论

**需修改**

核心 UI 设计可用：editorial-dark 壳层与 `museum-*` utility 严格复用、a11y 落地清晰、隐私不变量 I-9 与 client poll 边界正确、SEO noindex 声明完整、状态矩阵主体齐全、视觉决策有 ADR。但存在三处定向回修可补齐的局部缺口（`forbidden_thread` 在 `/inbox` 状态矩阵的归属、ERROR_COPY 7 条 code 内联映射、`context_ref` 三态人类可读 label 规则），不阻塞 `hf-tasks`，但放任会让任务拆解阶段反复回查规格。

## 4. 发现项

- `[important][LLM-FIXABLE][U3]` §10.2 `/inbox` 行的 Invalid 列仅列出 `recipient_not_found` 与 `invalid_self_thread`；spec FR-003 规定 `sendMessage` 抛 `forbidden_thread` 后 UI 收到错误 → redirect 到 `/inbox`，但设计未明确该 redirect 是否携带 `?error=forbidden_thread` 由 `/inbox` 渲染 alert，还是静默跳回。建议在 `/inbox` Invalid 列补充 `forbidden_thread`（含决定：渲染 alert 或静默），以闭合 7 条 code 的页面归属。

- `[minor][LLM-FIXABLE][U4]` §10.4 仅写"复用 spec §8.3" + "page-side ERROR_COPY 共享对象（与 §3.2 V1 admin error copy 同形）"，未在 UI 设计文档内联 7 条 code → 中文 copy → 触发页面 的归属表。建议在 §10.4 内联三列表（`code` / `中文 copy`（拷自 spec §8.3）/ `归属页面 + 表现形式`），便于 `hf-tasks` 与 `hf-test-driven-dev` 冷读对照，与 §3.2 V1 admin error copy 同形。

- `[minor][LLM-FIXABLE][U2]` §10.1 `/inbox/[threadId]` PageHero `supporting=<context 来源链接>` 未说明 `context_ref` 三种形态（`work:<id>` / `profile:<role>:<slug>` / `opportunity:<id>`）+ null 的人类可读 label 与 href 生成规则。建议给出小映射表（如 `work:<id>` → 「来自作品《<title>》」+ `/works/[id]`）或显式委托给某 helper（`buildContextSourceLink(contextRef)` 之类），避免实现层临场拍板。

- `[minor][LLM-FIXABLE][U3]` §10.2 `/inbox` 与 `/inbox/[threadId]` 的 Loading 列均标 `n/a（SSR + 浏览器原生导航 spinner）`；UI-ADR-1 选定的 30s `router.refresh()` 客户端轮询会触发静默 SSR re-fetch（无任何视觉反馈）。建议在 §10.2 或 UI-ADR-1 显式记录该"无可见 loading 反馈"为 V1 trade-off（与 spec FR-006 + A-003 一致），避免 reviewer / 实现者后续误以为该项漏写。

- `[minor][LLM-FIXABLE][U4]` §10.1 + UI-ADR-3 把未读 badge 选为"数字 + sr-only 中文"，但未指定其视觉容器（既有 `museum-tag` / `museum-label` / 自定义 inline-block？）。建议显式选定一个既有 utility（推断 `museum-tag` 最贴合，与 contextRef 来源 tag 视觉一致），保证不引入新 token。

## 5. 薄弱或缺失的 UI 设计点

- 时间戳人类可读格式未指定（`<time dateTime>` 包裹是 a11y OK，但 `formatHumanTime` 还是相对时间未决；admin audit page 用的是 UTC `formatHumanTime`，可显式复用）。
- `/inbox/[threadId]` 上"对方 displayName"出现在 PageHero h1 + `<title>` 中；noindex 已经声明（§10.6），私有边界由 SSR 鉴权 + 404 兜底，不构成 a11y / 隐私缺陷，但建议在 §10.6 一并提一句 "displayName 出现在 `<title>` 内不构成泄露（页面已 noindex + 仅 participant 可访问）"，让 reviewer 一眼看清。
- §10.3 a11y 表写"Skip link 沿用既有 layout；不在本增量新增"——若既有 layout 实际上没有 skip link，本增量是否承担补全？目前看不在范围内（与既有所有 page 一致），建议留作 V2 待办。

## 6. 与 `hf-design` 的 peer 交接一致性

本 UI 设计与 `hf-design` 章节同处一份文档，peer 比对集中在以下条目：

- 已对齐
  - I-9 客户端 `<InboxThreadPoll />` 不持有 thread / message 数据 ↔ §9.10 poll-client.tsx 仅 `intervalMs?: number` props ↔ §10.1 "客户端轮询组件 `<InboxThreadPoll />` 不渲染任何可见 DOM"（隐私不变量 + 实现签名 + UI 描述三处一致）。
  - I-3 SSR 入口 4 步顺序硬约束（guest redirect → participant guard → markRead → fetch + render）↔ §8.3 mermaid 流程图 ↔ §10.1 / §10.2 状态矩阵中"进入即清零未读"。
  - I-11 thread 不存在 vs 非 participant 不区分 ↔ §10.2 `/inbox/[threadId]` 不暴露 forbidden_thread 给末端 → 统一 `notFound()` ↔ spec NFR-002 / FR-006 锁定。
  - §10.4 ERROR_COPY 引用 spec §8.3 7 条 code ↔ §9.5 server actions 抛出 `unauthenticated` / `forbidden_thread` / `recipient_not_found` / `invalid_self_thread` / `message_empty` / `message_too_long` / `storage_failed`（兜底由 wrapServerAction 提供）。
  - UI-ADR-1 客户端轮询 = `useEffect + setInterval + router.refresh()` ↔ ADR-5 ↔ §9.10 poll-client.tsx 实现签名一致。
  - UI-ADR-4 错误回流走 URL `?error=<code>` ↔ §9.5 form-action wrapper redirect `?error=<code>` ↔ §3.2 V1 admin shell 协议同形。

- 不一致
  - 无（reviewer 范围内 UI 与架构 / 接口契约未发现冲突）。

- 本文档已锁、可供 peer 依赖
  - `<InboxThreadPoll />` props 仅 `{ intervalMs?: number }`、不接收 thread / message 数据。
  - 7 条 ERROR_COPY 中文 copy 来源固定为 spec §8.3。
  - PageHero / SectionHeading / `museum-*` utility 完整复用，不引入新视觉 token。
  - `/inbox` 与 `/inbox/[threadId]` 均设 `metadata.robots = { index: false, follow: false }`。
  - 未读 badge 设计选用"数字 + sr-only 中文"，**不**依赖颜色（覆盖 spec §3 关键场景中"红色 badge"措辞）。

## 7. 下一步

`需修改` → 进入 `hf-ui-design`，定向修订上述 4 条 finding；修订后回到本 skill 复审；与 `hf-design-review` 在父会话联合 approval。

## 8. 记录位置

`docs/reviews/ui-review-phase2-threaded-messaging-v1.md`

## 9. 交接说明

- `hf-ui-design`：用于本次需修改回修；可仅改动 §10.2 / §10.4 / §10.1 三处与 UI-ADR-1（或 §10.7）一处，无需重画 wireframe。
- `hf-design-review`：peer 评审独立返回；本 verdict 不预设其结论。父会话需在两条 review 同时通过后才能进入 `设计真人确认`。
- `hf-workflow-router`：本 verdict **不**触发 reroute；`reroute_via_router=false`。

## 复审 (2026-04-19)

第二轮评审针对首轮 4 条 finding + 1 条薄弱点（共 5 项）的定向修订进行复核。逐项验证：

| 编号 | 首轮 finding / 薄弱点 | 修订位置 | 验证结论 |
|---|---|---|---|
| 1 | `[important][U3]` `forbidden_thread` 在 /inbox 状态矩阵无归属 | §10.2 `/inbox` 行 Invalid 列追加 `?error=forbidden_thread`，并标注"来自 sendMessage 等 server action redirect 回 /inbox 的兜底 fallback" | ✅ 闭合。7 条 code 在 §10.2 + §10.4 中页面归属完整自洽（`/inbox` 承接 `forbidden_thread` 兜底；`/inbox/[threadId]` 永不出现 `forbidden_thread` —— 与 I-11 + spec NFR-002 对齐） |
| 2 | `[minor][U4]` ERROR_COPY 7 条 code 未在 UI 文档内联 | §10.4 替换为完整 3 列表（`code` / 中文 copy / 归属页面 + 表现形式），7 条逐条列齐，并补"未识别 code 走默认兜底"分支 | ✅ 闭合。7 条 code 与 spec §8.3 完全一致；归属页面与 §10.2 状态矩阵交叉一致；与 §3.2 V1 admin error copy 同形 |
| 3 | `[minor][U2]` `context_ref` 三态人类可读 label 规则缺失 | 新增 §10.4.1 + `buildContextSourceLink(contextRef)` helper（`features/messaging/context-link.ts` 纯函数）；4 行映射表覆盖 `work:<id>` / `profile:<role>:<slug>` / `opportunity:<id>` / null；明确"不查 sqlite，纯字符串模式匹配"避免引入额外 SELECT | ✅ 闭合。helper 边界清晰（纯函数、无副作用、可单测）；§10.1 直接消息段也回引该 helper 生成 context tag 文案，复用一致 |
| 4 | `[minor][U3]` 30s 轮询无可见 loading trade-off 未显式 | §10.2 两行 Loading 列均补"30s 客户端轮询 `router.refresh()` **无可见 loading 反馈**，是 V1 显式 trade-off"；UI-ADR-1 末尾补一段"显式 V1 trade-off"段落，与 spec FR-006 + A-003 对齐，承诺 V2 评估 visual indicator | ✅ 闭合。trade-off 文档化在两处（状态矩阵与 ADR），冷读可识别 |
| 5 | `[minor][U4]` 未读 badge 视觉容器未指定 | §10.1 直接消息段行明确选定"视觉容器复用 `museum-tag` 与 context tag 同形，内含数字 + `<span class="sr-only">未读</span>`，不引入新 token" | ✅ 闭合。与 UI-ADR-3（数字 + sr-only）+ globals.css L302 `museum-tag` 利用率一致；不破坏"无新视觉 token"承诺 |

### 复审维度评分变化

| ID | 一审 | 复审 | 说明 |
|---|---|---|---|
| `U2` | 7/10 | 9/10 | §10.4.1 helper 表锁死 contextRef 三态 + null 的 label / href，IA 路径无遗漏 |
| `U3` | 7/10 | 9/10 | 7 条 code × 2 页面归属在 §10.2 + §10.4 双向一致；轮询无 loading 显式 trade-off |
| `U4` | 9/10 | 9/10 | 未读 badge 容器选定 `museum-tag`，无新 token；ERROR_COPY 表与 admin 同形 |
| 其他 | 不变 | 不变 | U1 / U5 / U6 / U7 / U8 维度未受本轮修订影响 |

### 复审结论

**通过**

5 条 finding 全部定向闭合；未引入新 finding；UI 设计已可支撑 `hf-tasks` 拆解。

### 与 `hf-design` peer 交接补充确认

- §10.4.1 新增的 `buildContextSourceLink` helper 位于 `features/messaging/context-link.ts`（纯函数）；与 §17 出口工件清单一致（如 §17 未列入，hf-design 阶段需顺手补；不阻塞 UI verdict）。
- §10.4 ERROR_COPY 表的"归属页面"一栏对 `forbidden_thread` 在 `/inbox/[threadId]` "永不出现（统一走 `notFound()`）"的描述与 I-11 / spec FR-006 完全一致。
- §10.7 UI-ADR-1 trade-off 段落与 ADR-5（§16）兼容，未引入互相冲突的承诺。

### 复审下一步

`通过` → 进入 `设计真人确认`（`needs_human_confirmation=true`），等待 `hf-design-review` 同样通过后由父会话发起联合 approval。`reroute_via_router=false`。
