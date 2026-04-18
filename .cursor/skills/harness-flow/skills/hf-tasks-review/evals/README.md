# 任务计划评审评测

这个目录包含 `hf-tasks-review` 的评测 prompts。

## 目的

这些评测用于验证任务计划评审是否真正做到：

- 给出明确 verdict（通过/需修改/阻塞）和唯一下一步
- 通过时保留 `needs_human_confirmation=true`
- `Execution Mode=auto` 不覆盖评审判断
- 上游冲突时 reroute 到 `hf-workflow-router`
- 显式审查 `Acceptance / Files / Verify / test seed`
- 在 route / stage / evidence 冲突时先做 precheck 阻塞

## 建议评分关注点

1. 是否给出明确结论和唯一下一步
2. 是否在 auto 模式下仍保留 approval step
3. 是否在上游冲突时正确 reroute
4. 是否能指出任务合同字段缺口，而不是笼统说“计划不够细”
