## 结论

通过

## 上游已消费证据

- Task ID: `T26`
- 实现交接块 / 等价证据: `docs/verification/implementation-T26.md`
- 触碰工件:
  - `web/src/app/page.tsx`
  - `web/src/app/discover/page.tsx`
  - `web/src/features/home-discovery/types.ts`
  - `web/src/features/home-discovery/config.ts`
  - `web/src/features/home-discovery/resolver.ts`
  - `web/src/features/home-discovery/home-discovery-section.tsx`
  - `web/src/app/page.test.tsx`
  - `web/src/app/page.discovery-regression.test.tsx`
  - `web/src/app/discover/page.test.tsx`
  - `web/src/features/home-discovery/*.test.ts`

## 命中的缺陷模式（结构化）

- Pattern ID / 名称: `BP-T26-001` 首页主线回落到旧展示 / 约拍叙事
  - 机制: 社区首页改造时最容易只新增一个 `/discover` 页面，但保留旧 hero、旧“展示 / 约拍平台”文案或 opportunities 主板块，导致产品主线表面变化、实际未切换。
  - 证据锚点: `web/src/app/page.tsx` 已移除旧 showcase hero 与 `opportunities` 主分区；`web/src/app/page.test.tsx`、`web/src/app/page.discovery-regression.test.tsx` 固定验证首页主标题、`/discover` 入口与“精选诉求”不再作为主 heading。
  - 严重级别: `important`
  - 重复性: `近似缺陷`
  - 置信度: `demonstrated`

- Pattern ID / 名称: `BP-T26-002` 次级合作模块重新挤占社区主板块
  - 机制: 当旧机会入口仍与首页发现层共用 resolver 或 section kind 时，约拍内容会重新以主分区身份出现，破坏 `FR-002` / `FR-008` 的降级约束。
  - 证据锚点: `web/src/features/home-discovery/resolver.ts` 仅输出 `featured / latest / following`；`web/src/app/page.tsx` 将模特主页与合作诉求收成 teaser；`web/src/features/home-discovery/resolver.test.ts` 明确证明 home surface 不再输出 `opportunities` 主分区。
  - 严重级别: `important`
  - 重复性: `新风险`
  - 置信度: `demonstrated`

- Pattern ID / 名称: `BP-T26-003` `following` 在 guest / 空 follow 条件下状态不稳
  - 机制: 关注流常见问题是未登录直接抛错、分区整块消失，或空 follow 用户看到空白区域，导致 discover 面不能稳定承接公共浏览。
  - 证据锚点: `web/src/features/home-discovery/resolver.ts` 为 guest 与 member empty state 分别提供显式 copy；`web/src/app/discover/page.test.tsx` 与 `web/src/features/home-discovery/resolver.test.ts` 覆盖 guest 可访问、登录态有分区、无 follow 输出稳定空态。
  - 严重级别: `important`
  - 重复性: `新风险`
  - 置信度: `demonstrated`

- Pattern ID / 名称: `BP-T26-004` 首页入口绑死到固定 sample 数据
  - 机制: 在迁移到 repository 读模型后，如果 hero CTA 仍硬编码到某个示例作者 slug，会让主入口依赖 seed 常量而非当前 discover 编排，后续 seed 演进时容易产生死链或偏航入口。
  - 证据锚点: 本轮已把首页次级 CTA 从固定作者路由改为 `/discover#discovery-section-latest`；`web/src/features/home-discovery/home-discovery-section.tsx` 为 discover section 提供稳定锚点。
  - 严重级别: `minor`
  - 重复性: `近似缺陷`
  - 置信度: `demonstrated`

## 缺失的防护

- 当前未发现阻止进入 `ahe-test-review` 的缺失防护。
- 已知边界仍存在：次级合作 teaser 目前是静态入口，不消费实时 opportunity feed；这属于设计上接受的缩减范围，不构成 `T26` 阻塞项。

## 回归假设与扩散面

- 假设: 首页和 `/discover` 的主线切换不会破坏既有公开页和默认 SQLite 读路径。
  - 建议证伪方式: 继续消费 `docs/verification/implementation-T26.md` 中的 fresh `test + build` 证据，并在后续 `ahe-regression-gate` 复核公开页与 build。

- 假设: `featured` / `latest` / `following` 三分区已经足够吸收“主线回退”“次级模块抢位”“空 follow 崩溃”三类高风险模式。
  - 建议证伪方式: 在 `ahe-test-review` 中重点核对页面测试与 resolver 测试是否真的覆盖 guest、无 follow、home surface 不输出 `opportunities` 等行为，而不是只验证静态文案。

## 下一步

- `通过`：`ahe-test-review`

## 记录位置

- `docs/reviews/bug-patterns-T26.md`
