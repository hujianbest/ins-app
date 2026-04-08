## 结论

通过

## 上游已消费证据

- Task ID: `T7`
- 实现交接块 / 等价证据: `docs/verification/implementation-T7.md`
- 触碰工件: `web/src/features/showcase/types.ts`、`web/src/features/showcase/sample-data.ts`、`web/src/app/opportunities/page.tsx`、`web/src/app/opportunities/[postId]/page.tsx`

## 命中的缺陷模式（结构化）

- Pattern ID / 名称: `DP-ROUTE-004` 公开诉求路由缺失
- 机制: 首页已指向 `/opportunities`，但列表页和详情页若未同步建立，会造成公开浏览链路中断。
- 证据锚点: RED 证据中两个机会页面测试都因 `./page` 缺失而失败；GREEN 后 `next build` 成功生成 `/opportunities` 和两个详情页样本路径。
- 严重级别: 高
- 重复性: 近似缺陷
- 置信度: demonstrated

- Pattern ID / 名称: `DP-DATA-005` 诉求列表项与详情页样本失配
- 机制: 列表卡片若没有稳定的 `postId` 映射详情页，或详情页未共享同一数据源，容易出现看得到列表、进不去详情或详情内容错位。
- 证据锚点: `opportunityPosts` 同时驱动列表页和 `generateStaticParams()`；列表页测试断言首个卡片跳转到正确详情路径，详情页测试断言同一条记录的摘要、城市、时间和发布者信息。
- 严重级别: 高
- 重复性: 新风险
- 置信度: demonstrated

- Pattern ID / 名称: `DP-CONTEXT-006` 详情页缺少发布者上下文
- 机制: 若详情页只显示城市与时间，而不显示发布者摘要或主页入口，会破坏从内容到创作者主页的转化链路。
- 证据锚点: 详情页实现中显示 `ownerName`、`View {role} profile` 与联系入口；对应测试覆盖这些元素。
- 严重级别: 中
- 重复性: 新风险
- 置信度: probable

## 缺失的防护

- 当前没有针对未知 `postId` 的 404 行为测试。

## 回归假设与扩散面

- 假设: 后续若扩充诉求数据而未保持 `ownerRole`、`ownerSlug` 与详情页链接拼接规则一致，详情页到发布者主页的跳转可能局部失效。
- 建议证伪方式: 后续补充数据一致性测试，验证每条诉求都能生成有效的发布者主页路径。

## 下一步

`ahe-test-review`

## 记录位置

- `docs/reviews/bug-patterns-T7.md`
