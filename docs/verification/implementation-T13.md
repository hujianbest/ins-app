## 实现交接块

- Task ID: `T13`
- 回流来源: 主链实现
- 触碰工件: `web/src/features/home-discovery/types.ts`、`web/src/features/home-discovery/config.ts`、`web/src/features/home-discovery/config.test.ts`、`web/src/features/showcase/types.ts`、`web/src/features/showcase/sample-data.ts`
- 测试设计确认证据: 用户此前已授权“后续测试设计直接执行”；本轮围绕“首页发现配置必须覆盖三类分区、profiles 使用 `role + slug`、公开样本数据具备稳定时间键”进入 fail-first。
- RED 证据: `cd web && npm run test`；失败摘要为 `src/features/home-discovery/config.test.ts` 无法解析 `./config`，直接证明首页发现配置契约尚未建立。
- GREEN 证据: `cd web && npm run test && npm run lint && npm run build`；结果为 17 个测试文件、29 个测试全部通过，`eslint` 通过，`next build` 成功。
- 与任务计划测试种子的差异: 无实质差异；在契约测试之外补充了样本数据 `publishedAt` 时间键断言，以覆盖 `T13` 中的时间键准备目标。
- 剩余风险 / 未覆盖项: 当前仅建立类型、配置和时间键基线，还没有 adapter、resolver 和首页发现分区 UI。
- Pending Reviews And Gates: `ahe-bug-patterns`、`ahe-test-review`、`ahe-code-review`、`ahe-traceability-review`、`ahe-regression-gate`、`ahe-completion-gate`
- Next Action Or Recommended Skill: `ahe-bug-patterns`
