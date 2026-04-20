# Tasks Review — Phase 2 Threaded Messaging V1

- 评审日期: 2026-04-19
- Reviewer: subagent (hf-tasks-review)
- Workflow profile: `full`
- Execution mode: `auto`
- 任务计划: `docs/tasks/2026-04-19-threaded-messaging-v1-tasks.md`
- 已批准规格: `docs/specs/2026-04-19-threaded-messaging-v1-srs.md`
- 已批准设计: `docs/designs/2026-04-19-threaded-messaging-v1-design.md`
- 上游 approval: `docs/verification/{spec,design}-approval-phase2-threaded-messaging-v1.md`
- 风格基线: `docs/tasks/2026-04-19-ops-backoffice-v1-tasks.md`

## Precheck

- 任务计划稳定可定位：✓
- 上游 spec / design approval evidence 可回读：✓
- route/stage/profile 一致（profile=full / auto）：✓
- → precheck 通过，进入正式审查。

## 多维评分

| ID | 维度 | 分数 | 说明 |
|---|---|---|---|
| TR1 | 可执行性 | 8/10 | 6 个任务粒度均匀，单任务可冷启动；无"实现某模块"式大任务；T64 横切骨架边界清晰。 |
| TR2 | 任务合同完整性 | 7/10 | 每个任务都有 `目标 / Acceptance / 测试种子 / Verify / 依赖 / Selection Priority`；但 §10 风险段的 R-1（in-memory bundle 自动初始化空 messaging）与 R-2（isDatabaseEmpty 排除 messaging 表）属硬约束未上升到 T64 Acceptance / 测试种子。 |
| TR3 | 测试设计种子 | 8/10 | T64 / T65 / T66 / T67 / T68 / T69 都列了主要行为 + 边界 + fail-first 点；少数地方（admin 不接触 messaging 的反向断言）缺独立种子。 |
| TR4 | 依赖与顺序 | 7/10 | §6 拓扑图 + §9 队列投影一致；T67 并行 T68 的 tie-break 规则清晰；但 §5 T69 "依赖: T65 + T67" 与 §9 投影 "T64, T65, T66, T67" 文本字面不一致（语义上可由传递依赖兜底）。 |
| TR5 | 追溯覆盖 | 7/10 | FR-001..008 / NFR-001..005 / ADR-1..6 / UI-ADR-1..5 / I-1..I-12 / A-007 全部至少有一个任务承接（§4 追溯表）；但 I-6（admin 不接触 messaging，design §15 建议字符串扫描断言）没有被任何任务显式承接。 |
| TR6 | Router 重选就绪度 | 9/10 | §8 + §9 给出唯一 active task 选择规则与稳定 queue projection；priority 升序 + tie-break 明确。 |

任一维度 ≥ 6，未触发硬否决。但存在 2 条 important + 3 条 minor，需要回修后再走"任务真人确认"。

## 发现项

### Important

- F1 `[important][LLM-FIXABLE][TR2/TR5]` **R-1 / R-2 未上升到 T64 Acceptance**。设计 §10 已经把这两条写成"缓解"：T64 in-memory bundle 在 `createInMemoryCommunityRepositoryBundle({...})` 没传 `messaging` 时必须自动初始化空 messaging（R-1）；sqlite `isDatabaseEmpty` 检查项**不**计入 messaging 三表（R-2）。但当前 T64 Acceptance 只写"in-memory bundle 加 messaging 数组实现 / sqlite 加 3 表 + 索引"，**没有**显式约束"既有调用方零修改"与"isDatabaseEmpty 行为不漂移"。下游 `hf-test-driven-dev` 由 Acceptance 推导 fail-first 测试，缺这两条会让既有 `community/sqlite.test.ts` / `community/test-support.test.ts` / `auth-store.test.ts` 等基线在实现期意外漂移。
  - 建议：把 §10 R-1 / R-2 的 "缓解" 内容上升到 T64 Acceptance 第 3-4 条，并在测试种子里追加：(a) `createInMemoryCommunityRepositoryBundle({ ...withoutMessaging })` 调用零修改、`bundle.messaging` 自动空实现可读；(b) `isDatabaseEmpty()` 在仅有 messaging 三表（无业务行）时仍返回 `true`（既有 baseline 行为不变）。

- F2 `[important][LLM-FIXABLE][TR4]` **T69 依赖声明字面不一致**。§5 T69 "依赖: T65 + T67"，§9 队列投影 "T64, T65, T66, T67"，§6 关键路径 "T69 严格依赖 {T64, T65, T66, T67}"。三处口径不同，router 重选时若机械读 §5 而非 §9，会误判 T69 的 ready 时机。
  - 建议：把 §5 T69 "依赖" 行改为 "T64, T65, T66, T67（与 T68 互不依赖）"，与 §9 / §6 完全一致。

### Minor

- F3 `[minor][LLM-FIXABLE][TR5]` **I-6 admin 模块零耦合检查未被任何任务承接**。设计 §15 风险表显式建议"单测加 `expect(...).not.toContain('messaging')` 字符串扫描 admin 模块"，spec FR-008 也把"admin 后台 4 路由不消费 `bundle.messaging`"列为验收。当前 T64 ~ T69 的 Acceptance / 测试种子均无此反向断言。
  - 建议：T64 测试种子追加一条"admin 模块（`features/admin/*` + `app/studio/admin/**`）字符串扫描断言不出现 `bundle.messaging` / `messaging.threads` 引用"，或在 T65 / T67 Acceptance 中显式声明。

- F4 `[minor][LLM-FIXABLE][TR3]` **T67 系统通知 counter 行为种子缺失**。设计 §9.6 + spec FR-005 已规定"每次 `/inbox` SSR 渲染算一次列出"（counter `messaging.system_notifications_listed += 1`）。T66 Acceptance 写到了 helper 内 counter 递增，但 T67 page 测试种子未独立断言"页面 SSR 一次 → counter +1"，也未列"双段都空时仍递增 / guest redirect 时不递增"两类边界。
  - 建议：T67 测试种子补一条 counter 断言（render 一次 → 递增 1；guest redirect 路径不递增）。

- F5 `[minor][LLM-FIXABLE][TR2]` **每任务"Files"字段未独立列出**。当前文件影响集中在 §3 全增量级聚合表；与基线 `ops-backoffice-v1-tasks.md` 同形（基线也走 §3 聚合 + 任务正文叙述）。本属可接受范式，但对 reviewer / router 冷启动友好度略低。非阻塞。
  - 建议（可选）：在每任务标题下补 1 行 "Files: <主文件>"（或保持现状，保留范式一致性）。

## 缺失或薄弱项

- §10 R-1 / R-2 与 T64 Acceptance 之间无显式 traceability（见 F1）。
- §15 设计风险中的 admin 模块字符串扫描断言无任务承接（见 F3）。

## 下一步

- `Next Action Or Recommended Skill`: `hf-tasks`
- `Needs Human Confirmation`: false（需修改路径）
- `Reroute Via Router`: false（无 route/stage/证据冲突；属内容级回修）

回修聚焦：F1 + F2（important）必修；F3 + F4 建议同轮修；F5 可保留现状。

## 记录位置

- `docs/reviews/tasks-review-phase2-threaded-messaging-v1.md`

## 交接说明

- `hf-tasks` 修订完后再走一次 `hf-tasks-review`；通过后才进入"任务真人确认" approval step → `hf-test-driven-dev`。

---

## 复审 (2026-04-19)

### 回修核对

| Finding | 复审证据 | 状态 |
|---|---|---|
| F1 (R-1 / R-2 / I-6 → T64 Acceptance) | T64 Acceptance 新增 3 条 bullet：**R-1** 显式要求 `createInMemoryCommunityRepositoryBundle({...})` 不传 `messaging` 时自动空实现、既有调用方零改；**R-2** 显式要求 `isDatabaseEmpty` 不计入 messaging 三表、空 messaging baseline 仍返回 `true`；**I-6** 显式要求 `features/admin/**` + `app/studio/admin/**` 字符串扫描 0 命中 `bundle.messaging` 等关键字。同时 T64 测试种子也追加了 R-1 / R-2 / I-6 三条对应 case。 | 已闭合 |
| F2 (T69 dependency wording) | T69 §5 "依赖" 行已更新为 "T64, T65, T66, T67（与 T68 互不依赖；page test 兼容新返回形态需 T67 已上线 inbox page 重写；与 §6 / §9 拓扑表完全一致）"，与 §6 关键路径 / §9 队列投影三处统一。 | 已闭合 |
| F3 (admin reverse assertion) | 折叠进 F1 的 I-6 bullet（T64 Acceptance + 测试种子双侧已承接）。 | 已闭合 |
| F4 (T67 counter test seed) | T67 测试种子末尾追加 "**counter 边界**：admin 渲染 1 次 → `messaging.system_notifications_listed` +1（含双段都空场景仍递增）；guest redirect 路径 → counter 不变"，覆盖 render +1 与 guest 不递增两类边界。 | 已闭合 |
| F5 (per-task Files row, minor) | 维持基线范式（与 ops-backoffice-v1 一致），不阻塞通过。 | 维持现状 |

### 复审多维评分（增量）

| ID | 维度 | 复审分数 | 变化说明 |
|---|---|---|---|
| TR1 | 可执行性 | 8/10 | 无变化 |
| TR2 | 任务合同完整性 | 9/10 | T64 Acceptance 3 条新 bullet（R-1 / R-2 / I-6）补齐硬约束 |
| TR3 | 测试设计种子 | 9/10 | T64 + T67 测试种子均补齐对应 case |
| TR4 | 依赖与顺序 | 9/10 | T69 三处一致 |
| TR5 | 追溯覆盖 | 9/10 | I-6 现由 T64 显式承接；R-1 / R-2 traceability 闭环 |
| TR6 | Router 重选就绪度 | 9/10 | 无变化 |

所有维度 ≥ 6；无 critical / important 残留。

### 复审结论

- 结论：**通过**
- `Next Action Or Recommended Skill`: `任务真人确认`
- `Needs Human Confirmation`: true
- `Reroute Via Router`: false

