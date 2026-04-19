# Design Review — Phase 2 Ops Back Office V1

- Date: `2026-04-19`
- Reviewer: design reviewer subagent（由父 HF orchestrator 派发）
- Workflow Profile: `full`
- Execution Mode: `auto`
- Design under review: `docs/designs/2026-04-19-ops-backoffice-v1-design.md`
- Approved spec: `docs/specs/2026-04-19-ops-backoffice-v1-srs.md`
- Spec approval: `docs/verification/spec-approval-phase2-ops-backoffice-v1.md`
- Increment record: `docs/reviews/increment-phase2-ops-backoffice-v1.md`
- Style baseline: `docs/designs/2026-04-19-discovery-intelligence-v1-design.md`
- Skill: `.cursor/skills/harness-flow/skills/hf-design-review/SKILL.md`
- Checklist: `.cursor/skills/harness-flow/skills/hf-design-review/references/review-checklist.md`

> 职责边界：本评审仅覆盖架构 / 模块 / API 契约 / 数据模型 / 后端 NFR；UI（IA / 交互 / 视觉 / 前端 a11y）由并行的 `hf-ui-review` 评审，本记录不代审。

## 结论

需修改

## Precheck

- 设计草稿可定位 ✅
- 已批准规格可回读 ✅
- approval evidence 一致（spec approval `docs/verification/spec-approval-phase2-ops-backoffice-v1.md` 决定为「批准进入 hf-design」+ Execution Mode `auto`）✅
- 增量记录与 Workflow Profile (`full`) 一致 ✅
- 进入正式评审

## 维度评分

| ID | 维度 | 评分 | 说明 |
|---|---|---|---|
| `D1` | 需求覆盖与追溯 | 8/10 | §3 表格逐条映射 FR-001..008 + NFR-001..005；ADR-1..5 在 §16 锚定 FR/NFR/CON。漏点见 F-1（FR-004 #6 owner 侧 `/studio/works` 未进 §17 修改清单）。 |
| `D2` | 架构一致性 | 8/10 | §4 / §8.1-8.3 / §9 模块结构清楚，logical / sequence / fail-closed 三视图齐全；与既有 `Capability+Guard` / 加性 namespace 模式同形。`runAdminAction` 与 `wrapServerAction` 的 log 事件叠加未在文中明确（minor）。 |
| `D3` | 决策质量与 trade-offs | 9/10 | §5/§6 对两项最高风险（事务边界、admin email ↔ session）各给出 3 个候选 + 优点/代价/适配/可逆性矩阵 + 选定理由；其余 D-3..D-8 与 §16 ADR 摘要前后呼应，可冷读。 |
| `D4` | 约束与 NFR 适配 | 8/10 | NFR-001..005 + CON-001..006 进入 §3 / §16 / §15；fail-closed、admin email 不进 logger 白名单、metrics 加性、Node 22 + sqlite-only 均被吸收。轻微：NFR-001 P95≤80ms 仅留给 increment-level regression-gate，未要求设计层 micro-bench artifact，可接受。 |
| `D5` | 接口与任务规划准备度 | 6/10 | bundle 类型扩展 / sqlite SQL / runAdminAction 模板 / SSR redirect 模板均显式可拆。但 FR-004 #6 owner-side `/studio/works` 现有 UI（`page.tsx` line 99 仅区分 `published`/`draft`、`revert_to_draft` 与 `publish` 按钮对 `moderated` 作品仍可触发）的修订未进 §9 / §17，会留给 `hf-tasks` 替设计补洞，触发 A9 task-planning gap。 |
| `D6` | 测试准备度与隐藏假设 | 7/10 | §14 列出 unit / component / integration 三层；§11 把 12 条 invariant 显式写出。轻微：in-memory bundle 的 `audit` 与 `withTransaction` 实现轮廓只在 §9.5.5 + §12 散述，§12 「默认实现一个空 audit 字段」与 §17 「增加 audit + curation 写能力」表述略不一致；§8.3 SRS 的「`(surface, sectionKind)` 内 `order_index` 允许重复 + 三层稳定排序」未提升为 §11 invariant（实现路径正确但缺 hard 锁）。 |

总评：核心可用，FR-004 #6 owner-side 列表/编辑路径漏改是阻塞任务规划的局部缺口；其余为 minor 完善。结论 **需修改**，可由一轮 `hf-design` 定向修订补齐。

## 发现项

- **[important][LLM-FIXABLE][D5/A9] FR-004 #6 owner-side `/studio/works` 路径未进 §9 / §17 修改清单。** SRS FR-004 #6 显式要求：`moderated` 作品对 owner 仍可见但不允许 owner 自助恢复。当前 `web/src/app/studio/works/page.tsx`（line 99）仅区分 `work.status === "published" ? "已发布" : "草稿"`，会把 `moderated` 误标为「草稿」；同一文件 line 130-156 对所有非 draft 作品渲染 `publish` / `revert_to_draft` 按钮，加上 `web/src/features/community/work-editor.ts` `resolveNextVisibility` 在 intent=publish 时直接写回 `published`，等于给 owner 提供"自助恢复"路径，违反 FR-004 #6 与 ADR-5。设计需在 §9 增加 owner-side 模块小节 + §17 列入 `app/studio/works/page.tsx` 与 `features/community/work-editor.ts` 的修改边界（最少：moderated → 显示「已隐藏」标识 + 抑制 publish/revert_to_draft 按钮 / `resolveNextVisibility` 拒绝 owner 路径上的 moderated→published 转换）。
- **[minor][LLM-FIXABLE][D6/D1] §8.3 SRS 不变量「`(surface, sectionKind)` 内 `order_index` 允许重复 + 公开渲染层三层稳定排序」未提升为 §11 invariant。** 现有 `curated_slots` PRIMARY KEY 是 `(surface, section_kind, target_key)`，design §9.5.3 的 `upsertSlot` ON CONFLICT 子句也只锁 PK，实现层正确允许 `order_index` 重复；既有 `listSlotsBySurface` 已按 (order_index, sectionKind 固定映射, targetKey) 三层排序。问题只是 §11 invariants 里没把这条 §8.3 不变量提为 I-13，未来误改 schema / 排序键易回归。
- **[minor][LLM-FIXABLE][D5] `bundle.audit` 与 `withTransaction` 在 in-memory bundle 的实现轮廓散述、措辞略不一致。** §9.5.5 仅给出 sqlite 版 `withTransaction`；§12 写「in-memory bundle 默认实现一个空 `audit` 字段」，§17 写「in-memory bundle 增加 `audit` + `withTransaction` noop + curation 写能力」。两处表述未明确 `audit` 是 noop 还是真正写入内存数组（FR-005 测试需要 listLatest 读到刚写入的条目）；建议统一为「in-memory `audit` 维护一个内存数组并实现 record/listLatest；in-memory `withTransaction` 是 noop 直接执行回调」。
- **[minor][LLM-FIXABLE][D2] `runAdminAction` 与 `wrapServerAction` 的 log 事件叠加关系未明确。** §9.6 `runAdminAction` 在内部主动 logger.info("admin.action.completed") / warn("admin.action.failed")；外层 `wrapServerAction` 已经记录 `server-action.completed` / `.error`。NFR-003 要求 `event=admin.action.completed/failed`，事实上每个 admin server action 会同时产生两条 log。不是 bug，但未在 §12 兼容点 / §11 invariant 中显式说明双 log 是设计选择而非冗余，readers 易误解。
- **[minor][LLM-FIXABLE][D4] CON-002（不引入 npm 新依赖）/ CON-005（不开放新 REST 端点）/ CON-006（不引入二次审批）未在 §16 ADR 中显式锚定。** 现状 ADR-1..5 锚定 FR/NFR/§8.3，但 CON-001/CON-003 仅出现在 ADR-2 的"适配性"列；CON-002/CON-005/CON-006 在 §3 / §15 隐含被遵守，但缺一条显式 trace。建议在 §16 增补 ADR-1 后果项 / 或 §3 表格新增「CON 覆盖」列。

## 薄弱或缺失的设计点

- **owner-side `/studio/works` moderated 视觉 + 自助恢复闭锁**（见 F-1）。
- **§8.3 order_index 重复不变量未上升为 I-x**（见 F-2）。
- **in-memory `bundle.audit` 行为契约未唯一化**（见 F-3）。
- **double-log 设计意图未在文档中显式认领**（见 F-4）。
- **CON-002 / CON-005 / CON-006 在 ADR 表无独立锚点**（见 F-5）。

## 已交叉验证的设计要点（无 finding）

- §6.2 / §9.2 关于 `AuthenticatedSessionContext.email` 的扩展：`auth-store.ts` 现有 `resolveAuthSession` 已 INNER JOIN `auth_accounts ON auth_accounts.id = auth_sessions.account_id`，新增 `auth_accounts.email` 仅是同一 JOIN 多 SELECT 一列；`auth_accounts.email TEXT NOT NULL UNIQUE` 已归一化 lowercase，`AuthenticatedSessionContext.email` 显式声明 lowercase 与不变量 I-7 一致；`guest` 分支不变 → I-11 闭合。
- §9.5.5 `withTransaction` 与既有 `SqliteCommunityRepositoryBundle = CommunityRepositoryBundle & { databasePath; close() }` 形态：`withTransaction` 是 sqlite-only 类型扩展，纯加性；`runAdminAction` 通过 `bundle.withTransaction?.(...)` 可选链调用，对非 sqlite bundle 自动 fallback 到直接执行，类型签名与运行期表现一致。
- §9.10 `MetricsSnapshot.admin`：与既有 `recommendations` namespace（pre-registered + 始终为 0）严格同形；6 个 counter 名与 SRS FR-008 / `features/admin/metrics.ts` 常量一致；`/api/metrics` 既有消费者向后兼容（FR-008 #4 / NFR-005）。
- §9.9 公开屏蔽 moderated 的所有 surface 已覆盖：`getPublicWorkPageModel` (`isPublishedWork`)、`toPublicProfile.showcaseItems`（`works.filter(isPublishedWork)`）、`bundle.works.listPublicWorks`（已 `WHERE status='published'`）、推荐 `getRelatedWorks` / `home-discovery/resolver.ts` / `features/search/search.ts` 全部经 `listPublicWorks` 兜底；admin 唯一全 status 路径 `listAllForAdmin` 仅由 admin SSR / admin server action 消费 → I-9 闭合。
- ADR-1..5 与 FR/NFR/§8.3/CON 的锚定：ADR-1 → FR-001/FR-007/NFR-002；ADR-2 → FR-005/§8.3；ADR-3 → FR-008/CON-004；ADR-4 → FR-001/NFR-005；ADR-5 → FR-006。

## 下一步

- `hf-design`：父会话基于上述 5 条 finding 回到 `hf-design` 做一轮定向修订（重点：F-1 把 owner-side `/studio/works` 路径补进设计；其余 4 条 minor 一并随手补齐）。
- 不需要 reroute_via_router：所有 finding 均落在设计内容范围内，规格未漂移、approval 证据稳定。
- 修订完成后回到本节点重审。

## 记录位置

- `docs/reviews/design-review-phase2-ops-backoffice-v1.md`

## 交接说明

- `hf-design` 回修：聚焦 F-1（critical-task-planning gap），其余为补齐性工作。
- `hf-ui-review`（peer）：本评审不代审；如 peer 也返回需修改，与本节点合并修订。
- 真人确认：本轮不进入；待两条 design review 均通过后，由父会话联合发起 `设计真人确认`。

## 复审 (2026-04-19)

- Reviewer: design reviewer subagent（同一会话第二轮）
- Revised design: `docs/designs/2026-04-19-ops-backoffice-v1-design.md`（同一文件，已就 5 条 finding 回修）
- 复审范围：仅核对首轮 5 条 finding 是否闭合；不重新打开已 ✅ 的维度。

### Finding 闭合状态

| Finding | 处置 | 证据 |
|---|---|---|
| **F-1** [important][D5/A9] FR-004 #6 owner-side `/studio/works` 路径 | ✅ 已闭合 | §9.8.1 新增章节，覆盖 status 三态文案（`moderated → "已隐藏（运营处置）"`）、抑制 owner publish/revert_to_draft/save_draft 按钮、`resolveNextVisibility` 对 moderated 直接 throw `AppError("moderated_work_owner_locked", 403)`、admin restore 路径绕过 owner-side lock 显式说明、对应测试断言；§17 修改清单已列入 `web/src/app/studio/works/page.tsx`（line 838）+ `web/src/features/community/work-editor.ts`（line 839）；§11 新增 I-14 把 owner-side fail-closed 提为 invariant；§10.4 错误码字典新增 `moderated_work_owner_locked` 行（含中文文案 + 触发场景），与 §9.8.1 / I-14 对齐。 |
| **F-2** [minor][D6/D1] §8.3 `(surface, sectionKind)` order_index 重复不变量 | ✅ 已闭合 | §11 新增 I-13：「同一 `(surface, sectionKind)` 内允许多个 `curated_slots.order_index` 重复；公开渲染层一律按 `(order_index ASC, sectionKind ASC, targetKey ASC)` 三层稳定排序；`upsertSlot` / `reorderSlot` 不强制唯一性」，与 SRS §8.3 不变量同步。 |
| **F-3** [minor][D5] in-memory `bundle.audit` 行为契约统一 | ✅ 已闭合 | §12 「`bundle.audit` 兼容（in-memory 行为契约统一）」明确：in-memory bundle **必须**实现真实 `record` / `listLatest`（维护内部 array + 按 `created_at desc, id desc` 返回最新 N 条），并解释「否则 FR-005 测试不能在 in-memory 路径断言 hide → audit append → audit list 反映新条目」；同时把 `withTransaction` 在 in-memory 是 noop 的语义独立写出。 |
| **F-4** [minor][D2] double-log 设计意图 | ✅ 已闭合 | §12 「Double-log 设计意图（NFR-003）」用一段说明：外层 `wrapServerAction` 与内层 `runAdminAction` 各产一条结构化日志是显式选择，外层走通用 server-action 计时，内层带 `actionName=admin/<...>` 便于按 module 过滤；并显式说明每条 log 体积在 §3.8 V1 8 KiB 上限内，无存储压力。 |
| **F-5** [minor][D4] CON-001..006 在 ADR 表无独立锚点 | ✅ 已闭合 | §16 新增 ADR-6「CON 锚点显式归集（响应 design review F-5）」，逐条把 CON-001..006 锚定回到 ADR-1..5 / UI-ADR-1..5 / §10.3 a11y 表 / §9.6；并明确 ADR-6 不引入新技术决策，仅 traceability 整理。 |

### 维度评分增量

| ID | 维度 | 上轮 | 本轮 | 增量说明 |
|---|---|---|---|---|
| `D1` | 需求覆盖与追溯 | 8/10 | 9/10 | FR-004 #6 owner 侧闭环；§3 表格未变但 §17 已补齐两行修改条目 |
| `D2` | 架构一致性 | 8/10 | 9/10 | double-log 意图显式认领，readers 不再误读为冗余 |
| `D3` | 决策质量与 trade-offs | 9/10 | 9/10 | 不变 |
| `D4` | 约束与 NFR 适配 | 8/10 | 9/10 | ADR-6 CON 归集 |
| `D5` | 接口与任务规划准备度 | 6/10 | 9/10 | task-planning gap 闭合（owner-side 路径 + in-memory audit 契约） |
| `D6` | 测试准备度与隐藏假设 | 7/10 | 9/10 | I-13 / I-14 新增；in-memory audit 行为契约唯一化 |

无任一维度低于 6/10，且无任一维度低于 8/10 的可冷读 gap。

### 结论（升级后）

**通过**

- 5 条 finding 全部 ✅ 闭合，且修订内容与 SRS / 既有代码（`auth-store.ts` JOIN、`community/sqlite.ts` `curated_slots` PK、`metrics.ts` recommendations 命名空间、`work-editor.ts` `resolveNextVisibility`、`/studio/works/page.tsx` status 二态文案）均一致。
- 无新增 finding。
- 规格未漂移，approval evidence 稳定。

### 下一步

- `设计真人确认`：本节点（架构 / 模块 / API / 数据模型 / 后端 NFR）已通过；不直接进入 `hf-tasks`，需等并行的 `hf-ui-review` 也返回通过后，由父会话联合发起设计真人确认。
- 不需要 `reroute_via_router`。
- `needs_human_confirmation = true`（含义：联合 UI review 通过后，由父会话写 approval record；reviewer subagent 不代笔 approval）。
