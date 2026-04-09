## 测试设计确认

- Task ID: `T25`
- Execution Mode: `auto`
- Approval 依据:
  - `task-progress.md` 已记录“用户已授权后续测试设计直接视为确认”。
  - 当前轮用户再次要求“auto mode 完成剩下的任务”，因此本轮按 `ahe-test-driven-dev` 的 auto approval step 落盘确认。

## 测试范围

- 公共读模型层:
  - `web/src/features/community/public-read-model.test.ts`
  - 验证 repository 记录可被转换为公开创作者主页与作品详情页消费的 `PublicProfile` / `PublicWork` 形状。
  - 验证 profile 页展示项与作品详情静态参数只包含 `published` 作品。
- 页面消费层:
  - `web/src/app/photographers/[slug]/page.test.tsx`
  - `web/src/app/models/[slug]/page.test.tsx`
  - `web/src/app/works/[workId]/page.test.tsx`
  - 验证三条公开路由改为经由 community 公共读模型获取数据，而不是继续直接读取 `sample-data`。

## 关键正向 / 反向场景

- 正向:
  - 访客继续可以访问摄影师 / 模特主页与作品详情页。
  - 公开主页中的 `showcaseItems` 来自 repository 中该创作者的已发布作品。
  - 作品详情页继续展示作者摘要与现有互动入口。
- 反向:
  - draft work 不得通过 profile showcase、作品详情页或 `generateStaticParams()` 泄漏到公开面。
  - 当公共读模型返回 `null` 时，公开页必须走 `notFound()`，而不是回退到旧 `sample-data`。

## 预期 RED

- 在新增 `public-read-model.test.ts` 并让三条公开页测试依赖新的 community 公共读模型后，当前代码应因缺少该读模型模块、且页面仍直接读取 `sample-data` 而失败。

## 分层说明

- 公共读模型测试覆盖 repository -> page model 的核心转换逻辑，不 mock repository 返回值以外的业务规则。
- 页面测试只 mock 公共读模型边界与 `next/navigation`，避免在页面层重复测试 repository SQL 细节。

## 轻量自检

- 已覆盖任务种子中的主行为：公开主页 / 作品详情继续可访问，但数据源迁移到 repository 读模型。
- 已覆盖关键边界：draft 不公开、static params 不泄漏、`notFound` 继续成立。
- 当前测试能抓住“页面看起来没变，但仍偷偷直读 `sample-data`”的伪完成实现。

## 结论

- `通过`：允许进入 `T25` 的 fail-first。
