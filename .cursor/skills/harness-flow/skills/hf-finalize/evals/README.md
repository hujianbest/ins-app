# Finalize 评测

## Protected Behavior Contracts

这些评测保护 `hf-finalize` 的以下行为契约：

1. **剩余任务判断**：有剩余 approved tasks 时不得进入 finalize
2. **状态闭合**：工作周期结束时 canonical next action 为 null 或显式写出
3. **router 回流**：仅关闭当前任务（非整个 workflow）时 next action 指向 router
4. **不混入新实现**：发现需改动则停并回到 router
5. **Precheck / blocked closeout**：缺少 on-disk gate 证据，或 remaining approved tasks 证据互相冲突时，必须先返回 `blocked` + `hf-workflow-router`
6. **Interactive 最终确认**：`workflow closeout` 在 `interactive` 模式下必须显式请求最终确认，不能直接把 next action 写成 `null`
