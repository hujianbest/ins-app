## 实现交接块

- Task ID: `T7`
- 回流来源: 主链实现
- 触碰工件: `web/src/features/showcase/types.ts`、`web/src/features/showcase/sample-data.ts`、`web/src/app/opportunities/page.tsx`、`web/src/app/opportunities/page.test.tsx`、`web/src/app/opportunities/[postId]/page.tsx`、`web/src/app/opportunities/[postId]/page.test.tsx`
- 测试设计确认证据: 用户于 2026-04-06 在当前会话确认“确认 T7 测试设计”，按“诉求列表可浏览 + 诉求详情可访问并展示发布者摘要/联系入口”进入 fail-first。
- RED 证据: `cd web && npm run test`；失败摘要为 `src/app/opportunities/page.test.tsx` 与 `src/app/opportunities/[postId]/page.test.tsx` 无法解析 `./page`；这与“诉求列表页和详情页尚未建立”的预期缺口一致。
- GREEN 证据: `cd web && npm run test && npm run lint && npm run build`；结果为 7 个测试文件、9 个测试全部通过，`eslint` 通过，`next build` 成功静态生成 `/opportunities` 与 `/opportunities/[postId]` 样本路径。
- 与任务计划测试种子的差异: 无实质差异；将“详情页可跳转到发布者主页”显式编码进详情页测试，以更直接支撑设计中的公开浏览链路。
- 剩余风险 / 未覆盖项: 当前诉求仍基于本地样本数据；未覆盖未知 `postId` 的 404 断言，也未覆盖登录后从诉求页发起真实站内联系的行为。
- Pending Reviews And Gates: `ahe-bug-patterns`、`ahe-test-review`、`ahe-code-review`、`ahe-traceability-review`、`ahe-regression-gate`、`ahe-completion-gate`
- Next Action Or Recommended Skill: `ahe-bug-patterns`
