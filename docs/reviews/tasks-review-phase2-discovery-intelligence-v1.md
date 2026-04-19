# Tasks Review — Phase 2 — Discovery Intelligence V1

- 评审日期: 2026-04-19
- 主题: Phase 2 — Discovery Intelligence V1（规则化 Related Creators / Related Works）
- 输入任务计划: `docs/tasks/2026-04-19-discovery-intelligence-v1-tasks.md`（DRAFT）
- 输入规格: `docs/specs/2026-04-19-discovery-intelligence-v1-srs.md`（已批准）
- 输入设计: `docs/designs/2026-04-19-discovery-intelligence-v1-design.md`（已批准）
- 上游 review / approval: `docs/reviews/spec-review-phase2-discovery-intelligence-v1.md`、`docs/reviews/design-review-phase2-discovery-intelligence-v1.md`、`docs/verification/spec-approval-phase2-discovery-intelligence-v1.md`、`docs/verification/design-approval-phase2-discovery-intelligence-v1.md`
- 风格基线: `docs/tasks/2026-04-19-observability-ops-v1-tasks.md`
- Workflow profile: `full`，Execution mode: `auto`

## 0. Precheck

| 项 | 结论 |
|---|---|
| 任务计划稳定可定位 | ✅ DRAFT 路径稳定 |
| 上游 spec approval 可回读 | ✅ `docs/verification/spec-approval-phase2-discovery-intelligence-v1.md` 存在 |
| 上游 design approval 可回读 | ✅ `docs/verification/design-approval-phase2-discovery-intelligence-v1.md` 存在 |
| route / stage / profile 一致 | ✅ profile=full, stage=tasks-review, route=Phase 2 — Discovery Intelligence V1 |

Precheck pass，进入正式审查。

## 1. 多维评分

| 维度 | ID | 评分 | 备注 |
|---|---|---|---|
| 可执行性 | TR1 | 9/10 | T52 ~ T56 颗粒合适，每项都是单文件簇 + 单文档闭环可执行；无"实现某模块"式大任务。 |
| 任务合同完整性 | TR2 | 7/10 | 全部任务都写了 `Acceptance / Files / 测试设计种子 / Verify / Dependency / Selection Priority / 完成条件`；但 T56 的 `目标` 与 `Files` 与 §11 修订记录、与 T52 的 view-beacon.tsx 已放宽事实存在直接矛盾，需要修订（见 Finding F-1）。 |
| 验证与测试设计种子 | TR3 | 9/10 | 每项任务都给出主行为 / 关键边界 / fail-first 点 / 可测试性（NFR-005）四类要点；含 micro-bench 协议（T54/T55）；MetricsSnapshot 加性扩展、disabled DOM 无 beacon、profile-map 单次构建等关键不变量都被显式写入种子。 |
| 依赖与顺序 | TR4 | 7/10 | 主线 `T52 → T53 → T54/T55 → T56` 与设计 §16 ADR-3 / R-4 一致；T54/T55 并行授权由 router 决定也合理。但 T56 的 `Ready When`（"T54/T55 至少有一个通过"）与 §9 queue projection（`Depends On: T52, T54, T55`）/§6 拓扑图存在表述漂移（见 Finding F-2）。无循环依赖。 |
| 追溯覆盖 | TR5 | 9/10 | §4 trace 表把 FR-001 ~ FR-008、NFR-001 ~ NFR-005、§11 I-1 ~ I-12、ADR-1 ~ ADR-5 全部映射到具体任务，无 orphan 需求；MetricsSnapshot 加性扩展（ADR-3）、view-beacon 类型放宽（ADR-2）等关键设计决策都有专属任务承接；FR-008 #3「单次 repository 读」在 T54/T55 测试种子中显式 spy `listPublicProfiles` / `listPublicWorks` 调用次数 = 1。 |
| Router 重选就绪度 | TR6 | 8/10 | §8 选择规则唯一（按 Selection Priority 升序选 ready 集合首项），§9 queue projection 表稳定可回读，§6 拓扑图配合 §10 R-4 修订记录给出清晰的"何时谁 ready"叙事。仅 F-2 的依赖表述漂移会影响 router 在 T55 完成后是否能立即选 T56 的判断。 |

任一维度均 ≥ 6，但有 2 处需定向回修才能进入 approval step。

## 2. 正式 Checklist 审查（详见 `references/review-checklist.md`）

### 2.1 TR1 可执行性

- 5 个任务都具备冷启动可执行性：T52 是 cross-cutting 骨架（无业务 IO）；T53 是纯函数；T54/T55 是对称的端到端模块；T56 是类型穷尽性收口。
- 没有"实现某模块"式大任务；T54/T55 把编排 + section + 接入页拆为同一个任务是合理的（均使用同一个 fake bundle 测试栈，拆开会带来反复 plumbing 成本）。
- 无任何任务依赖多个未稳定上游：T52 无依赖；T53 仅依赖 T52；T54/T55 仅依赖 T52/T53。

### 2.2 TR2 任务合同完整性

- T52 ~ T56 全部具备：`目标` / `Acceptance` / `依赖` / `Ready When` / `初始队列状态` / `Selection Priority` / `Files / 触碰工件` / `测试设计种子` / `Verify` / `预期证据` / `完成条件`。
- 关键 acceptance 都把"怎样算完成"写到了具体的代码契约层（如 T52 写明 `MetricsSnapshot.recommendations` 顶层结构 + 初始全 0；T54/T55 写明 4 条主路径 + counter / logger 调用形态；T56 写明 happy path POST 入库 + sendBeacon 一次）。
- ⚠️ Finding F-1：T56 `目标` / `Acceptance #1` / `Files / 触碰工件` 仍声称"放宽 view-beacon.tsx 的 eventType 类型 + 修改 view-beacon.tsx"，与 §11 修订记录与 T52 已经把 view-beacon.tsx 类型放宽（type-only）纳入 acceptance + Files 的事实直接重复 / 矛盾。

### 2.3 TR3 验证与测试设计种子

- 每个任务的测试设计种子都按 `主行为 / 关键边界 / fail-first 点 / 可测试性 (NFR-005)` 四要素展开，足够支持下游 `hf-test-driven-dev` 进入测试设计。
- 关键 fail-first 点显式写入：
  - T52：`DiscoveryEventType` 中 `related_card_view` 必须可被显式断言；`MetricsSnapshot.recommendations` 4 字段在零状态全为 0；权重不变量。
  - T53：`score ∈ [0,1]`；权重为 0 时贡献为 0；同输入幂等。
  - T54/T55：`spy listPublicProfiles / listPublicWorks 调用次数 = 1`（FR-008 #3）；I-11 disabled 时 DOM 中无 beacon；profile-map 单次构建（R-3）。
  - T56：fallback fetch 路径覆盖；既有 work_view / profile_view 路径不变。
- micro-bench 协议（T54/T55）参考设计 §13.1 的"100 名 / 200 篇候选 + 1000 次顺序调用 + P95 ≤ 30ms"，并在 §10 R-5 给出 P99 ≤ 50ms 的 CI 退化兜底，避免"测试不稳就降级实现"的反模式。

### 2.4 TR4 依赖与顺序

- 设计 §11.2 ADR-3 + §15 R-4 都强调"先放宽 view-beacon 类型，再让 T54/T55 写入 beacon 调用"；本计划 §10 R-4 + §11 修订记录把 view-beacon.tsx 类型放宽（type-only）从 T56 移到 T52，是合理的顺序修复。
- 主线拓扑：`T52 → T53 → {T54, T55} → T56`，与设计 §16 ADR-3 / §17 出口工件一致。
- T54 / T55 同优先级（3 / 4），按字典序选 T54 先；并行授权交给 router，符合 §8 选择规则唯一性。
- ⚠️ Finding F-2：T56 `Ready When` 写"T52 通过 + T54 / T55 至少有一个通过"，但 §9 queue projection 表写 `Depends On: T52, T54, T55`，§6 拓扑图也含"T56 also requires T52"以及 T55 → T56 的边。三处表述对"T54 / T55 是 AND 还是 OR"不一致；router 在 T55 完成（但 T54 仍 pending 的并行场景）时无法稳定决定 T56 是否 ready。

### 2.5 TR5 追溯覆盖

逐项核对 spec / design 的关键工件，均有任务承接：

| 上游条目 | 落地任务 | 备注 |
|---|---|---|
| FR-001 Related Creators | T54（接入 + 编排 + section）、T53（评分） | ✅ |
| FR-002 Related Works | T55（接入 + 编排 + section）、T53（评分） | ✅ |
| FR-003 纯函数打分 | T53 | ✅ |
| FR-004 Feature flag + 零回归 | T52（env + config）、T54/T55（编排层闭合） | ✅ |
| FR-005 `related_card_view` | T52（DiscoveryEventType 扩展 + view-beacon type 放宽）、T54/T55（section beacon）、T56（route handler 类型放宽 + 测试） | ✅；F-1 影响 T56 表述 |
| FR-006 `recommendations.*` Metrics | T52（MetricsSnapshot 加性扩展 + key 常量）、T54/T55（编排层 increment） | ✅ |
| FR-007 候选上限 + 稳定排序 | T53 | ✅ |
| FR-008 SSR 性能 / 安全降级 | T54/T55（单次 repository 读 + try/catch + micro-bench） | ✅ |
| NFR-001 性能 ≤ 30ms | T54/T55 + Increment 级 regression-gate | ✅ |
| NFR-002 隐私 | T54/T55/T56 | ✅ |
| NFR-003 可观测性 | T54/T55 | ✅ |
| NFR-004 可测试性 | T52 ~ T56 | ✅ |
| NFR-005 兼容性 | T54/T55/T56 | ✅ |
| §11 I-1 ~ I-12 | T53（I-1, I-2, I-7）、T54/T55（I-3, I-5, I-8, I-10, I-11, I-12）、T56（I-4, I-9）、T52（I-6） | ✅ |
| ADR-1 候选获取单次读 | T54/T55 | ✅ |
| ADR-2 beacon 类型放宽 | T52（view-beacon.tsx type-only）+ T56（route handler + 测试） | ✅ 但表述需修订（F-1） |
| ADR-3 MetricsSnapshot 加性扩展 | T52 | ✅ |
| ADR-4 flag 单点闭合 | T54/T55 | ✅ |
| ADR-5 权重表 + 不变量单测 | T53 | ✅ |
| §17 出口工件 | §3 任务计划"新增 / 修改"清单全部映射 | ✅ |

无 orphan 需求。

### 2.6 TR6 Router 重选就绪度

- §8 选择规则唯一（"按 Selection Priority 升序选 ready 集合首项"），并明确 router 才是 ready 集合的权威决策者。
- §9 queue projection 是稳定可回读的扁平表，不依赖会话上下文。
- ⚠️ F-2 影响 router 在并行场景下的稳定性：若 T54 / T55 并行执行且 T55 先完成，按 §5 T56 的"至少有一个"则 T56 已可 ready；按 §9 表则仍未 ready。需要表述统一。

### 2.7 verify 链路一致性

- T52 ~ T56 全部统一为 `cd web && npm run test && npm run typecheck && npm run lint && npm run build`，与 `web/AGENTS.md` 与上一个增量 (Phase 2 — Observability & Ops V1) 的任务计划完全对齐。✅

## 3. Findings

### F-1（important / LLM-FIXABLE / TR2 + TR4 / 锚点：T56）

**问题**：T56 `目标`、`Acceptance #1` 与 `Files / 触碰工件` 仍声称"放宽 view-beacon.tsx 的 eventType 类型"并把 `web/src/features/discovery/view-beacon.tsx` 列入 T56 修改清单，与 §11 修订记录、§10 R-4 缓解措施、以及 T52 acceptance（已把 view-beacon.tsx 类型放宽 type-only 纳入自身完成判定）直接矛盾；T52 与 T56 同时声明"放宽同一文件同一处类型"，会让两次 fail-first 都尝试同一处 type 改动，并让 traceability-review 难以判定该改动归属哪个任务。

**期望整改**：

- 把 T56 `目标` 改写为「`view-beacon.test.tsx` 增加 `related_card_view` 渲染用例 + `web/src/app/api/discovery-events/route.ts` 本地 `DiscoveryEventRequestBody.eventType` 放宽 + `route.test.ts` 增加 happy path」，去掉"放宽 view-beacon.tsx 的 eventType 类型"的措辞。
- 把 T56 `Acceptance #1` 改写为「（T52 已经放宽 view-beacon.tsx 的 eventType 类型）`<DiscoveryViewBeacon eventType="related_card_view" ... />` 在 §T54 / §T55 中编译通过；既有 work_view / profile_view 调用点不变。」
- 把 T56 `Files / 触碰工件` 中的 `view-beacon.tsx` 删除，仅保留 `view-beacon.test.tsx`、`route.ts`、`route.test.ts`。

### F-2（minor / LLM-FIXABLE / TR4 + TR6 / 锚点：T56）

**问题**：T56 `Ready When` 写"T52 通过 + T54 / T55 至少有一个通过"，但 §9 queue projection 表 `Depends On` 列写 `T52, T54, T55`，§6 拓扑图也包含 T55 → T56 与"T56 also requires T52"两条边。三处表述对"T54 / T55 是 AND 还是 OR"不一致，router 在 T54 / T55 并行 + T55 先完成的场景下无法唯一判断 T56 是否 ready。

**期望整改**：把 T56 `Ready When` 与 §9 queue projection 与 §6 拓扑图统一为 AND 语义（即 `T56 严格依赖 {T52, T54, T55}`），并在 §6 narrative 中解释"虽然 T56 与 T54 / T55 的依赖只是测试覆盖意义上的耦合，但为了避免在 T54 / T55 任一未完成时 route handler 测试出现遗漏，仍按 AND 串行"。

## 4. 缺失或薄弱项

- 无 `Acceptance / Files / Verify / 测试设计种子 / Selection Priority / Dependency` 缺项。
- `task-progress.md` 当前活跃任务标记 `T52`，与 §9 表中 T52 = ready 一致。
- 风险（§10 R-1 ~ R-5）已显式覆盖 R-4（view-beacon 类型放宽顺序）与 R-5（micro-bench CI 不稳兜底），与 design §15 风险表对齐。

## 5. 结论

需修改

- 全部 6 维评分均 ≥ 7，无任何关键维度 < 6；
- 但 F-1（important）与 F-2（minor）都是 LLM-FIXABLE 的定向回修，在 T56 任务合同 + §6 / §9 依赖表述层面统一即可消除；
- 修订完成后建议再走一轮 `hf-tasks-review` 以确认 T56 表述与依赖语义一致。

## 6. 下一步

- 推荐 skill：`hf-tasks`
- 不需要回 `hf-workflow-router`（无 route / stage / profile / 上游证据冲突）
- `needs_human_confirmation`：`false`（结论 = 需修改）
- `reroute_via_router`：`false`

## 7. 记录位置

- 本记录：`docs/reviews/tasks-review-phase2-discovery-intelligence-v1.md`

## 8. 结构化返回 JSON

```json
{
  "conclusion": "需修改",
  "next_action_or_recommended_skill": "hf-tasks",
  "record_path": "/workspace/docs/reviews/tasks-review-phase2-discovery-intelligence-v1.md",
  "key_findings": [
    "[important][LLM-FIXABLE][TR2+TR4] T56 的『目标 / Acceptance #1 / Files』仍声称放宽 view-beacon.tsx 的 eventType 类型并把该文件列入修改清单，与 §11 修订记录与 T52 已经包含 view-beacon.tsx 类型放宽（type-only）的事实直接矛盾，需要把 T56 这部分改写为『T52 已放宽，本任务仅扩展 view-beacon.test.tsx + route handler + route.test.ts』并从 T56 Files 中删除 view-beacon.tsx。",
    "[minor][LLM-FIXABLE][TR4+TR6] T56 `Ready When` 写『T52 通过 + T54 / T55 至少有一个通过』，但 §9 queue projection 表写 `Depends On: T52, T54, T55`、§6 拓扑图含 T55 → T56 边；三处对 T54/T55 是 AND 还是 OR 不一致，会让 router 在并行场景下无法唯一判断 T56 是否 ready，需统一为 AND 语义。"
  ],
  "needs_human_confirmation": false,
  "reroute_via_router": false,
  "finding_breakdown": [
    {
      "severity": "important",
      "classification": "LLM-FIXABLE",
      "rule_id": "TR2",
      "summary": "T56 view-beacon.tsx 类型放宽与 T52 重复声明，Files / Acceptance / 目标都需修订"
    },
    {
      "severity": "minor",
      "classification": "LLM-FIXABLE",
      "rule_id": "TR6",
      "summary": "T56 Ready When 与 §9 queue projection / §6 拓扑图对 T54/T55 是 AND 还是 OR 表述漂移"
    }
  ]
}
```

## 复审 (2026-04-19)

针对首轮 `需修改` 的两条 finding，对修订后的 `docs/tasks/2026-04-19-discovery-intelligence-v1-tasks.md` 做定向复核。

### 复核证据

| Finding | 复核锚点 | 证据 | 状态 |
|---|---|---|---|
| F-1（important / TR2+TR4）T56 view-beacon.tsx 类型放宽与 T52 重复声明 | T56 `目标` | 现写「（`view-beacon.tsx` 的 `eventType` 类型放宽已在 `T52` type-only 完成）`web/src/app/api/discovery-events/route.ts` 本地 `DiscoveryEventRequestBody.eventType` 从 `"work_view" \| "profile_view"` 放宽至完整 `DiscoveryEventType`；`view-beacon.test.tsx` 与 `route.test.ts` 新增覆盖 `related_card_view` 路径的 vitest 用例」 | ✅ 已闭合 |
| F-1 续 | T56 `Acceptance #1` | 现写「（`T52` 已放宽 `view-beacon.tsx` 的 `eventType` 类型）`<DiscoveryViewBeacon eventType="related_card_view" ... />` 在 §T54 / §T55 中编译通过；既有 `work_view` / `profile_view` 调用点不变。」 | ✅ 已闭合 |
| F-1 续 | T56 `Files / 触碰工件` | 现仅包含 `web/src/features/discovery/view-beacon.test.tsx`（注明「仅测试，运行时类型已在 `T52` 放宽」）+ `web/src/app/api/discovery-events/route.ts` + `route.test.ts`；`view-beacon.tsx` 已从 T56 Files 中删除 | ✅ 已闭合 |
| F-2（minor / TR4+TR6）T56 与 §6/§9/§10 R-4 对 T54/T55 是 AND 还是 OR 表述漂移 | T56 `Ready When` | 现写「`T52` AND `T54` AND `T55` 三者 completion-gate 全部通过」 | ✅ 已闭合 |
| F-2 续 | T56 `依赖` | 现写「`T52`（DiscoveryEventType + view-beacon.tsx 类型已扩展）AND `T54` AND `T55`...AND 语义：必须 `T52 / T54 / T55` 三者全部通过 completion-gate，T56 才进入 `ready`。」 | ✅ 已闭合 |
| F-2 续 | §6 narrative | 现写「关键路径（图论依赖，AND 语义；与 §9 queue projection / §T56 Ready When 一致）：`T56` 严格依赖 `{T52, T54, T55}`（AND）」并补 narrative 说明为何 T56 需要 T54 与 T55 的 section 都已实现 | ✅ 已闭合 |
| F-2 续 | §6 选择规则叙事 | 「`T54` 与 `T55` 都通过后 → `T56` 进入 `ready`（AND 语义）」 | ✅ 已闭合 |
| F-2 续 | §9 queue projection | T56 行 `Depends On: T52, T54, T55`，与 §6 / T56 Ready When 一致 | ✅ 已闭合 |
| F-2 续 | §10 R-4 | 「将 `view-beacon.tsx` 的类型放宽（type-only）从 `T56` 移到 `T52`...`T56` 仅负责 `view-beacon.test.tsx` 测试用例 + `/api/discovery-events/route.ts` 本地类型放宽 + `route.test.ts` 用例。已在 §3 修改清单、§T52 acceptance 与 §T56 acceptance / Files 中统一体现。」 | ✅ 已闭合 |

### 维度复评

- TR2 任务合同完整性：7 → 9（T56 合同消除职责重复，acceptance / Files 与 T52 不再矛盾）
- TR4 依赖与顺序正确性：7 → 9（T56 Ready When / §6 / §9 / §10 R-4 四处 AND 语义一致；router 在 T54/T55 并行场景下能唯一判断 T56 是否 ready）
- TR6 Router 重选就绪度：8 → 9（依赖语义统一后 queue projection 完全可回读）
- 其余维度（TR1=9、TR3=9、TR5=9）保持不变。所有 6 维 ≥ 9，无任何遗留 finding。

### 残余备注（非 finding）

- §9 queue projection 表 T56 行 `Acceptance Headline` 仍沿用首版「view-beacon + /api/discovery-events 类型放宽（FR-005 收口）」措辞作为速览标签；正文（T56 §目标 / Acceptance / Files）已明确 view-beacon.tsx 类型放宽职责归 T52，speed-table 标签是为 router cold-read 提供的简称，不构成职责漂移。仅作记录，不需要回修。

### 新结论

通过

- F-1 / F-2 全部闭合，所有维度均 ≥ 9；
- 任务计划具备进入「任务真人确认」approval step 的条件；
- `next_action_or_recommended_skill = 任务真人确认`，`needs_human_confirmation = true`（auto 模式下父会话写 approval record 后即可进入 `hf-test-driven-dev` 推进 T52）；
- `reroute_via_router = false`。

### 复审后结构化返回 JSON

```json
{
  "conclusion": "通过",
  "next_action_or_recommended_skill": "任务真人确认",
  "record_path": "/workspace/docs/reviews/tasks-review-phase2-discovery-intelligence-v1.md",
  "key_findings": [
    "F-1 已闭合：T56 §目标 / Acceptance #1 / Files 全部明确 view-beacon.tsx 类型放宽职责归 T52，T56 仅负责 route handler 类型放宽 + view-beacon.test.tsx + route.test.ts；view-beacon.tsx 已从 T56 Files 删除。",
    "F-2 已闭合：T56 Ready When、依赖说明、§6 narrative、§6 选择规则叙事、§9 queue projection、§10 R-4 六处对 {T52, T54, T55} 全部使用 AND 语义。"
  ],
  "needs_human_confirmation": true,
  "reroute_via_router": false,
  "finding_breakdown": []
}
```

