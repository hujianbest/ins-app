# Code Review 评测

## Protected Behavior Contracts

这些评测保护 `hf-code-review` 的以下行为契约：

1. **设计偏离检测**：即使测试全绿，实现偏离设计仍应给出需修改结论
2. **错误处理检查**：静默失败、缺少错误记录等不应被忽略
3. **可读性关注**：魔法数字等问题不得因功能正确而被跳过
4. **范围守卫**：不允许超规格/超设计的"顺手加功能"
5. **Verdict 唯一下一步**：通过时指向 `hf-traceability-review`，需修改时指向 `hf-test-driven-dev`
6. **Precheck/reroute**：上游 evidence 冲突时先阻塞并回到 `hf-workflow-router`
