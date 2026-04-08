## 实现交接块

- Task ID: `T16`
- 回流来源: 主链实现
- 触碰工件: `web/src/features/home-discovery/home-discovery-section.tsx`、`web/src/features/home-discovery/home-discovery-section.test.tsx`、`web/src/app/page.tsx`、`web/src/app/page.test.tsx`
- 测试设计确认证据: 用户此前已授权“后续测试设计直接执行”；本轮围绕“首页保留 Hero、接入三个发现分区、公开链接可点击、空态壳层存在”进入 fail-first。
- RED 证据: `cd web && npm run test`；失败摘要为首页测试找不到发现分区标题且 `home-discovery-section.tsx` 缺失，直接证明首页还未接入发现分区。
- GREEN 证据: `cd web && npm run test && npm run lint && npm run build`；结果为 20 个测试文件、37 个测试全部通过，`eslint` 通过，`next build` 成功。
- 与任务计划测试种子的差异: 无。
- 剩余风险 / 未覆盖项: 当前已覆盖首页渲染与空态组件，但最终回归收口仍待 `T17` 用更聚焦的回归场景与全量验证完成。
- Pending Reviews And Gates: `ahe-bug-patterns`、`ahe-test-review`、`ahe-code-review`、`ahe-traceability-review`、`ahe-regression-gate`、`ahe-completion-gate`
- Next Action Or Recommended Skill: `ahe-bug-patterns`
