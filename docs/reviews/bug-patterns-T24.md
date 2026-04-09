## 结论

通过

## 上游已消费证据

- Task ID: `T24`
- 实现交接块 / 等价证据: `docs/verification/implementation-T24.md`
- 触碰工件:
  - `web/package.json`
  - `web/src/features/community/sqlite.ts`
  - `web/src/features/community/sqlite.test.ts`
  - `docs/verification/test-design-T24.md`

## 命中的缺陷模式（结构化）

- Pattern ID / 名称: `BP-T24-001` / 默认 `:memory:` 连接导致伪持久化真源
- 机制: 历史风险是 bundle 默认走 `DatabaseSync(":memory:")` 并在创建时无条件 seed，导致看似 repository-backed、实际每次装配都回到样本初始值。当前修订已把默认数据库路径固定到 `web/.data/community.sqlite`，并且只在空库时 seed，因此该模式已被吸收。
- 证据锚点:
  - `web/src/features/community/sqlite.ts`
  - `docs/verification/implementation-T24.md`
  - `docs/tasks/2026-04-08-photography-community-platform-tasks.md`
  - `docs/designs/2026-04-08-photography-community-platform-design.md`
- 严重级别: `important`
- 重复性: `新风险`
- 置信度: `demonstrated`

- Pattern ID / 名称: `BP-T24-002` / 进程内连接无释放与无共享实例导致后续文件库锁风险
- 机制: 历史风险是 bundle 只暴露查询闭包、不暴露关闭出口，且缺少默认实例复用入口。当前修订已给 bundle 增加 `close()` 与 `databasePath`，同时补了默认 bundle 复用入口与文件库重建不重 seed 测试，因此这条风险降为已知但受控。
- 证据锚点:
  - `web/src/features/community/sqlite.ts`
  - `web/node_modules/@types/node/sqlite.d.ts`
  - `docs/designs/2026-04-08-photography-community-platform-design.md`
- 严重级别: `important`
- 重复性: `近似缺陷`
- 置信度: `probable`

- Pattern ID / 名称: `BP-T24-003` / 人工精选校验对 `opportunity` 仍是旁路白名单
- 机制: works / profiles 的精选合法性来自当前 seed 实体本身，但 `opportunity` 精选只依赖 `opportunityIds` 辅助白名单，而不是 repository 内的公开实体校验。这会保留一条“精选目标合法性不走统一真源”的旁路，后续若次级合作模块状态发生变化，`curation` 与实际可见内容可能再次漂移。
- 证据锚点:
  - `web/src/features/community/sqlite.ts`
  - `docs/verification/implementation-T24.md`
  - `docs/designs/2026-04-08-photography-community-platform-design.md`
- 严重级别: `minor`
- 重复性: `新风险`
- 置信度: `demonstrated`

## 缺失的防护

- 无阻塞下游 `ahe-test-review` 的高风险缺口。
- 当前剩余风险主要是非阻塞受控项：
  - `BP-T24-001` 已被稳定文件路径 + 空库 seed 条件 + 文件库二次装配测试吸收。
  - `BP-T24-002` 已被 `close()` 出口、默认 bundle 复用入口与当前 task-level 测试吸收，但后续真实页面 / action 接入时仍需继续关注调用侧生命周期。
  - `BP-T24-003` 仍是 minor 级过渡风险，需要在后续任务或次级模块回归中继续显式管理。

## 回归假设与扩散面

- 假设: 当前修订后的默认 SQLite 装配已具备稳定文件路径与空库 seed 约束，因此 `T24` 的“repository-backed 真源”声明已不再依赖瞬时内存库前提。
- 建议证伪方式:
  - 在 `ahe-test-review` 与后续 `T25/T27/T28` 中继续检查页面 / action 接入是否真的消费默认文件库或显式传入的 repository bundle，而不是绕回 `sample-data`。

- 假设: `opportunity` 模块暂未纳入社区主线 repository bundle，所以白名单式精选校验目前只是过渡，不会立刻破坏主页 / 发现页主链。
- 建议证伪方式:
  - 在回流修订中补充注释或显式约束，说明 `opportunityIds` 仅是 `T31/T32` 之前的临时 bridge；后续测试评审继续检查它是否被误当成长期真源。

## 下一步

- `通过`：`ahe-test-review`

## 记录位置

- `docs/reviews/bug-patterns-T24.md`
