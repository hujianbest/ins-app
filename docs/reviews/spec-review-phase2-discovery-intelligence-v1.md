# Spec Review — Phase 2 — Discovery Intelligence V1

- 评审对象: `docs/specs/2026-04-19-discovery-intelligence-v1-srs.md`（草稿）
- Increment 记录: `docs/reviews/increment-phase2-discovery-intelligence-v1.md`
- ROADMAP 锚点: `docs/ROADMAP.md` §3.6
- 风格基线: `docs/specs/2026-04-19-observability-ops-v1-srs.md`
- Workflow Profile: `full`；Execution Mode: `auto`
- 评审时间: 2026-04-19
- 评审人: HF spec-review reviewer subagent

## 结论

通过

## Precheck

- 规格草稿稳定可定位 ✓
- route/stage/profile 明确（`hf-specify` → `hf-spec-review`，profile=full）✓
- 上游证据一致：increment 记录、ROADMAP §3.6、§3.8 V1 metrics 注册表事实均闭合 ✓
- 进入正式 rubric

## 结构契约

- 项目当前规格骨架（背景 / 目标与成功标准 / 角色与场景 / 范围 / 范围外 / FR / NFR / 数据契约 / 约束 / 假设 / 影响 / Trace 索引）与上一份已批准规格 `2026-04-19-observability-ops-v1-srs.md` 对齐。
- 每条 FR 均具备 `需求说明` / `验收标准` / `Priority` / `Source / Trace Anchor` 四元组，符合 `C1` 要求。
- `Trace Anchor 索引`（§12）显式聚合到一张表，可回读。

## 正式 Rubric 检查

### Group Q — Quality Attributes

| ID | 检查 | 评估 |
|---|---|---|
| Q1 Correct | 每条 FR 都回指 ROADMAP §3.6 + increment 记录的 `变更包/New` | ✅ |
| Q2 Unambiguous | 关键阈值已量化：候选张数 1–4、SSR 时延 ≤ 30ms、tie-breaker（`updatedAt` desc → `targetKey` asc）、env 默认 `true`、空态文案规则 | ✅ |
| Q3 Complete | 覆盖 happy path + 空态 + flag 关闭 + 非法 env 值 + repository 异常降级；事件 / metrics 双侧验收均给出 | ✅ |
| Q4 Consistent | flag / surface / 计数语义在 FR-001/002/004/005/006 之间一致；`surface` 字符串在 §8.3 不变量中固定 | ✅ |
| Q5 Ranked | 8 条 FR 全为 `Must`。本增量是单主题最小垂直切片，主线无可降级承接；可接受 | ✅（minor 见下） |
| Q6 Verifiable | 验收标准全部以 Given/When/Then 表达，可形成通过/不通过判断 | ✅ |
| Q7 Modifiable | 同一规则不在多处重复；`稳定空态` 与 `flag 关闭` 两个分支边界清晰区分（FR-001/002 vs FR-004） | ✅ |
| Q8 Traceable | 所有 FR / NFR 具备稳定 ID 与 ROADMAP / 增量记录锚点，§12 汇总成索引 | ✅ |

### Group A — Anti-Patterns

| ID | 检查 | 评估 |
|---|---|---|
| A1 模糊词 | 未量化形容词已替换为 ms / 张数 / counter 名 | ✅ |
| A2 复合需求 | FR-001/002/005/006 内部覆盖多条验收，但每条 FR 仍围绕单一 surface / 单一契约（section、event 类型、metrics 注册），未跨主题打包 | ✅ |
| A3 设计泄漏 | 多处出现具体文件路径与实现符号（`web/src/features/recommendations/`、`MetricsRegistry`、`DiscoveryViewBeacon`、`view-beacon.tsx`、`events.ts` 等），但与已批准的 `observability-ops-v1` 规格风格一致；项目模板允许 trace 锚点级别的实现路径引用 | ⚠️ minor |
| A4 主体被动 | 主语统一为「系统应…」+ 明确 trigger（SSR 渲染 / 启动 / repository 异常） | ✅ |
| A5 占位/待定 | 关键 FR 中无 TBD；`A-002` 显式声明 `success` 字段当前固定为 `true`，把"未来再决定"封装为 assumption 而非 placeholder | ✅ |
| A6 负路径 | flag 关闭、非法 env、repository 异常、空候选池、自身候选过滤 5 类负路径均覆盖 | ✅ |

### Group C — Completeness And Contract

| ID | 检查 | 评估 |
|---|---|---|
| C1 Requirement contract | 8 条 FR 全具备 ID/Statement/Acceptance/Priority/Source；NFR 5 条具备 ID + 描述 | ✅ |
| C2 Scope closure | §4 in-scope 与 §5 out-of-scope 互为镜像，关键不做项（向量 / pgvector / ML / A/B 框架 / 个性化 / dwell time / 跨角色 / 首页发现页注入 / 新 API）逐条闭合 | ✅ |
| C3 Open-question closure | §10 仅余 3 条 assumptions（A-001/002/003），均无阻塞性；不影响设计主干 | ✅ |
| C4 Template alignment | 与 `2026-04-19-observability-ops-v1-srs.md` 的章节骨架严格对齐 | ✅ |
| C5 Deferral handling | "Discovery 事件扩展（dwell time / scroll depth）"在 FR-005 Source 注脚中显式声明本增量不引入；A/B 框架、个性化、跨角色、首页注入均在 §5 显式延后 | ✅ |
| C6 Goal and success criteria | §2.2 给出 6 条可判断的 success criteria，包括卡数上下界、flag 关闭语义、事件入库 / counter 递增、零回归与 30ms 性能预算 | ✅ |
| C7 Assumption visibility | A-001/002/003 显式写出，且 A-001（候选池规模）与 A-003（不展示 breakdown）影响可回读 | ✅ |

### Group G — Granularity And Scope-Fit

| ID | 检查 | 评估 |
|---|---|---|
| G1 Oversized FR | 未明显命中 GS1-GS6：单 FR 不跨角色（FR-001 限同角色 / FR-002 限已发布作品）、不跨工作流（评分 vs 编排 vs metrics 分别 FR-003/004/006）、不混版本（无 V2 字段混写）| ✅ |
| G2 Mixed release boundary | 当前轮与未来增量边界明确（A/B 框架、个性化、跨角色推荐均在 §5 / 注脚显式分离）| ✅ |
| G3 Repairable scope | 即便要回修，所有 finding 均为 LLM-fixable wording / 可接受偏差，无需推倒重来 | ✅ |

## 发现项

- [minor][LLM-FIXABLE][A3] FR-001/002/005/006/008 与 §11 中含较多实现路径与符号（`web/src/features/recommendations/`、`RelatedCreatorsSection`、`DiscoveryViewBeacon`、`MetricsRegistry`、`view-beacon.tsx`）。与已批准的 `observability-ops-v1-srs.md` 项目模板风格一致（trace 锚点级别允许引用具体路径），故不阻塞；后续如愿进一步弱化设计泄漏，可在 FR 主体使用职责描述、把具体文件路径下沉到 §11「影响 / 出口工件」与 §12 索引。
- [minor][LLM-FIXABLE][Q5] 8 条 FR 全部 `Must`。对单主题垂直切片合理（任一缺失都会破坏"灰度上线 + 可量化基线"完整性），但若希望更明确表达"FR-008 的 30ms 与 NFR-001 的 30ms"可接受偏差度，可在 NFR-001 显式注明可接受偏差窗口；当前阈值已可判断，故仅作建议。
- [minor][LLM-FIXABLE][Q3] FR-001 验收对「同城同向 > 其他三类」做了严格大于断言，但「同城/不同向」vs「不同城/同向」二者之间未给出确定大小。结合 FR-007 tie-breaker 与 FR-003 权重定义可推断由 weights 决定，规格层不强制即可；如希望对外固定可读语义，可在 FR-001 或 §8 增补「同城权重 ≥ 同方向权重」之类的不变量，否则现状可由设计/任务承担。

## 缺失或薄弱项

- 无阻塞性缺失。LLM-fixable 建议已列在「发现项」。
- USER-INPUT 项：0。规格内所有阈值（30ms、≤4 张、tie-breaker 字段、空态文案口径、env 默认值）均由 ROADMAP §3.6 / §3.8 V1 已交付契约 / 已批准 observability spec 推得，不需要用户提供新业务事实。

## 下一步

- `规格真人确认`：进入 approval step，由父会话完成真人/auto 模式的规格批准记录后，再进入 `hf-design`。
- 不需要 reroute via router。
- 不需要回 `hf-specify`：本轮所有发现均为 minor LLM-fixable，且与项目既有风格一致，不影响设计入参稳定性。

## 记录位置

- `/workspace/docs/reviews/spec-review-phase2-discovery-intelligence-v1.md`

## 交接说明

- 结论 `通过` → 父会话执行 `规格真人确认`（profile=full / mode=auto，因此走 approval record 写入流程，不阻塞 reviewer）。
- 完成 approval 后再激活 `hf-design`；本 reviewer 不顺手开始设计。
- `task-progress.md` 与规格文档状态字段的回写由父会话在 approval step 完成后执行。
