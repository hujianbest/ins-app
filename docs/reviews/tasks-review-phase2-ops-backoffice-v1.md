# Phase 2 — Ops Back Office V1 任务计划评审记录

- 评审对象: `docs/tasks/2026-04-19-ops-backoffice-v1-tasks.md`（草稿）
- 已批准规格: `docs/specs/2026-04-19-ops-backoffice-v1-srs.md`
- 已批准设计: `docs/designs/2026-04-19-ops-backoffice-v1-design.md`
- 上游 approval: `docs/verification/spec-approval-phase2-ops-backoffice-v1.md`、`docs/verification/design-approval-phase2-ops-backoffice-v1.md`
- 风格基线: `docs/tasks/2026-04-19-discovery-intelligence-v1-tasks.md`
- 评审 skill: `.cursor/skills/harness-flow/skills/hf-tasks-review/SKILL.md`
- Workflow profile: `full`；Execution mode: `auto`
- 评审时间: 2026-04-19

## 1. Precheck

| 项 | 状态 |
|---|---|
| 任务计划草稿稳定可定位 | ✅（路径与状态明确，含队列投影 §9） |
| 上游规格 / 设计 approval evidence 可回读 | ✅ |
| route / stage / profile 一致 | ✅（与 increment 主题、approved spec/design 同主题；profile=full 路径完整链） |

→ Precheck 通过，进入正式 checklist。

## 2. 多维评分

| 维度 | 评分 | 关键说明 |
|---|---|---|
| `TR1` 可执行性 | 7/10 | `T57` 横切骨架包含 env / Session.email / sqlite schema + audit_log + curation writes / withTransaction / in-memory bundle / metrics snapshot / admin metrics keys 多项扩展，单任务体量较大，但 acceptance 已细化为 7 条工件级条目 + 显式 §10 风险表 R-1 / R-2 / R-4 缓解；属于「Walking Skeleton」可接受形态，与 T52 风格基线对齐。 |
| `TR2` 任务合同完整性 | 9/10 | 全 7 任务均含 `目标 / Acceptance / 依赖 / Ready When / 初始队列状态 / Selection Priority / Files / 测试设计种子 / Verify / 完成条件`；无 acceptance/verify 缺位。 |
| `TR3` 验证与测试设计种子 | 8/10 | 主行为 / 关键边界 / fail-first 点 / 可测试性四段结构齐备；T59 / T60 / T61 / T62 均显式列出 happy + invalid + not-found + tx rollback + 5 公开 surface 屏蔽等具体断言点；非空泛口号。 |
| `TR4` 依赖与顺序正确性 | 9/10 | §6 ASCII 图 + §9 队列表两处一致；`T58→{T57}`、`T59/T60→{T57,T58}`、`T61→{T57,T58,(T59∪T60)}`、`T62→{T57}`、`T63→{T58,T59,T60,T61}` 均与设计一致；无循环；`T63` 的 AND 语义在 §6 / §9 显式标注。 |
| `TR5` 追溯覆盖 | 8/10 | §4 追溯表对 FR-001..FR-008 / NFR-001..NFR-005 / ADR-1..ADR-6 / UI-ADR-1..5 / I-1..I-14 全部列出落地任务；个别 invariant 在任务 acceptance 内部仅隐含承接（详见 §3 Findings F-1 / F-2）。 |
| `TR6` Router 重选就绪度 | 9/10 | §8 给出唯一选择规则（拓扑序 + Selection Priority 升序）；§9 队列投影含 Status / Depends On / Priority / Acceptance Headline；ready 多候选时显式回落 `hf-workflow-router`。 |

无关键维度低于 6/10；满足通过下限（评分辅助规则第 1 条）。

## 3. Findings

> 所有发现项均为 minor / important，无 critical；不阻塞通过；建议在进入实现前由 `hf-tasks` 顺手补齐或在 `T57` 测试设计中显式覆盖。

- **F-1 [minor][LLM-FIXABLE][TR5/TA6]** I-5（`audit_log.id` 由 server action 生成 `randomUUID`，测试可注入）未在任何任务 acceptance 内显式锚定。当前 `T57` 仅描述 `bundle.audit.record/listLatest` 的 SQL 与 in-memory 实现，未要求 id 来源；建议 `T57` acceptance 增加一行「`AuditLogRepository.record` 在缺省 input.id 时调用 `crypto.randomUUID`，并允许测试通过 input.id 显式注入」，或在 `T59`/`T60` acceptance 中绑定到 server action 入口。
- **F-2 [minor][LLM-FIXABLE][TR5/TA6]** I-13（同一 `(surface, sectionKind)` 内允许多个 `order_index` 重复 + 公开渲染按 `(order_index ASC, sectionKind ASC, targetKey ASC)` 三层稳定排序）未在 `T57` 或 `T59` acceptance 中显式声明。`T57` 写到了 `upsertSlot` 的 `ON CONFLICT(surface, section_kind, target_key)`（不强制 order_index 唯一），逻辑实质已闭合；建议在 `T57` 测试设计种子中增加一条「order_index 重复 + 三层稳定排序断言」覆盖现有公开渲染路径。
- **F-3 [minor][LLM-FIXABLE][TR3/TA4]** `T60` 的「公开屏蔽闭环」对 `features/search` 的具体测试入口（哪个文件 / 哪个用例）只写了「视情况补」，留有解释空间。建议 `T60` 测试设计种子明确列出 search 集成断言文件名（如 `web/src/features/search/<existing>.test.ts`）以避免实现期再决定；不阻塞通过。
- **F-4 [minor][LLM-FIXABLE][TR2]** `T62` Files 列表里写「视情况修改 `web/src/features/community/work-actions.ts` 让错误 propagate」。该「视情况」边界来自 §9.8.1 与既有 `wrapServerAction` 行为；建议 `T62` 在测试设计种子中加一条「`work-actions.ts` 已自然 propagate AppError 的回归断言」明确判定，避免实现阶段歧义。

## 4. 缺失或薄弱项

- 无关键缺失；以上 F-1 / F-2 是不变量层面的细化建议，F-3 / F-4 是实现期消除歧义的提示。
- `T57` 体量虽大，但属于设计明确要求的横切骨架（设计 §17、§9 全部依赖该任务的类型 / repository / 事务语义先就位），与 `T52` 风格基线对齐；不强制拆分。

## 5. 用户专项关注点回应

1. **FR/NFR/I/ADR/UI-ADR 是否每条至少一个任务承接**：§4 追溯表覆盖 FR-001..FR-008、NFR-001..NFR-005、ADR-1..ADR-6、UI-ADR-1..5、I-1..I-14；其中 I-5 / I-13 仅隐式承接，已记入 F-1 / F-2。
2. **每个任务是否齐 `Acceptance / Files / Test seeds / Verify / Dependency / Selection Priority`**：全 7 任务（`T57`..`T63`）均齐备；并额外含 `Ready When` / `初始队列状态` / `完成条件`。
3. **依赖图一致性**：`T61→(T57∧T58∧(T59∪T60))`、`T63→(T58∧T59∧T60∧T61)` 在 §6 与 §9 两处一致表达；无循环；§6 图 ASCII 与 §1 拓扑叙事一致。
4. **`T57` 是否包含所有 type / schema / repository 扩展**：是。env (`ADMIN_ACCOUNT_EMAILS`) + `AuthenticatedSessionContext.email` + `auth_accounts.email JOIN` + `CommunityWorkStatus.moderated` + `WorkRepository.listAllForAdmin` + `CurationConfigRepository.{upsert,remove,reorder}Slot` + `AuditLogRepository.{record,listLatest}` + `audit_log` schema + index + `MetricsSnapshot.admin` + `ADMIN_COUNTER_NAMES` + `SqliteCommunityRepositoryBundle.withTransaction` + in-memory bundle 等价 + `bundle.works.listPublicWorks` 显式 `WHERE status='published'` 全部归集到 `T57`，排在所有业务任务（`T58`..`T63`）之前。
5. **Owner-side `T62` 位置 + 防 `moderated→published`**：`T62` 仅依赖 `T57`，与 `T58`..`T61` 互不阻塞（独立 lock；与 admin 写入入口解耦）；`resolveNextVisibility` 对 `currentWork.status === "moderated"` 任意 intent 抛 `AppError("moderated_work_owner_locked", 403)` 显式承接 I-14；`/studio/works` 抑制 publish / revert_to_draft / save_draft 三类按钮 + 显示申诉提示。FR-004 #6 闭环成立。
6. **Verify 链统一性**：全 7 任务 Verify 字段为 `cd web && npm run test && npm run typecheck && npm run lint && npm run build`；无遗漏 / 无杂项命令。

## 6. 结论

通过

- 6 个评审维度均 ≥ 7/10；无关键维度低于 6/10。
- 所有 finding 均为 minor，可在进入实现前顺手在 `T57` / `T60` / `T62` 的测试设计阶段补齐，不阻塞 approval。
- 建议进入「任务真人确认」approval step；`auto` 模式下由编排在 router 接管下完成 approval record。

## 7. 下一步

- `任务真人确认`（`needs_human_confirmation = true`）

## 8. 记录位置

- `docs/reviews/tasks-review-phase2-ops-backoffice-v1.md`

## 9. 交接说明

- 通过后，编排进入 `任务真人确认` 步骤；approval 完成后再以 `T57` 为 Current Active Task 进入 `hf-test-driven-dev`。
- F-1 / F-2 / F-3 / F-4 不强制 gate，建议在 `T57` test-design 阶段一并落入测试种子（特别是 audit id randomUUID + curation order_index 三层稳定排序）。
