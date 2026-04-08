## 实现交接块

- Task ID: `T14`
- 回流来源: 主链实现
- 触碰工件: `web/src/features/home-discovery/adapters.ts`、`web/src/features/home-discovery/adapters.test.ts`
- 测试设计确认证据: 用户此前已授权“后续测试设计直接执行”；本轮围绕“作品/主页/诉求都能映射成统一首页卡片、摄影师与模特主页路由正确、诉求卡片直达详情页”进入 fail-first。
- RED 证据: `cd web && npm run test`；失败摘要为 `src/features/home-discovery/adapters.test.ts` 无法解析 `./adapters`，直接证明卡片适配层尚未建立。
- GREEN 证据: `cd web && npm run test && npm run lint && npm run build`；结果为 18 个测试文件、32 个测试全部通过，`eslint` 通过，`next build` 成功。
- 与任务计划测试种子的差异: 无。
- 剩余风险 / 未覆盖项: 当前仅建立 adapter，精选优先、兜底、去重与空态规则仍待 `T15`。
- Pending Reviews And Gates: `ahe-bug-patterns`、`ahe-test-review`、`ahe-code-review`、`ahe-traceability-review`、`ahe-regression-gate`、`ahe-completion-gate`
- Next Action Or Recommended Skill: `ahe-bug-patterns`
