# Spec Review — Phase 2 Ops Back Office V1

- 主题: Phase 2 — Ops Back Office V1（运营 / 审核后台 V1）
- Spec under review: `docs/specs/2026-04-19-ops-backoffice-v1-srs.md`（草稿）
- Increment record: `docs/reviews/increment-phase2-ops-backoffice-v1.md`
- ROADMAP source of truth: `docs/ROADMAP.md` §3.2
- Workflow profile: `full`；Execution Mode: `auto`
- Reviewer: hf-spec-review subagent
- Date: 2026-04-19

## Precheck

- 存在稳定可定位的规格草稿：是（`docs/specs/2026-04-19-ops-backoffice-v1-srs.md`）。
- route/stage/profile 已明确：是（`hf-specify` → `hf-spec-review`，profile=full）。
- 上游证据一致：是（增量记录 §状态回流明确指向 `hf-spec-review`；ROADMAP §3.2 与变更包对齐）。
- → 通过 precheck，进入正式 rubric。

## 结构契约判断

`AGENTS.md` 未声明强制骨架；当前规格沿用项目既有规格风格（参考已批准的 `docs/specs/2026-04-19-discovery-intelligence-v1-srs.md`）：背景 / 目标与成功标准 / 角色与场景 / 范围 / 范围外 / FR / NFR / 数据契约 / 约束 / 假设 / 影响 / Trace Anchor。骨架与既有规格同形，结构契约通过。

## Rubric 评分

| Group | 维度 | 评分 | 说明 |
|-------|------|------|------|
| Q1 Correct | 来源回指 | 9 | 每条 FR 末尾都带 §3.2 + 增量记录锚点；§12 Trace Anchor 索引完整。 |
| Q2 Unambiguous | 模糊词量化 | 9 | NFR-001 给出 ≤80ms / ≤500 works / ≤200 audit / ≤50 slots；env 解析、redirect 路径、状态值都精确写明。 |
| Q3 Complete | 输入/输出/边界 | 8 | 关键边界覆盖（empty admin list、非法 status transition、非法 surface、不存在 workId、目标对象已删除）；slot `order` 唯一性未显式约束（见 finding F-3）。 |
| Q4 Consistent | 一致性 | 8 | 整体一致；FR-008 文字与列表数量不一致（写"5 个 counter"但列出 6 个，见 finding F-1）。 |
| Q5 Ranked | 优先级 | 7 | 8 条 FR 全部 Must；对 V1 最小后台 shell 可辩护，但缺少层次（见 finding F-4）。 |
| Q6 Verifiable | 可验收 | 9 | 全部 Given/When/Then；可形成通过/不通过判断。 |
| Q7 Modifiable | 无重复 | 9 | 同一概念集中（admin guard 在 FR-001、env 在 FR-007、metrics 在 FR-008），未发现互相矛盾。 |
| Q8 Traceable | ID/Source | 9 | FR-001 ~ FR-008、NFR-001 ~ NFR-005、CON-001 ~ CON-006、A-001 ~ A-004 全部稳定 ID。 |
| A1 模糊词 | — | 9 | 未发现"快/稳/友好"类口号。 |
| A2 复合需求 | — | 8 | FR-003（list+add+remove+reorder）与 FR-006（多 surface 屏蔽）属功能内聚拆分，可接受；FR-002 dashboard + studio 入口卡轻度复合，但语义同属"导航入口"。 |
| A3 设计泄漏 | — | 7 | 大量提到具体路径、函数名、表名、env 名（与已批准 Discovery Intelligence V1 风格一致，属项目惯例）；不强制扣分但需关注（见 finding F-5，仅 minor）。 |
| A4 无主体被动 | — | 9 | Given/When/Then 主体明确。 |
| A5 占位/TBD | — | 10 | 关键需求中无 `TBD`/`待确认`。 |
| A6 负路径 | — | 9 | 覆盖 guest / 非 admin / draft 误改 / 不存在 workId / 不存在 targetKey / 名单为空 / env 非法等。 |
| C1 Requirement contract | — | 10 | 每条 FR 都有 ID/Statement/Acceptance/Priority/Source。 |
| C2 Scope closure | — | 10 | §4 / §5 范围内/外清晰；明确不做举报队列、账号管理、profile 处置、双人复核、REST 端点、rate limit。 |
| C3 Open-question closure | — | 10 | 无阻塞性开放问题；§10 假设清单只含可回读 assumption。 |
| C4 Template alignment | — | 10 | 与项目既有 spec 模板同形。 |
| C5 Deferral handling | — | 9 | §5 与 ROADMAP §3.2 / §4 优先级 2 已显式对齐 deferred 范围。 |
| C6 Goal & success criteria | — | 9 | §2 包含具体可判断的 success criteria（路径、状态、SSR 行为、env 默认）。 |
| C7 Assumption visibility | — | 9 | A-001 ~ A-004 显式；失效影响（admin 名单为空 ⇒ 默认拒绝、`audit_log` 体积 ⇒ 不分区）可回读。 |
| G1 Oversized | — | 8 | 未明显命中 GS1-GS6；FR-006 跨多个公开 surface 但属同一过滤语义。 |
| G2 Mixed release | — | 9 | 与后续 slice（举报队列、账号管理、复杂内容审核、log redaction）切分清晰，未在 FR 中混写。 |
| G3 Repairable scope | — | 10 | 即便存在 finding，也可在 1 轮内定向修订。 |

## 发现项

- [minor][LLM-FIXABLE][Q4] `FR-008` 描述写"预注册 **5** 个 counter"，但下方列表实际列出 **6** 个（`admin.curation.added/removed/reordered` + `admin.work_moderation.hidden/restored` + `admin.audit.appended`），且其首条验收也写"6 个 counter 全部为 0"。文字与清单/验收不一致，应统一为 6。
- [minor][LLM-FIXABLE][A2] `FR-003` 验收里把"添加 / 删除 / 重排 / upsert 视为更新 / 非法输入 / 目标不存在"全部塞在一条 FR 中，可在不改变 V1 范围的前提下保持当前粒度（功能内聚），但建议在 §11 出口工件部分以 task 维度拆分时显式映射到独立 server action 测试集，便于 `hf-tasks` 拆分。
- [minor][LLM-FIXABLE][Q3] `FR-003` 重排验收"仅按提交值写入；不进行整体重排算法"未显式声明同一 `(surface, sectionKind)` 内 `order_index` 是否允许重复（现状假设允许，由公开 read model 自身二次稳定排序兜底）。建议在 `FR-003` 验收或 §8.3 不变量加一句"同一 surface 内 `order_index` 允许重复，公开渲染层按 `(order_index, slot.id)` 稳定排序"以避免设计阶段反复。
- [minor][LLM-FIXABLE][Q5] 全部 8 条 FR 都标 `Must`。对 V1 最小后台 shell 可辩护（缺任一条会破坏入口/审计/可观测性闭环），但仍建议在 §6 顶部加一句"V1 范围内所有 FR 互为前置，故全部 `Must`"显式说明，避免后续 review 误判优先级单一。
- [minor][LLM-FIXABLE][A3] §6 / §11 大量提及具体文件路径与函数名（`wrapServerAction`、`createInMemoryCommunityRepositoryBundle`、`getPublicWorkPageModel`、`MetricsRegistry` 等）。与已批准 `discovery-intelligence-v1-srs.md` 风格一致，属项目惯例可接受；如希望降低设计耦合，可在 `hf-design` 阶段把"具体函数名"下沉到设计文档，规格只保留契约级 Statement，不阻塞通过。

## 缺失或薄弱项

- §8.3 不变量描述"业务写动作 + 一次 `auditLog.record` 在同一个事务边界（V1 串行调用）"较弱：实际上 sqlite 同进程内串行调用并未构成事务（两条 SQL 之间宕机仍可能写一不写二）；这是设计阶段需明确的"组合一致性策略"（要么显式 `BEGIN/COMMIT` 包裹，要么补"反向修复 / 启动期一致性扫描"），不影响规格通过，但建议在 `hf-design` 阶段强制收口；规格本身不需补字段。
- `FR-004` 中"owner 自己访问 `/studio/works` 仍能看到 `moderated` 作品（含『已隐藏』标识）"是新行为，与既有 `studio/works` 列表模型默认仅显示 owner 自己作品的过滤路径耦合；规格层叙述清楚（验收齐备），但 `WorkRepository` 是否需要新增 `listForOwnerIncludingModerated` 之类能力，留给设计回答即可。
- `FR-005` 验收要求"audit 列表 100 条 SSR 单次 SELECT，不允许 N+1"。`actor_email` 字段已直接落 `audit_log` 列，`target_id` 不在列表页 join 目标对象，N+1 风险天然避免；该验收清晰可测。

## 结论

通过

- 规格范围清晰、与 ROADMAP §3.2 与增量记录一致，FR/NFR/CON/A/Trace Anchor 五要素齐备；负路径与 fail-closed 行为均显式覆盖；deferred 与 scope-out 与下一 slice 清晰切分。
- 仅存在数处 LLM-FIXABLE 的 minor finding（FR-008 计数文字、`order_index` 重复语义、Must 集中说明），均不阻塞设计入场。
- 无 USER-INPUT 类阻塞问题；无 route / stage / 证据冲突。

## 下一步

- `规格真人确认`（auto 模式：父会话写 approval record，再进入 `hf-design`）。

## 记录位置

- `docs/reviews/spec-review-phase2-ops-backoffice-v1.md`

## 交接说明

- 通过 `hf-spec-review` 后须由父会话执行 approval step（auto 模式写入 `docs/verification/spec-approval-phase2-ops-backoffice-v1.md` 等价批准记录），再进入 `hf-design`；reviewer 不代替父会话写批准结论。
- 上述 minor finding 可在 approval 后或 `hf-design` 收尾前由 `hf-specify` 顺手收敛，亦可在设计阶段一并消化（`Q4` FR-008 计数错配建议在批准前最小修订以保持规格自洽）。
