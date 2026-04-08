## 结论

通过

## 上游已消费证据

- Task ID: `T6`
- 实现交接块 / 等价证据: `docs/verification/implementation-T6.md`
- 触碰工件: `web/src/features/showcase/types.ts`、`web/src/features/showcase/sample-data.ts`、`web/src/features/showcase/profile-showcase-page.tsx`、`web/src/app/works/[workId]/page.tsx`

## 命中的缺陷模式（结构化）

- Pattern ID / 名称: `DP-ROUTE-001` 动态详情路由缺失
- 机制: 首页或公开主页新增入口后，目标动态路由未同步建立，导致导航落空。
- 证据锚点: RED 证据中 `src/app/works/[workId]/page.test.tsx` 无法解析 `./page`；GREEN 后 `next build` 成功静态生成 `/works/[workId]` 路由。
- 严重级别: 高
- 重复性: 近似缺陷
- 置信度: demonstrated

- Pattern ID / 名称: `DP-LINK-002` 展示卡片与详情数据失配
- 机制: 公开主页上的作品卡片如果没有稳定的 `workId` 到详情页映射，会出现看得到作品、进不去详情的链路断裂。
- 证据锚点: 摄影师与模特主页测试新增了 `/works/...` 链接断言；共享样本数据中每个展示项都补齐了 `workId`，并为所有展示项提供了对应 `works` 数据。
- 严重级别: 高
- 重复性: 新风险
- 置信度: demonstrated

- Pattern ID / 名称: `DP-DATA-003` 共享数据回退为路由内联
- 机制: 新增详情页时容易直接在路由文件里内联作品内容，破坏 `T4` 建立的共享数据层。
- 证据锚点: `works`、`getWorkById()` 继续放在 `web/src/features/showcase/sample-data.ts`；详情页只消费共享数据。
- 严重级别: 中
- 重复性: 近似缺陷
- 置信度: probable

## 缺失的防护

- 当前没有针对未知 `workId` 的 404 行为测试；虽然页面已调用 `notFound()`，但缺少显式回归断言。

## 回归假设与扩散面

- 假设: 后续新增作品样本时，如果只改公开主页展示项、不补 `works` 列表，仍可能造成单个卡片落到不存在的详情页。
- 建议证伪方式: 在后续数据扩展任务中增加“每个 `showcaseItems.workId` 都能在 `works` 中找到对应项”的一致性测试。

## 下一步

`ahe-test-review`

## 记录位置

- `docs/reviews/bug-patterns-T6.md`
