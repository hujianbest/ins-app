## 结论

通过

## 上游已消费证据

- Task ID: `T17`
- 实现交接块: `docs/verification/implementation-T17.md`
- 触碰工件: `web/src/features/home-discovery/types.ts`、`web/src/features/home-discovery/config.ts`、`web/src/features/home-discovery/adapters.ts`、`web/src/features/home-discovery/resolver.ts`、`web/src/features/home-discovery/home-discovery-section.tsx`、`web/src/app/page.tsx`、`web/src/app/page.discovery-regression.test.tsx`

## 命中的缺陷模式（结构化）

- Pattern ID / 名称: `AI-BLINDSPOT-001` / 双重来源配置漂移
- 机制: 分区顺序与配置入口同时存在于 `config.ts` 与 `resolver.ts`，若后续只改一侧，可能出现首页渲染顺序与配置约束不一致
- 证据锚点: `web/src/features/home-discovery/config.ts` 暴露 `homeDiscoverySectionOrder`；`web/src/features/home-discovery/resolver.ts` 中 `resolveHomeDiscoverySections()` 仍手工按 works/profiles/opportunities 顺序拼装
- 严重级别: `minor`
- 重复性: `新风险`
- 置信度: `probable`

- Pattern ID / 名称: `STATE-EMPTY-001` / 空态分区只在单例场景被首页级回归覆盖
- 机制: `T17` 首页回归测试使用 mock 仅覆盖 `profiles` 为空的示例；若后续 `works` 或 `opportunities` 空态文案映射回归，首页级测试不一定第一时间暴露
- 证据锚点: `web/src/app/page.discovery-regression.test.tsx`
- 严重级别: `minor`
- 重复性: `新风险`
- 置信度: `weak-signal`

## 缺失的防护

- 无阻塞下游质量链的高风险缺失防护

## 回归假设与扩散面

- 假设: 当前三类发现分区都继续通过统一 `HomeDiscoverySection` 组件渲染，因此单个空态文案映射问题主要表现为局部文案偏差，而不是整页结构崩坏
- 建议证伪方式: 在后续测试评审中确认组件级空态覆盖是否足以吸收该风险，必要时补参数化测试覆盖三类 `kind`

- 假设: 当前分区顺序短期内仍保持 `works -> profiles -> opportunities`，不会立刻造成用户可见回归
- 建议证伪方式: 在后续代码评审中确认是否需要把 `resolveHomeDiscoverySections()` 收敛到单一顺序来源

## 下一步

- `通过`: `ahe-test-review`
- 当前推荐: `ahe-test-review`
