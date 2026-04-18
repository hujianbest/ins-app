# 测试驱动开发评测

这个目录包含 `hf-test-driven-dev` 的评测 prompts。

## 目的

这些评测用于验证实现入口是否真正做到：

- 测试设计 approval step 在 TDD 前完成
- interactive 模式等待用户确认
- auto 模式写 approval record 但不跳过审批语义
- 政策禁止时不自动推进

## 建议评分关注点

1. 是否在 TDD 前完成测试设计审批
2. 是否正确区分 interactive/auto 模式
3. 是否在政策禁止时停止自动推进
