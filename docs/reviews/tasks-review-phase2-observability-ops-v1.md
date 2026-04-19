# Phase 2 — Observability & Ops V1 任务计划评审记录

- 评审对象: `docs/tasks/2026-04-19-observability-ops-v1-tasks.md`
- 已批准规格: `docs/specs/2026-04-19-observability-ops-v1-srs.md`
- 已批准设计: `docs/designs/2026-04-19-observability-ops-v1-design.md`
- 关联 review: `docs/reviews/spec-review-phase2-observability-ops-v1.md`、`docs/reviews/design-review-phase2-observability-ops-v1.md`
- 关联 approval: `docs/verification/spec-approval-phase2-observability-ops-v1.md`、`docs/verification/design-approval-phase2-observability-ops-v1.md`
- 增量记录: `docs/reviews/increment-phase2-observability-ops-v1.md`
- 评审 skill: `hf-tasks-review`
- 评审者: tasks reviewer subagent（独立于任务起草者）
- Execution Mode: `auto`
- 评审日期: 2026-04-19

## 结论

通过

任务计划完整覆盖已批准设计的全部 FR / NFR / CON / ADR / I-N 不变量；6 个任务（`T46`~`T51`）按 INVEST 维度小到可在单任务内完成「fail-first → 实现 → verify chain 全绿」的完整循环；依赖图正确无环、关键路径合理；Selection Priority + 拓扑顺序使 router 重选行为唯一确定；Acceptance / Files / Verify / 测试设计种子 / 完成条件齐备；R-1 ~ R-5 已显式覆盖 reviewer 关注的高风险路径（I-7 server action 契约、`sqlite.backup` fallback、env hard-stop 测试隔离）。剩余 4 条均为 `minor`、`LLM-FIXABLE`，不影响进入「任务真人确认」与后续 `hf-test-driven-dev`，建议按需在确认前顺手回修，不影响 verdict。

## 维度评分

| 维度 | 分数 | 说明 |
|------|------|------|
| `TR1` 任务可执行性 | 8/10 | 6 个任务均冷启动可推进，每个任务都有自洽的 walking-skeleton-or-primitive 范围；扣分点是 `T49`（接入既有 server action / route handler）触碰 8+ 个 feature 子目录的多个文件，规模处于「单任务上限」。计划 §10 R-1 / R-4 已显式给出「逐文件单跑 vitest + PR 内子提交切分」的缓解，未触发 TA1。 |
| `TR2` 任务合同完整性 | 9/10 | 每个任务均显式具备 Acceptance、Files、Verify、Selection Priority、Ready When、初始队列状态、预期证据、完成条件。扣分点是 §2 里程碑段反复使用 `npm run verify`，但仓库 `web/package.json` 中 `verify` 脚本是 `lint && test && build`，**不**包含 `typecheck`；任务级 `Verify` 行已显式列出 `test && typecheck && lint && build` 完整四件套，存在 milestone 与 task 文案口径轻微不一致（详见 F-1）。 |
| `TR3` 验证与测试设计种子 | 9/10 | 每个任务的「测试设计种子」段都给出主行为 / 关键边界 / fail-first 点三类样本，足够 `hf-test-driven-dev` 进入测试设计；`T49` 还额外给出业务回归断言（既有 vitest 不变绿）。扣分点是 NFR-005「全部任务必须使用 in-memory primitives」在 §4 追溯表已声明，但单任务测试种子里没有逐条复述（详见 F-3）。 |
| `TR4` 依赖与顺序正确性 | 9/10 | §6 拓扑图 `T46 → {T47, T48, T50}; T49 ← {T46, T47, T48}; T51 ← T50` 与 §9 队列投影完全一致，无循环依赖；§5 各任务 `Depends On` 与 §6 / §9 三处口径一致。Selection Priority `1..6` + 拓扑顺序使每次完成 gate 后 router 重选唯一确定（即 `T46→T47→T48→T49→T50→T51`）。扣分点是 §5 `T48.Ready When` 仅写 `T46 completion-gate 通过`，§6 关键路径段又强调「关键路径必须串行 `T46 → T47 → T48 → T49`」——读起来像「`T48` 在拓扑上等 `T47`」，与 §9 投影表（`T48` Depends On 只有 `T46`）有轻微张力，需 §6 行文澄清这是「Selection Priority 强制串行」而非「图论依赖」（详见 F-2）。 |
| `TR5` 追溯覆盖 | 9/10 | §4 追溯表覆盖 FR-001..FR-009、NFR-001..NFR-005、ADR-1..ADR-5、设计 §11.2 I-1..I-7（除 I-4）；NFR-001 显式锚定到 `hf-regression-gate` 一次性执行（与设计 §13.3 / 设计 review F-5 修订一致）。扣分点是 I-4（单条 log ≤ 8 KiB 截断 + `truncated=true`）在 `T46` Acceptance 段实际已覆盖，但 §4 「设计 §11.2 I-1 ~ I-7 不变量」一行没有显式列出 I-4 的承接任务（详见 F-4）。 |
| `TR6` Router 重选就绪度 | 9/10 | §8「当前活跃任务选择规则」给出唯一可执行规则（completion-gate 通过后扫 pending → ready → 按 Selection Priority 升序选）；§9 队列投影表为机读结构，可冷读还原。规则把 `ready 集合包含多个候选时由 hf-workflow-router 决定` 显式写出，避免 `hf-test-driven-dev` 自行裁决。已通过该维度。 |

每个维度按 `references/review-checklist.md` 0–10 标尺评分，任一关键维度低于 6 不得 `通过`；当前最低 8，无 `通过` 阻断；维度 ≥ 1 低于 9 对应至少一条具体 finding。

## 发现项

### 关键

- 无。

### 重要

- 无。

### 次要

- `[minor][LLM-FIXABLE][TR2/TA3] F-1 §2 各 milestone「退出标准」反复写「`npm run verify` 全绿」，但 `web/package.json` 的 `verify` 脚本展开为 `npm run lint && npm run test && npm run build`，**不**包含 `typecheck`。`
  - 证据：`web/package.json` `scripts.verify` 字面量；规格无 typecheck override；任务级 §5 各任务 `Verify` 行均明写 `cd web && npm run test && npm run typecheck && npm run lint && npm run build`，是真正的 canonical chain。
  - 影响：milestone 段读起来像「跑 `npm run verify` 即可」，但实际任务完成条件需要 typecheck；reviewer 在 task-level `hf-test-driven-dev` 阶段冷读时容易产生「跑 `npm run verify` 就够了」的误读。
  - 修订建议（任选其一）：(a) 把 §2 所有 milestone「退出标准」中的「`npm run verify` 全绿」改写为「`npm run test / typecheck / lint / build` 全绿」与任务级 Verify 行对齐；或 (b) 在 `web/package.json` 中把 `verify` 脚本扩展为含 `typecheck`，并在计划开头声明「verify chain 包含 typecheck」。
  - 不阻塞 verdict：任务级 `Verify` 是 router 与 `hf-completion-gate` 真正消费的字段，已是 canonical chain。

- `[minor][LLM-FIXABLE][TR4] F-2 §6 关键路径段「`T46 → T47 → T48 → T49`（必须串行）」与 §9 队列投影表（`T48 Depends On = T46`）在「图论依赖」与「Selection Priority 强制串行」两层口径上读起来略有张力。`
  - 证据：§5 `T48.Ready When` 仅写 `T46 completion-gate 通过`；§9 `T48 Depends On = T46`；但 §6 行文用「必须串行」描述 `T48 → T49` 之外的 `T47 → T48` 关系。
  - 影响：从纯依赖图角度，`T46 completion` 之后 `T47`、`T48`、`T50` 都进入 `ready`，按 Selection Priority `2 < 3 < 5` 自然顺序 `T47 → T48 → T50` 推进；§6「必须串行」是对 Selection Priority 实际效果的口语化描述，并非额外硬约束。冷读 reviewer 可能误以为 `T48` 在图论上依赖 `T47`，与 §9 队列投影表不符。
  - 修订建议：把 §6 段「关键路径」一句改写为「关键路径（按 Selection Priority 串行）：`T46 → T47 → T48 → T49`；`T48` 在图论上仅依赖 `T46`，但 Selection Priority `2 < 3` 使 router 自然按 `T47 → T48` 顺序选取」，避免「依赖」与「调度」两层概念混淆。
  - 不阻塞 verdict：router 重选行为本身唯一确定。

- `[minor][LLM-FIXABLE][TR3] F-3 NFR-005「全部任务必须使用 in-memory primitives」仅在 §4 追溯表声明一次，单任务「测试设计种子」段未复述「禁止 mock 全局、必须用 createInMemoryLogger / createInMemoryReporter」字样。`
  - 证据：设计 §9 `observability/init` 提供 `resetObservabilityForTesting`、`test-support.ts` 提供 `createInMemoryLogger / createInMemoryReporter`；`T46`~`T51` 的「测试设计种子」段均未显式说「使用 in-memory primitive」字样，依赖任务执行者主动回查 §4 追溯表。
  - 影响：`hf-test-driven-dev` 阶段在写 fail-first 测试时如果忽略此点，可能引入全局单例污染（多任务并行测试时尤其容易）。
  - 修订建议：在 `T46` 的「测试设计种子 → fail-first 点」末尾补一句「使用 `createInMemoryLogger`，禁止读 stdout 真值；`resetObservabilityForTesting` 在每个 test case 之间调用」，并在 `T47`、`T48`、`T49` 各自任务沿用相同表述。
  - 不阻塞 verdict：NFR-005 已在追溯表登记，回修代价极低。

- `[minor][LLM-FIXABLE][TR5] F-4 §4 追溯表「设计 §11.2 I-1 ~ I-7 不变量」一行未显式登记 I-4（log ≤ 8 KiB + `truncated=true`），尽管 `T46.Acceptance` 实际已包含该不变量。`
  - 证据：§4 一行写 `T46（I-3）、T47（I-2）、T48（I-1, I-5）、T49（I-7）、T50（I-6）`，没有 I-4；`T46.Acceptance` 第 2 条「单条 ≤ 8 KiB；超大字段被截断且写 `truncated=true`」即 I-4。
  - 影响：traceability-review 阶段冷读时可能找不到 I-4 的承接任务；任务实际承接是 `T46`，但表上未呈现。
  - 修订建议：把表中 `T46（I-3）` 改为 `T46（I-3, I-4）`。
  - 不阻塞 verdict：I-4 已在 acceptance 内被任务承接。

## 缺失或薄弱项

- §3「修改」段对「现有 server actions / route handlers 测试」的处理是「仅断言行为不变；新增 boundary 行为断言可放在新建的 `server-boundary.test.ts`」——这是合理策略，但没有显式给出「现有 vitest suite 总数 / 失败数 = 0」的可执行 gate；该口径会在 `T49.Acceptance` 第 2 条的「现有所有 vitest 测试继续全绿」中被消费，目前不构成阻塞。
- §5 `T49.Files` 段把「修改：所有现有 server action / route handler 文件」用 §3 反向引用，没有把每个文件展开成可勾选清单；这是计划层合理简化（§3 修改清单已展开），但 PR 阶段 reviewer 仍需借助 §3 清单核对。该点已在 R-4「切分 PR 内子提交」缓解，不构成阻塞。
- 计划本身未独立约定「每个任务完成后是否必须立刻同步 `task-progress.md`」的最终落点（仅 §3 修改清单提到「`task-progress.md`（每个任务完成时同步）」）；router 在 completion-gate 通过后自然会同步，未触发 TR6 阻断，归为非关键缺失。

## Anti-Pattern 检测

- `TA1` 大任务：`T49` 触碰文件数最多，但已通过 §10 R-1 / R-4「逐文件单跑 vitest + PR 内子提交切分」缓解，未触发。
- `TA2` 缺 Acceptance：未触发；6 个任务全部具备 Acceptance。
- `TA3` 缺 Files / Verify：未触发；F-1 仅是 milestone 段口径偏差，task 级 Verify 完整。
- `TA4` 无 test seed：未触发；F-3 仅是「in-memory primitive」字样未在 task seed 复述，不是缺失。
- `TA5` 里程碑冒充任务：未触发；§2 里程碑与 §5 任务清楚分层（M1↔T46、M2↔T47……）。
- `TA6` orphan task：未触发；§4 追溯覆盖完整。
- `TA7` unstable active task：未触发；§8 + §9 + Selection Priority 三层组合使 Current Active Task 唯一可推导。

## 风险路径覆盖核查（按 dispatch 指令显式要求）

| 风险锚点 | 覆盖情况 |
|------|---------|
| I-7 Server Action 契约保留（设计 §11.2 / ADR-5） | `T49.Acceptance` 第 1 条与「测试设计种子 fail-first 点」均显式覆盖（`function.length / function.name / async`）；§10 R-1 给出业务回归缓解。✅ |
| `sqlite.backup` fallback（设计 §6.2 / §10.2 / §14） | `T51.Acceptance` 第 5 条 + 「测试设计种子 fail-first 点」显式 mock fallback 触发；§10 R-2 给出 fallback「理论存在但从未跑过」缓解。✅ |
| env hard-stop 测试隔离（FR-006 第 2 条 / 设计 D-6） | `T50.Acceptance` 第 2 条 + §10 R-3 显式给出「`nodeEnv === 'test'` 短路允许 hard-stop 仅在生产 / dev 启动」缓解。✅ |
| Verify chain canonical 一致性 | task 级 ✅；milestone 级见 F-1 minor。 |
| Selection Rule 唯一性（router 重选就绪） | §8 + §9 + Selection Priority 三层组合。✅ |
| Test design seeds（主行为 / 边界 / fail-first） | 6 任务均覆盖三类。✅ |
| Boundary with downstream（不写实现伪码） | 全部任务 Acceptance + Verify 即收口，未越界。✅ |

## 与 spec / design / increment 的一致性

- 任务计划未引入新功能能力；新增工件清单（§3）严格落在设计 §9 模块清单 + §11 类型契约范围内。
- 任务级 Verify chain 与项目 `web/AGENTS.md` 「Next 16 → 先查本地文档再写代码」原则不冲突；ADR-1 在设计阶段已通过 reviewer F-1 修订完成（proxy + header 协议传播），任务计划忠实承接。
- ADR-2 (`sqlite.backup` 主路径 + fallback)、ADR-3 (自实现极简 logger / metrics / errorReporter)、ADR-4 (`/api/metrics` disabled→404 内部判断)、ADR-5 (boundary 最薄包装) 全部在 §4 追溯表登记并落到 `T46`~`T51` 的 Acceptance / 测试设计种子。
- 未触碰 phase 1 / Discovery Quality 已交付能力（CON-003 / CON-004 / NFR-002 在 §4 显式登记）；未引入新的 runtime 依赖（依据设计 NFR-002 落地点 + §3 工件清单）。

## 下一步

- `通过`：进入「任务真人确认」（auto mode 下父会话写 approval 记录后即可进入 `hf-test-driven-dev`）。
- 进入实现前是否回修 F-1 ~ F-4 由父会话裁定；都不阻塞 approval。
- 不需要 `hf-workflow-router`：未发现 route / stage / 证据链冲突；上游 spec / design 均已 approved 且与本计划口径一致。

## 记录位置

- `docs/reviews/tasks-review-phase2-observability-ops-v1.md`

## 交接说明

- **任务真人确认**：当前结论为 `通过`；在获得人类（或 auto mode 下父会话代笔）批准前，仍不得进入 `hf-test-driven-dev`，也不得在 `task-progress.md` 把 `T46` 写成正式 `Current Active Task`。
- **hf-tasks**：仅在父会话决定先回修 F-1 ~ F-4 时使用；4 条均为 `minor` `LLM-FIXABLE`，可在一次定向修订中关闭。
- **hf-workflow-router**：不适用；本评审未发现 route / stage / profile / 上游证据冲突。
