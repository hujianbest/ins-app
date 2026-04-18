# Reviewer 派发与结果处理

## 派发流程

任务计划准备好后，不要在父会话里内联执行 `hf-tasks-review`：

1. 将任务计划保存到约定路径
2. 组装最小 tasks review request
3. 启动独立 reviewer subagent 调用 `hf-tasks-review`
4. reviewer subagent 写 review 记录并回传结构化摘要
5. 父会话读取结果后处理

## 结果处理

| 结论 | 处理 |
|------|------|
| `通过` | 先进入"任务真人确认" approval step；完成后写入批准结果，再进入 `hf-test-driven-dev` |
| `需修改` | 携带关键 findings 回到 hf-tasks 修订 |
| `阻塞` + `reroute_via_router=true` | 回到 `hf-workflow-router` 重编排 |
| 其他 `阻塞` | 携带关键 findings 回到 hf-tasks 补条件或修订 |

## 定向回修规则

- 只修 findings 直接指向的条目，不重新发散整份计划
- 对 USER-INPUT findings：只向用户提出定向问题
- 若阻塞来源于上游规格/设计不稳定：先回到 `hf-workflow-router`

## 禁止项

- 不要在任务计划未通过评审前进入实现
- 不要预先写死多个 Current Active Task 的切换时序
