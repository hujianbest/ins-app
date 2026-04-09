## 测试设计确认

- Task ID: `T24`
- Execution Mode: `auto`
- Approval 依据:
  - `task-progress.md` 已记录“用户已授权后续测试设计直接视为确认”。
  - 当前轮用户显式要求“auto mode 完成剩下的任务”，因此本轮按 `ahe-test-driven-dev` 的 auto approval step 落盘确认。

## 测试范围

- SQLite adapter / seed 层:
  - `web/src/features/community/sqlite.test.ts`
  - 验证内建 `node:sqlite` repository adapter 能持久化并返回 `profiles`、`works`、`curation` 三类数据。
  - 验证默认 seed 会把 `sample-data.ts` 与 `home-discovery/config.ts` 转成 SQLite 初始数据，而不是继续把这些模块当运行时真源。
  - 在 `ahe-bug-patterns` 回流后，追加验证文件 SQLite 在二次装配时不会无条件重 seed 覆盖既有数据，并确保 bundle 具备显式关闭出口，避免后续真实文件库锁与生命周期漂移。

## 关键正向 / 反向场景

- 正向:
  - seed 后 `listPublicProfiles()`、`listPublicWorks()`、`listSlotsBySurface("home" | "discover")` 都返回稳定读结果。
  - `home-discovery/config.ts` 中合法的 works / profiles / opportunities 精选项会被转成 `CuratedSlotRecord`。
  - file-backed SQLite bundle 在同一路径二次创建时仍保留首轮 seed 状态，而不是被新 seed 覆盖。
- 反向:
  - draft work 不得进入公开读取集合。
  - 无效精选目标必须在 seed 时被跳过，而不是带进 repository-backed curation 结果。
  - repository lifecycle 不能隐式依赖进程级瞬时内存库；默认装配必须有稳定文件路径或显式约束说明。

## 预期 RED

- 在新增 `sqlite.test.ts` 并引用新的 SQLite adapter / seed API 后，当前代码应因缺少 concrete repository 实现与 seed bridge 能力而失败。

## 分层说明

- 当前测试属于 repository adapter / seed 层测试，优先使用内存 SQLite，避免把页面层和 Server Actions 混进 `T24` 的证明范围。
- mock 只允许停留在 seed 输入边界；不 mock repository 自身的 SQL 读写逻辑。

## 轻量自检

- 已覆盖任务种子要求的主行为：seed 后公开读取稳定、人工精选存在且可回读。
- 已覆盖关键负向场景：无效精选目标跳过、draft work 不进入公开读取。
- 当前测试能抓住“看似有 repository bundle，但仍偷偷把 sample-data 当运行时真源”以及“每次重建 adapter 就把 SQLite 重新 seed 成初始样本”的伪完成实现。

## 结论

- `通过`：允许进入 `T24` 的 fail-first。
