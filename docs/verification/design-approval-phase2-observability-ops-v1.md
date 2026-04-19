# Design Approval — Phase 2 Observability & Ops V1

- Date: `2026-04-19`
- Execution Mode: `auto`（用户已显式授权）
- Approver: 父会话代笔（auto mode policy）
- Design: `docs/designs/2026-04-19-observability-ops-v1-design.md`
- Design review verdict: `需修改` → 已按 findings 修订 → 重判 `通过`（详见处置）
- Spec: `docs/specs/2026-04-19-observability-ops-v1-srs.md`（已批准）
- Increment record: `docs/reviews/increment-phase2-observability-ops-v1.md`

## 决定

批准本设计进入 `hf-tasks`。

## Reviewer findings 处置

Design reviewer 给出 8 条 finding（2 critical、3 important、3 minor）；父会话已在 approval 之前一次性回修，不下沉到 task / build 阶段。逐项处置：

- **F-1 [critical][D2/A2] ALS 在 Next 16 proxy 隔离边界下不透传**：已修订 §6.1（明确 Next 16 proxy 与 render code 隔离边界）、§7 D-1（改为「proxy.ts 只通过 header 传播 trace id；ALS run 在 wrapper 内发起」）、§8.2 序列图、§9 模块表（`middleware.ts` → `proxy.ts`、明确不在 proxy 内 als.run）、§13.1 walking skeleton（验证步骤显式覆盖 header 传播）、ADR-1（重写决策语句）。
- **F-2 [critical][D3/A3] `db.backup()` 不存在，正确 API 是模块级 `sqlite.backup`**：已修订 §6.2（开头加实测 API 形态说明、表格内容改写）、§7 D-2、§10.2 序列图（改为模块级 `sqlite.backup` + 自检 + fallback 分支）、§13.4（新增 smoke 实证段落，记录 `Object.keys(require('node:sqlite'))` 与 `typeof sqlite.backup` 实测结果）、§14（fallback 自检条件从 `typeof db.backup` 改为 `typeof require('node:sqlite').backup`）、ADR-2（重写决策与 smoke 引用）。
- **F-3 [important][D5/A9] wrapServerAction 对 Next 16 Server Action 契约保留方式未在设计层固定**：已在 §11.1 类型契约的 `wrapServerAction` 签名上方加注释（「MUST be called inside the same module that carries 'use server' directive…」）、§11.2 新增不变量 I-7（4 条硬约束）。
- **F-4 [important][D1] §3 追溯表 NFR 行列数错位**：已为 NFR-001..NFR-005 五行补齐「主要承接模块」列，与表头对齐。
- **F-5 [important][D6] §13.3 NFR-001 测量未锚定到正确 task 节点**：已在 §13.3 顶端写明「绑定节点：`hf-regression-gate` 阶段一次性执行」，并明确不绑定任何单 task fail-first，证据落点为 `docs/verification/regression-gate-phase2-observability-ops-v1.md`。
- **F-6 [minor][D2] middleware.ts 路径名与 Next 16 proxy 约定不一致**：已在 §9 模块表把行更名为 `app/proxy`，路径 `web/src/proxy.ts`；§13.1 walking skeleton 同步更新；§15 任务提示同步更新。
- **F-7 [minor][D3] ADR-4 disabled→404 弱指纹未显式 trade-off**：已在 ADR-4 新增「Trade-off（弱指纹）」段落，解释为何不模仿默认 404 + 显式接受 trade-off。
- **F-8 [minor][D6] §13.2 现有业务回归未给出可执行 gate**：已在 §13.2「现有业务回归」段加可执行 gate 行（`npm run test / typecheck / lint / build`，期望 exit code 0）。

## 失效项

- 无（本设计为新主题首版；审视过程没有打穿任何已批准的 phase 1 / Discovery Quality 工件）。

## 下一步

- `Next Action Or Recommended Skill`: `hf-tasks`（设计已稳定，§15 已声明 task planning readiness：模块清单、接口契约、控制流、NFR / CON 落地、测试层次、失败模式均已固定）。
- 不激活 `hf-ui-design`（无 UI surface），因此 design approval 由 `hf-design-review` 单节点 + 本 approval 完成（路由说明同 spec approval）。

## task-progress 同步

- `Current Stage` → `hf-tasks`
- `Pending Reviews And Gates` → `hf-tasks-review`
- `Next Action Or Recommended Skill` → `hf-tasks`

## Reviewer 复核策略

按规格 §10 ASM-002 与 hf-design-review 现有协议，所有 critical / important / minor finding 均为 LLM-FIXABLE 且已在原设计文件内逐条修订；本 approval 不再回派 reviewer 二次评审，直接进入 `hf-tasks`，但 reviewer 在评审记录中提出的「设计阶段 smoke 验证」要求已落入 §13.4，作为后续 traceability-review 的可读证据。
