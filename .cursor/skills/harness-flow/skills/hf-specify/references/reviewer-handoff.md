# Reviewer 派发与定向回修协议

## 派发流程

草稿准备好后，不要在父会话里内联执行 `hf-spec-review`。正确做法是：

1. 将规格草稿保存到约定路径
2. 若存在 deferred backlog，一并保存到约定路径
3. 组装最小 spec review request
4. 启动独立 reviewer subagent，并在该 subagent 中调用 `hf-spec-review`
5. 由 reviewer subagent 写 review 记录并回传结构化摘要
6. 父会话读取 reviewer 返回结果后继续处理

## 结果处理

| 结论 | 处理 |
|------|------|
| `通过` | 由父会话完成 approval step（`interactive` 下等待真人，`auto` 下写 approval record） |
| `需修改` | 携带关键 findings 回到 hf-specify 修订 |
| `阻塞` + `reroute_via_router=true` | 回到 `hf-workflow-router` 重编排 |
| 其他 `阻塞` | 携带关键 findings 回到 hf-specify 补条件或修订 |

## 定向回修规则

当因 review findings 重新进入时：

- **LLM-FIXABLE**：只修 findings 直接指向的条目，不重新发散整份规格
  - 但若修改中发现会改变当前轮范围、优先级或 deferred backlog 归属 → 立刻转对用户定向确认
- **USER-INPUT**：只向用户提出定向问题，不重新做整轮澄清
- **混合 findings**：先收集用户输入，再一起回修，减少 reviewer 循环次数
- **少量 USER-INPUT**（1-3 个）：在一个回合里编号问完
- **用户简短回复**：先复述理解并请求确认/纠正
- **interactive 模式**：只展示必须回答的问题；LLM-FIXABLE 项直接处理
- **2 轮 reviewer 循环无新用户输入**：不再静默反复修文，显式展示剩余阻塞点
- **route/stage/profile 冲突**：不在本节点硬修，交回 `hf-workflow-router`

## 禁止项

- 不要在 `hf-specify` 阶段请求 approval step；只发生在 `hf-spec-review` 返回"通过"之后
