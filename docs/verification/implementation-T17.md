## 实现交接块

- Task ID: `T17`
- 回流来源: `ahe-test-review`
- 触碰工件: `web/src/features/home-discovery/resolver.ts`、`web/src/features/home-discovery/resolver.order.test.ts`、`web/src/features/home-discovery/home-discovery-section.test.tsx`、`web/src/app/page.discovery-regression.test.tsx`
- 测试设计确认证据: 用户此前已授权“后续测试设计直接执行”；本轮回流修订围绕 `ahe-test-review` 的三项发现补充真实 RED：分区顺序必须服从配置顺序、首页空态回归扩展到三类分区、空态测试覆盖三类 `kind`。
- RED 证据: `cd web && npm run test`；失败摘要为 `resolver.order.test.ts` 断言 `resolveHomeDiscoverySections()` 未遵循 mock 的 `homeDiscoverySectionOrder`，同时 `page.discovery-regression.test.tsx` 因新增多用例暴露清理问题；该失败直接对应测试评审指出的顺序单一来源与首页空态覆盖修订目标。
- GREEN 证据: `cd web && npm run test && npm run lint && npm run build`；结果为 22 个测试文件、43 个测试全部通过，`eslint` 通过，`next build` 成功。
- 与任务计划测试种子的差异: 本轮属于测试评审回流修订，不改变任务计划目标；是在 `T17` 原有回归收口基础上补充顺序一致性与三类空态覆盖。
- 剩余风险 / 未覆盖项: 当前仍基于静态样本数据与代码内精选配置，不含运营后台和个性化推荐能力；该项属于本轮范围外。
- Pending Reviews And Gates: `ahe-regression-gate`、`ahe-completion-gate`
- Next Action Or Recommended Skill: `ahe-regression-gate`
