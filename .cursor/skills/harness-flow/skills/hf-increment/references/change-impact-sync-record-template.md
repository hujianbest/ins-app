# HF 变更影响同步记录模板

这个模板用于记录一次 `hf-increment` 的影响分析与同步结果。

目标不是写一篇冗长的变更说明，而是明确回答以下问题：

- 这次到底变了什么
- 影响面落在哪些工件和阶段
- 哪些内容已经同步
- 哪些内容还需要补同步
- 正确的下一步应该回到哪里

## 使用原则

- 聚焦“实质变化”，不要把所有微小改字都上升为完整影响分析。
- 先固定当前基线，再做影响分析；不要一边分析一边让 stage / profile / worktree 漂移。
- 变化一旦可能影响需求、设计、任务、测试、发布说明或状态记录，就应留下记录。
- 记录要能支持后续审查，而不是只写“已同步”。
- 若变化仍不稳定到足以写成 `New / Modified / Deprecated`，不要硬写完整影响矩阵；先阻塞并回到正确节点。
- 对小变更可以简写，但不能跳过受影响工件判断和唯一 next action。

## 建议使用时机

- 用户明确要求修改已批准需求、范围或验收标准
- 实现过程中发现原规格或设计已经不再适用
- 某项变化会影响任务计划、验证策略或用户可见交付

## 标准记录模板

```markdown
## 变更摘要

- 变更摘要：
- 当前判断：真实 increment | 更像 hotfix | 仍需进一步规格化 | blocked
- 影响级别：high | medium | low

## 基线快照

- `Workflow Profile`：
- `Current Stage`：
- `Current Active Task`：
- `Pending Reviews And Gates`：
- `Worktree Path`：
- `Worktree Branch`：

## 变更包

- New：
- Modified：
- Deprecated：

## 影响矩阵

- 受影响工件：
- 失效的批准状态：
- 失效的任务 / `Current Active Task`：
- 失效的测试设计 / 验证证据 / review 结论：
- 需重新派发的 reviewer / review 节点：
- Profile 升级信号：

## 同步更新项

- 已更新工件：
- 已回写内容：
- 明确不做的内容：

## 待同步项

- 工件：
  - 原因：
  - 建议动作：

## 状态回流

- `Current Stage`：
- `Workflow Profile`：
- `Current Active Task`：
- `Pending Reviews And Gates`：
- `Next Action Or Recommended Skill`：`hf-specify` | `hf-hotfix` | `hf-spec-review` | `hf-design` | `hf-design-review` | `hf-tasks` | `hf-test-driven-dev` | `hf-workflow-router`
```

## 简化版模板

对于较小改动，可以使用这个版本：

```markdown
## 变更摘要

- 本次变化：
- 当前判断：

## 基线快照

- 条目

## 变更包 / 受影响工件

- 条目

## 已同步项 / 状态回流

- 条目

## 下一步

`hf-specify` | `hf-hotfix` | `hf-spec-review` | `hf-design` | `hf-design-review` | `hf-tasks` | `hf-test-driven-dev` | `hf-workflow-router`
```

## 评审提示

记录时优先回答这些问题：

- 当前变化有没有改变需求含义或验收标准？
- 当前基线（profile / stage / active task / worktree）是否已经被固定？
- 当前变化有没有改变“如何实现”或接口边界？
- 当前任务计划、DoD、验证策略还成立吗？
- 现有实现里有没有被这次变更反向打穿的部分？
- 用户可见结果、发布说明或状态记录是否需要一起更新？

## 常见遗漏

- 规格改了，但设计没回写
- 变化还没稳定，就硬写完整影响分析并直接推进实现
- 设计改了，但任务和验证策略没刷新
- 任务范围变了，但 DoD 和测试仍按旧标准执行
- 代码已经按新逻辑实现，但文档仍是旧结论
- 用户可见行为变化了，但发布说明和进度记录没更新

## 示例骨架

```markdown
## 变更摘要

- 变更摘要：登录失败锁定次数从 5 次改为 3 次，并增加管理员解锁入口
- 当前判断：真实 increment
- 影响级别：high

## 基线快照

- `Workflow Profile`：standard
- `Current Stage`：`hf-increment`
- `Current Active Task`：T21
- `Pending Reviews And Gates`：`hf-design-review`, `hf-tasks-review`
- `Worktree Path`：`<path-if-any>`
- `Worktree Branch`：`feature/T21-login-lockout`

## 变更包

- New：管理员解锁入口
- Modified：锁定阈值从 5 次改为 3 次
- Deprecated：旧的 5 次阈值说明和对应验证结论

## 影响矩阵

- 受影响工件：需求规格、设计说明、任务计划、测试策略、发布说明
- 失效的批准状态：旧规格批准、旧设计批准
- 失效的任务 / `Current Active Task`：T21 原执行边界不足以覆盖管理员解锁
- 失效的测试设计 / 验证证据 / review 结论：锁定阈值相关验证与旧设计评审结论失效
- 需重新派发的 reviewer / review 节点：`hf-spec-review`, `hf-design-review`
- Profile 升级信号：无

## 同步更新项

- 已更新工件：规格草案、设计草案
- 已回写内容：锁定阈值与管理员解锁说明
- 明确不做的内容：不在 increment 内直接修改生产代码

## 待同步项

- 工件：任务计划
  - 原因：缺少管理员解锁实现与验证项
  - 建议动作：补任务并更新 DoD
- 工件：测试策略
  - 原因：原验证不足以覆盖新策略
  - 建议动作：补失败次数边界与解锁验证

## 状态回流

- `Current Stage`：`hf-spec-review`
- `Workflow Profile`：standard
- `Current Active Task`：`pending reselection`
- `Pending Reviews And Gates`：`hf-design-review`, `hf-tasks-review`
- `Next Action Or Recommended Skill`：`hf-spec-review`
```
