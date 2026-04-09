## 结论

通过

## 上游已消费证据

- Task ID: `T28`
- 实现交接块 / 等价证据: `docs/verification/implementation-T28.md`
- `ahe-bug-patterns` 记录: `docs/reviews/bug-patterns-T28.md`
- 测试设计: `docs/verification/test-design-T28.md`
- 流程状态: `task-progress.md`（`T28` 已通过 `ahe-bug-patterns`，待 `ahe-test-review`）
- 工程约定: `web/AGENTS.md`

## 发现项

- [minor] `saveStudioWorkAction()` 的专项测试当前仍以 mock `saveCreatorWorkForRole()` 为主，没有把 action 与真实 sqlite bundle 串成一条端到端链路；当前 repository / 可见性契约已由 `work-editor.test.ts` 承接，因此不构成阻断。
- [minor] `studio/works/page.test.tsx` 没有直接断言 `getStudioWorksEditorModel()` 的调用参数，只通过页面显示 repository-backed 表单字段证明接真源；若后续页面逻辑显著复杂，可考虑补 `toHaveBeenCalledWith`。
- [minor] `/discover` 并未在 `T28` 专项测试中直接再次断言草稿不可见；当前依赖 `public-read-model` 与 `listPublicWorks()` 的共享 published 过滤，以及 `T26` 的 discover 测试边界共同承接。

## 测试 ↔ 行为映射

- `studio/works` 已登录时展示 repository-backed 作品列表、状态标签与新增 / 编辑入口: `web/src/app/studio/works/page.test.tsx`
- `studio/works` guest 仍被 `StudioGuard` 重定向到 `/login`: `web/src/app/studio/works/page.test.tsx`
- 新作品草稿创建后不会进入公开详情、公开作品参数或公开主页展示区: `web/src/features/community/work-editor.test.ts`
- 作品发布后进入公开面，已发布作品用 `publish` 或 `save_draft` 保存修改时仍保持公开，只有显式 `revert_to_draft` 才退出公开面: `web/src/features/community/work-editor.test.ts`
- `saveStudioWorkAction()` 会对 guest redirect、对授权用户调用保存逻辑并 revalidate studio / home / discover / profile / work 相关路径: `web/src/features/community/work-actions.test.ts`
- 作品详情页继续在 `getPublicWorkPageModel()` 返回 `null` 时走 `notFound`，保持 draft 隐藏边界: `web/src/app/works/[workId]/page.test.tsx`

## 测试质量缺口

- 当前未直接覆盖“同 role 多 creator profile”时的作品保存拒绝路径；这与 `T27` 的账号模型边界相同，属于共享 demo 假设，不阻止进入 code review。
- 默认 sqlite bundle 的页面级集成仍主要由 `work-editor.test.ts`、`public-read-model.test.ts` 与 fresh build 共同承接；页面测试本身继续按边界 mock。

## 给 `ahe-code-review` 的提示

- 已可信的测试结论: 在显式 `:memory:` bundle 上，`saveCreatorWorkForRole()` 与 public read model 已形成“草稿创建 -> 发布 -> 已发布再编辑仍公开 -> 显式回退草稿退出公开”的真实闭环；action 级 guest redirect 与 revalidate 路径也已有直接证明。
- 仍需重点怀疑的实现风险: SQLite `save()` 的 upsert 是否与 owner 校验边界一致；`test-support.ts` 的列表顺序是否会和生产查询漂移；页面按钮语义与状态机是否始终同步。

## 下一步

- `ahe-code-review`

## 记录位置

- `docs/reviews/test-review-T28.md`
