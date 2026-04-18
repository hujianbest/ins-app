# Finalize Closeout Pack

使用说明：

- 这是 `hf-finalize` 的 closeout pack 模板。
- 用于两种分支：`task-closeout` 与 `workflow-closeout`。
- 若项目在 `AGENTS.md` 中声明了等价模板或 closeout 路径，优先遵循项目约定。

## Closeout Summary

- Closeout Type: `task-closeout` | `workflow-closeout` | `blocked`
- Scope:
- Conclusion:
- Based On Completion Record:
- Based On Regression Record:

## Evidence Matrix

- Artifact:
- Record Path:
- Status: `present` | `N/A (profile skipped)` | `missing`
- Notes:

## State Sync

- Current Stage:
- Current Active Task:
- Workspace Isolation:
- Worktree Path:
- Worktree Branch:
- Worktree Disposition: `kept-for-pr` | `cleaned-per-project-rule` | `in-place`

## Release / Docs Sync

- Release Notes Path:
- Updated Docs:
- Status Fields Synced:

## Handoff

- Remaining Approved Tasks:
- Next Action Or Recommended Skill:
- PR / Branch Status:
- Limits / Open Notes:

## Branch Rules

- `task-closeout`:
  - `Current Stage` 应写回 `hf-workflow-router`
  - `Next Action Or Recommended Skill` 应写 `hf-workflow-router`
  - 不得声称 workflow 已结束

- `workflow-closeout`:
  - `Current Active Task` 应清空或显式关闭
  - `Next Action Or Recommended Skill` 应写 `null` 或项目 null 约定
  - 不得再写回 `hf-workflow-router`

- `blocked`:
  - `Current Stage` 应写回 `hf-workflow-router`
  - `Next Action Or Recommended Skill` 应写 `hf-workflow-router`
  - 不得声称 closeout 已完成

## Final Confirmation

- `workflow-closeout` + `interactive`：
  - Question: 是否确认正式结束本轮 workflow？
  - If confirmed: write `Next Action Or Recommended Skill: null`
  - If not confirmed: return to `hf-workflow-router`
