## 结论

通过

## 上游已消费证据

- Task ID: `T28`
- 实现交接块 / 等价证据: `docs/verification/implementation-T28.md`
- 触碰工件:
  - `web/src/app/studio/works/page.tsx`
  - `web/src/features/community/types.ts`
  - `web/src/features/community/sqlite.ts`
  - `web/src/features/community/test-support.ts`
  - `web/src/features/community/work-editor.ts`
  - `web/src/features/community/work-actions.ts`
  - `web/src/app/studio/works/page.test.tsx`
  - `web/src/features/community/work-editor.test.ts`
  - `web/src/features/community/work-actions.test.ts`

## 命中的缺陷模式（结构化）

- Pattern ID / 名称: `BP-T28-001` `studio/works` 继续旁路 `sample-data`
  - 机制: 页面很容易只是保留旧作品列表壳，再加几个看似可点击的按钮，导致 studio 写路径与 repository 真源分裂。
  - 证据锚点: `web/src/app/studio/works/page.tsx` 已改为消费 `getStudioWorksEditorModel()` 与 `saveStudioWorkAction()`；`web/src/app/studio/works/page.test.tsx` 固定验证页面显示 repository-backed 作品而非旧样本列表。
  - 严重级别: `important`
  - 重复性: `近似缺陷`
  - 置信度: `demonstrated`

- Pattern ID / 名称: `BP-T28-002` 草稿作品通过公开读面泄漏
  - 机制: 若 studio 保存动作只改局部状态、或者公开读面和写面不共享同一 repository 真源，草稿可能通过作品详情、主页展示区或 static params 泄漏。
  - 证据锚点: `web/src/features/community/work-editor.test.ts` 联合 `getPublicWorkPageModel()`、`listPublicWorkPageParams()` 与 `getPublicProfilePageModel()` 证明草稿创建后不会进入公开面；`public-read-model.ts` 继续只暴露 `published`。
  - 严重级别: `important`
  - 重复性: `新风险`
  - 置信度: `demonstrated`

- Pattern ID / 名称: `BP-T28-003` 已发布作品保存修改时意外退出公开面
  - 机制: 若“保存修改”和“回退草稿”共用同一状态转换，已发布作品在普通编辑后会错误变成 draft，与任务要求“只有显式回退草稿才退出公开”矛盾。
  - 证据锚点: `web/src/features/community/work-editor.ts` 的 `resolveNextVisibility()` 现已区分 `publish`、`save_draft`、`revert_to_draft`；`work-editor.test.ts` 明确覆盖“已发布作品以 `save_draft` 保存仍保持公开，只有 `revert_to_draft` 才退出公开”。
  - 严重级别: `important`
  - 重复性: `新风险`
  - 置信度: `demonstrated`

- Pattern ID / 名称: `BP-T28-004` 未登录或无权限路径绕过 `StudioGuard`
  - 机制: 表单引入 server action 后，若只保护页面渲染而不在 action 内复核，会形成 guest 直接提交写请求的旁路。
  - 证据锚点: `web/src/features/community/work-actions.ts` 在提交时再次调用 `getRequestAccessControl()` 并对未授权请求执行 redirect；`web/src/features/community/work-actions.test.ts` 直接覆盖 action 级 guest redirect。
  - 严重级别: `important`
  - 重复性: `近似缺陷`
  - 置信度: `demonstrated`

## 缺失的防护

- 当前未发现阻止进入 `ahe-test-review` 的缺失防护。
- 已知边界仍存在：数据库层没有额外 owner 行级约束，当前依赖 `saveCreatorWorkForRole()` 作为唯一写入口；若未来引入更多写入口，需要显式补强。

## 回归假设与扩散面

- 假设: `studio/works` 的 server action 接入不会破坏作品详情、公开主页展示区与首页 / discover 的已发布作品读取。
  - 建议证伪方式: 在后续 `ahe-regression-gate` 中复核 `work-editor`、`public-read-model`、`works/[workId]`、`studio/works` 相关测试与完整 build。

- 假设: 当前 role -> 唯一 creator profile 的解析边界足以支撑 demo 账号体系，不会误写其他创作者作品。
  - 建议证伪方式: 在 `ahe-test-review` / `ahe-code-review` 中继续核对缺失 / 非唯一路径是否真的被拒绝，而不是静默回退到某个 sample slug。

## 下一步

- `通过`：`ahe-test-review`

## 记录位置

- `docs/reviews/bug-patterns-T28.md`
