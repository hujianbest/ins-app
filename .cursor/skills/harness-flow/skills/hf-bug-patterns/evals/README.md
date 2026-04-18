# Bug Patterns 评测

## Protected Behavior Contracts

这些评测保护 `hf-bug-patterns` 的以下行为契约：

1. **固化必须基于当前案例 + 历史证据**：不能凭模糊直觉就发明“团队模式”
2. **先判断值不值得固化**：一条经验要满足重复性/可泛化/可行动，才值得进入 catalog
3. **必须先问真人是否落盘**：未确认前只能输出候选模式，不能直接写目录
4. **不是 HF mandatory gate**：不能把它写成 `hf-test-review` 前的必经 next action
5. **`not-yet` 也要给观察计划**：当证据不足时，必须写出缺失证据、下次该记录什么、以及何时升级为正式候选，而不是只说“先观察”
