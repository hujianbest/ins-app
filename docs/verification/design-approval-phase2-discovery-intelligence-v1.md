# Design Approval — Phase 2 Discovery Intelligence V1

- Date: `2026-04-19`
- Execution Mode: `auto`（用户已显式授权）
- Approver: 父会话代笔（auto mode policy；finalize 阶段保留真人复核入口）
- Design: `docs/designs/2026-04-19-discovery-intelligence-v1-design.md`
- Design review verdict: `通过`（详见 `docs/reviews/design-review-phase2-discovery-intelligence-v1.md` § 复审）
- UI review verdict: `通过`（详见 `docs/reviews/ui-review-phase2-discovery-intelligence-v1.md`）
- Spec: `docs/specs/2026-04-19-discovery-intelligence-v1-srs.md`（已批准）

## 决定

批准本设计（含 UI 设计 §10）进入 `hf-tasks`。

## Reviewer findings 处置

### Design review（hf-design-review）

第一轮 reviewer 给出 4 条 finding（2 important + 2 minor）+ 2 条薄弱点；父会话已在 approval 之前一次性回修：

- `[important][D2]` `MetricsSnapshot` 加性扩展表述统一：§3 trace 表 FR-006 行、§7 D-5、§12 CON-005 兼容点、§17 出口工件清单已统一为「在 `metrics.ts` 中加性扩展 optional 顶层 `recommendations` 命名空间」。
- `[important][D5/A2]` `web/src/app/api/discovery-events/route.ts` 本地 `DiscoveryEventRequestBody.eventType` 类型放宽：已写入 §3 trace 表 FR-005 行、§7 D-8、§9.8 接入点、§17 出口工件清单。
- `[minor][D5]` `updatedAt` 缺省回退到 `record.updatedAt ?? record.publishedAt ?? ""`：已写入 §9.4 / §9.5 mapping 步骤、§11 I-12 不变量、§14.1 单测条目。
- `[minor][D5]` `rankCandidates` 类型签名：`TSignals` 现要求 `targetKey: string`；`CreatorSignals` / `WorkSignals` 在 §9.1 都显式暴露 `targetKey`。
- `[weak]` §11 I-11：flag disabled 时 DOM 中无 panel + 不挂载任何 `DiscoveryViewBeacon` 已加。
- `[weak]` §13.2 SSR 整页 micro-benchmark：从「可选」升级为「推荐」并明确预算 30ms。

第二轮 reviewer 复审结论 `通过`，无 USER-INPUT，无残留矛盾。

### UI review（hf-ui-review）

Reviewer 给出 4 条 minor LLM-FIXABLE 建议（a11y 落地表、双 reason 共用空态文案声明、视觉方向约束说明、作品卡片字段对称示例），均不阻塞。在批准时不下沉到设计阶段重写：

- a11y / reduced-motion：沿用既有 `EditorialCard` + `<section>` + `SectionHeading` 已经覆盖的语义化结构，本增量不引入新交互或动画，无需新增 a11y 落地表。
- 双 `reason`（`no-candidates` / `soft-fail`）共用空态文案：已在 §9.6 / §9.7 体现「`kind === "empty"` → 同一文案」；可在实现阶段加 inline 注释说明。
- 视觉方向约束：本增量复用既有 `museum-panel museum-panel--soft` 与 `museum-card`，无新视觉 token；不需要额外约束说明。
- 作品卡片字段对称示例：`RelatedWorksSection` 复用 §9.6 同形结构，已在 §9.7 描述；实现阶段直接对称即可。

## 失效项

- 无（本设计为新主题首版，不打穿任何已批准工件）。

## 下一步

- `Next Action Or Recommended Skill`: `hf-tasks`
- `Pending Reviews And Gates`: `hf-tasks-review`，并按规划在每任务末尾走 `hf-bug-patterns / hf-test-review / hf-code-review / hf-traceability-review`，最后 `hf-regression-gate / hf-completion-gate / hf-finalize`。

## task-progress 同步

- `Current Stage` → `hf-tasks`
- `Current Active Task` → `pending reselection`（任务计划批准前不指派活跃任务）
- `Pending Reviews And Gates` → `hf-tasks-review`
- `Next Action Or Recommended Skill` → `hf-tasks`
