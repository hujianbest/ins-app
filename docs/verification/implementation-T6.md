## 实现交接块

- Task ID: `T6`
- 回流来源: 主链实现
- 触碰工件: `web/src/features/showcase/types.ts`、`web/src/features/showcase/sample-data.ts`、`web/src/features/showcase/profile-showcase-page.tsx`、`web/src/app/works/[workId]/page.tsx`、`web/src/app/works/[workId]/page.test.tsx`、`web/src/app/photographers/[slug]/page.test.tsx`、`web/src/app/models/[slug]/page.test.tsx`
- 测试设计确认证据: 用户于 2026-04-05 在当前会话确认“认 T6 测试设计”，按“作品详情页可渲染 + 可从主页进入详情”进入 fail-first。
- RED 证据: `cd web && npm run test`；失败摘要为 `src/app/works/[workId]/page.test.tsx` 无法解析 `./page`，且摄影师 / 模特主页测试无法找到指向作品详情的链接；这与“详情路由尚未存在、主页作品卡还未可跳转”的预期缺口一致。
- GREEN 证据: `cd web && npm run test && npm run lint && npm run build`；结果为 5 个测试文件、7 个测试全部通过，`eslint` 通过，`next build` 成功静态生成 `/works/[workId]` 及其样本路径。
- 与任务计划测试种子的差异: 无实质差异；在执行中补强了“公开主页作品卡必须真正链接到详情页”的断言，以更直接支撑“可从主页进入作品详情”。
- 剩余风险 / 未覆盖项: 当前作品详情仍基于本地样本数据；未覆盖真实图片渲染、未登录互动引导细节和不存在 `workId` 的 404 页面断言。
- Pending Reviews And Gates: `ahe-bug-patterns`、`ahe-test-review`、`ahe-code-review`、`ahe-traceability-review`、`ahe-regression-gate`、`ahe-completion-gate`
- Next Action Or Recommended Skill: `ahe-bug-patterns`
