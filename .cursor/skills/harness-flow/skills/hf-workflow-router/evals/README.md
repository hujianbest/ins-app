# 工作流路由评测

这个目录包含 `hf-workflow-router` 的评测 prompts。

## 目的

这些评测用于验证路由判断是否真正做到：

- 基于最新磁盘证据决定 canonical 节点
- 支线信号优先于主链推进
- stale handoff 不被盲目沿用
- 使用紧凑编号格式输出路由结论

## 建议评分关注点

1. 是否基于工件证据而非聊天记忆路由
2. 是否正确识别支线信号（hotfix/increment）
3. 是否忽略 stale handoff 回退到正确上游
4. 是否使用 compact router 格式输出
