# HF 工作流入口评测

这个目录包含 `using-hf-workflow` 的评测 prompts。

## 目的

这些评测用于验证工作流入口是否真正做到：

- 正确区分 direct invoke vs route-first
- clear case 使用 3 行编号快路径
- 不在入口层做 authoritative routing
- 不把 `using-hf-workflow` 写入 runtime handoff

## 建议评分关注点

1. 是否基于工件证据判断 direct invoke 合法性
2. 是否在 review 前置缺失时拒绝 direct invoke
3. 是否使用 compact entry 格式输出
4. 是否把 runtime recovery 交给 `hf-workflow-router`
