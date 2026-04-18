# Hotfix 评测

## Protected Behavior Contracts

这些评测保护 `hf-hotfix` 的以下行为契约：

1. **必须先复现**：拒绝跳过复现直接讨论修复
2. **最小修复边界**：拒绝在热修复中合并重构或范围扩张
3. **不跳过质量链**：修复后仍需经过回归门禁和完成门禁
4. **分支判断**：正确区分 hotfix（缺陷修复）与 increment（需求变更）
5. **路由优先**：不确定时先回到 router 判断正确路径
6. **边界确认点**：根因仍只是 `probable` 或修复范围已扩散到多模块 / 公共契约时，不能直接 handoff 给 `hf-test-driven-dev`
7. **状态锚点**：hotfix 记录需要绑定当前 stage / active task / worktree 语义，而不是只写一个口头修复建议
