## 结论

通过

## 上游已消费证据

- Task ID: `T27`
- 实现交接块 / 等价证据: `docs/verification/implementation-T27.md`
- `ahe-bug-patterns` 记录: `docs/reviews/bug-patterns-T27.md`
- 测试设计: `docs/verification/test-design-T27.md`
- 流程状态: `task-progress.md`（`T27` 已通过 `ahe-bug-patterns`，待 `ahe-test-review`）
- 工程约定: `web/AGENTS.md`

## 发现项

- [minor] `test-design-T27.md` 将 `web/src/features/community/public-read-model.test.ts` 列为写后可见层参考测试，但 `implementation-T27.md` 的 GREEN 命令主要使用 `studio/profile` 页面测试与新 `profile-editor.test.ts`；后续追溯时应区分“本轮主证据套件”和“相邻 community 读模型既有契约”。
- [minor] `web/src/features/community/profile-actions.ts` 已在 `saveStudioProfileAction()` 内复核 `getRequestAccessControl()`，但自动化测试目前只覆盖页面级 guest redirect，未直接覆盖 action 未授权短路行为。
- [minor] `web/src/features/community/profile-editor.ts` 对“当前 role 下 creator profile 数量不为 1”统一抛错，当前测试只覆盖 `0` 个 profile 的拒绝路径，未覆盖“同 role 多 profile”情形。

## 测试 ↔ 行为映射

- `studio/profile` 已登录时展示 repository-backed editor model 字段值与保存按钮: `web/src/app/studio/profile/page.test.tsx`
- `studio/profile` guest 仍被 `StudioGuard` 重定向到 `/login`: `web/src/app/studio/profile/page.test.tsx`
- 资料写入 repository 真源后，公开 profile 读模型可见更新: `web/src/features/community/profile-editor.test.ts`
- 当前 role 在 repository 中无法解析到唯一 creator profile 时，保存会失败: `web/src/features/community/profile-editor.test.ts`
- 摄影师 / 模特公开主页路由、静态参数与 `notFound` 行为仍保持稳定: `web/src/app/photographers/[slug]/page.test.tsx`、`web/src/app/models/[slug]/page.test.tsx`

## 测试质量缺口

- 缺少针对 `saveStudioProfileAction()` 的专项测试；当前尚未直接证明 action 内访问控制和字段校验的 fail-fast。
- 未覆盖“同 role 多个公开 profile”时的拒绝行为。
- 页面层对 `getStudioProfileEditorModel()` 与公开页 read model 使用 mock；这与已批准测试设计的分层一致，但意味着默认 sqlite bundle 的页面级集成要由下游代码评审与回归门禁继续核对。

## 给 `ahe-code-review` 的提示

- 已可信的测试结论: 在显式 `:memory:` bundle 上，`saveCreatorProfileForRole()` 与 `getPublicProfilePageModel()` 已形成“写后可读”的真实闭环；缺失 profile 的拒绝路径与 `studio/profile` guest redirect 也已有证明。
- 仍需重点怀疑的实现风险: `saveStudioProfileAction()` 与页面守卫是否始终一致；当前 role -> 唯一 creator profile 的解析边界；默认 repository bundle 与测试注入 bundle 的对齐。

## 下一步

- `ahe-code-review`

## 记录位置

- `docs/reviews/test-review-T27.md`
