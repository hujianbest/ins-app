## 实现交接块

- Task ID: `T15`
- 回流来源: 主链实现
- 触碰工件: `web/src/features/home-discovery/resolver.ts`、`web/src/features/home-discovery/resolver.test.ts`
- 测试设计确认证据: 用户此前已授权“后续测试设计直接执行”；本轮围绕“精选优先、最新兜底、同分区去重、无效精选跳过、空数据返回空 section”进入 fail-first。
- RED 证据: `cd web && npm run test`；失败摘要为 `src/features/home-discovery/resolver.test.ts` 无法解析 `./resolver`，直接证明规则编排入口尚未建立。
- GREEN 证据: `cd web && npm run test && npm run lint && npm run build`；结果为 19 个测试文件、36 个测试全部通过，`eslint` 通过，`next build` 成功。
- 与任务计划测试种子的差异: 无。
- 剩余风险 / 未覆盖项: 首页页面尚未消费 resolver 输出，空态壳层与 Hero 下三分区的真实渲染仍待 `T16`。
- Pending Reviews And Gates: `ahe-bug-patterns`、`ahe-test-review`、`ahe-code-review`、`ahe-traceability-review`、`ahe-regression-gate`、`ahe-completion-gate`
- Next Action Or Recommended Skill: `ahe-bug-patterns`
