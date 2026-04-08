## 结论

通过

## 上游已消费证据

- Task ID: `T18`
- 实现交接块 / 等价证据: `docs/verification/implementation-T18.md`
- 触碰工件:
  - `web/src/app/layout.tsx`
  - `web/src/app/page.tsx`
  - `web/src/features/showcase/sample-data.ts`
  - `web/src/features/home-discovery/resolver.ts`
  - `web/src/features/home-discovery/home-discovery-section.tsx`
  - `web/src/features/home-discovery/adapters.ts`
  - `web/src/app/page.test.tsx`
  - `web/src/app/page.discovery-regression.test.tsx`
  - `web/src/features/home-discovery/home-discovery-section.test.tsx`

## 命中的缺陷模式（结构化）

- Pattern ID / 名称: `BP-T18-001` / 多来源首页文案漂移
- 机制: 首页文案同时分散在 `layout.tsx`、`page.tsx`、`sample-data.ts`、`resolver.ts`、`home-discovery-section.tsx` 与 `adapters.ts`，若只改其中一部分，首页会出现中英混杂或分区前后一致性断裂。
- 证据锚点:
  - `docs/verification/implementation-T18.md`
  - `web/src/app/page.test.tsx`
  - `web/src/app/page.discovery-regression.test.tsx`
  - `web/src/features/home-discovery/home-discovery-section.test.tsx`
- 严重级别: `important`
- 重复性: `新风险`
- 置信度: `demonstrated`

- Pattern ID / 名称: `BP-T18-002` / metadata 与页面文案不同步
- 机制: 本地化改动容易只覆盖页面正文，遗漏 `html lang` 与 metadata，导致浏览器与 SEO 层仍保持英文基线。
- 证据锚点:
  - `web/src/app/layout.tsx`
  - `web/src/app/page.test.tsx`
  - `docs/verification/implementation-T18.md`
- 严重级别: `important`
- 重复性: `近似缺陷`
- 置信度: `demonstrated`

- Pattern ID / 名称: `BP-T18-003` / 结构化卡片标签残留英文
- 机制: 首页发现卡片的 badge / meta 通过 adapter 派生，如果只翻译样本数据而不翻译适配层，角色标签和元信息会继续以英文显示。
- 证据锚点:
  - `web/src/features/home-discovery/adapters.ts`
  - `web/src/features/showcase/sample-data.ts`
  - `docs/verification/implementation-T18.md`
- 严重级别: `minor`
- 重复性: `新风险`
- 置信度: `probable`

## 缺失的防护

- 无阻塞性缺口；当前任务范围内的关键高风险点已由 fail-first 首页测试和实现收口。
- 仍存在扩散到公开页与登录后页的英文字段，但这些属于 `T19` / `T20` 计划内范围，不构成 `T18` 继续留在实现态的阻塞。

## 回归假设与扩散面

- 假设: 当前首页相关的中文基线已经闭环，不会再出现“分区标题已中文化，但空态、metadata 或卡片角色标签仍为英文”的情况。
- 建议证伪方式:
  - 由下游 `ahe-test-review` 检查当前测试是否充分覆盖这些跨层 copy 风险。
  - 在 `T21` 的浏览器验证中重点检查首页 Hero、精选入口、发现分区和卡片标签是否仍有英文残留。

## 下一步

- `通过`：`ahe-test-review`

## 记录位置

- `docs/reviews/bug-patterns-T18.md`
