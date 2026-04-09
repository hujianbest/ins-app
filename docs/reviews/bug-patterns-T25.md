## 结论

通过

## 上游已消费证据

- Task ID: `T25`
- 实现交接块 / 等价证据: `docs/verification/implementation-T25.md`
- 触碰工件:
  - `web/src/features/community/public-read-model.ts`
  - `web/src/features/community/public-read-model.test.ts`
  - `web/src/features/community/sqlite.ts`
  - `web/src/app/photographers/[slug]/page.tsx`
  - `web/src/app/photographers/[slug]/page.test.tsx`
  - `web/src/app/models/[slug]/page.tsx`
  - `web/src/app/models/[slug]/page.test.tsx`
  - `web/src/app/works/[workId]/page.tsx`
  - `web/src/app/works/[workId]/page.test.tsx`

## 命中的缺陷模式（结构化）

- Pattern ID / 名称: `BP-T25-001` / 公开页继续旁路直读 `sample-data`
- 机制: 历史风险是页面表面上完成迁移，但实际仍从 `sample-data` 直接取 profile / work，导致 `T24` 建立的 repository-backed 真源没有被公开读取面真正消费。当前修订已新增 `public-read-model.ts` 作为唯一 page-facing 边界，并把三条公开路由与 `generateStaticParams()` 都切到该边界，因此该模式已被吸收。
- 证据锚点:
  - `web/src/features/community/public-read-model.ts`
  - `web/src/features/community/public-read-model.test.ts`
  - `web/src/app/photographers/[slug]/page.tsx`
  - `web/src/app/models/[slug]/page.tsx`
  - `web/src/app/works/[workId]/page.tsx`
- 严重级别: `important`
- 重复性: `近似缺陷`
- 置信度: `demonstrated`

- Pattern ID / 名称: `BP-T25-002` / draft work 通过公开主页、详情页或静态参数泄漏
- 机制: 公开读取迁移最容易遗漏的路径是 `listByOwnerProfileId()`、`getById()` 与 `generateStaticParams()` 的过滤口径不一致，从而让草稿作品仍能被预渲染或直接访问。当前修订通过 `public-read-model` 统一过滤 published works，并在 page tests 与 read-model tests 中同时覆盖 `notFound()` 与 static params，不再依赖页面层手写分支兜底。
- 证据锚点:
  - `web/src/features/community/public-read-model.ts`
  - `web/src/features/community/public-read-model.test.ts`
  - `web/src/app/works/[workId]/page.test.tsx`
  - `docs/specs/2026-04-08-photography-community-platform-srs.md`
- 严重级别: `critical`
- 重复性: `新风险`
- 置信度: `demonstrated`

- Pattern ID / 名称: `BP-T25-003` / 构建期并发读取触发 SQLite 锁或异常路径连接泄漏
- 机制: 接入默认 SQLite bundle 后，若公开页继续复用可写连接或在异常路径上漏掉 `close()`，Next 构建阶段并发收集页面数据时会再次命中 `database is locked` 或遗留文件句柄。当前修订已把公开读模型收敛为“先确保默认库初始化，再使用短生命周期只读 bundle 查询，并在 `finally` 中释放”，同时 fresh `npm run build` 已证伪这一风险。
- 证据锚点:
  - `web/src/features/community/sqlite.ts`
  - `web/src/features/community/public-read-model.ts`
  - `docs/verification/implementation-T25.md`
- 严重级别: `important`
- 重复性: `重复缺陷`
- 置信度: `demonstrated`

- Pattern ID / 名称: `BP-T25-004` / 展示文案与持久化数据分离导致后续漂移
- 机制: 当前 profile 页的 `sectionTitle`、`sectionDescription`、`heroImageLabel` 与 `contactLabel` 仍来自 read-model 内的 role-level copy，而不是实体字段。这不会立刻破坏 `T25` 的公开读取正确性，但后续若需要按创作者自定义或后台配置展示文案，可能出现“页面展示文案不随 repository 演进”的漂移。
- 证据锚点:
  - `web/src/features/community/public-read-model.ts`
  - `docs/verification/implementation-T25.md`
  - `docs/designs/2026-04-08-photography-community-platform-design.md`
- 严重级别: `minor`
- 重复性: `新风险`
- 置信度: `probable`

## 缺失的防护

- 无阻塞下游 `ahe-test-review` 的高风险缺口。
- 当前剩余风险主要是非阻塞受控项：
  - `BP-T25-001` 已由页面边界迁移与 mock-based page tests 吸收。
  - `BP-T25-002` 已由 read-model 过滤、`notFound()` 路径与 static params 测试吸收。
  - `BP-T25-003` 已由只读 bundle 生命周期修订与 fresh build evidence 吸收。
  - `BP-T25-004` 仍是 minor 级演进风险，需在后续设计 / 增量任务中显式管理。

## 回归假设与扩散面

- 假设: 当前三条公开页已经真正消费 `T24` 的 repository-backed 真源，因此未来公开读取行为不会再被 `sample-data` 旁路主导。
- 建议证伪方式:
  - 在 `ahe-test-review` 与后续 `T26` 中继续检查首页 / `/discover` 的公开读取是否沿用同一 `public-read-model` / repository 边界，而不是重新引入 sample-data 直读。

- 假设: 公开读模型使用短生命周期只读 SQLite bundle 后，构建期与请求期的并发读取都不会再次触发文件锁。
- 建议证伪方式:
  - 在 `ahe-regression-gate` 中继续把 `npm run build` 纳入 fresh evidence，并在后续涉及默认 bundle 的页面 / action 接入时观察是否出现新的锁或句柄泄漏信号。

## 下一步

- `通过`：`ahe-test-review`

## 记录位置

- `docs/reviews/bug-patterns-T25.md`
