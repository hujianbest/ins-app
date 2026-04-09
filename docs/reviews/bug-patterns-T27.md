## 结论

通过

## 上游已消费证据

- Task ID: `T27`
- 实现交接块 / 等价证据: `docs/verification/implementation-T27.md`
- 触碰工件:
  - `web/src/app/studio/profile/page.tsx`
  - `web/src/features/community/types.ts`
  - `web/src/features/community/sqlite.ts`
  - `web/src/features/community/test-support.ts`
  - `web/src/features/community/profile-editor.ts`
  - `web/src/features/community/profile-actions.ts`
  - `web/src/app/studio/profile/page.test.tsx`
  - `web/src/features/community/profile-editor.test.ts`

## 命中的缺陷模式（结构化）

- Pattern ID / 名称: `BP-T27-001` `studio/profile` 继续旁路 `sample-data`
  - 机制: 页面很容易只是把表单继续绑在 `sample-data` 默认值上，再新增一个看似可提交的按钮，导致公开主页读取面与工作台写路径分裂。
  - 证据锚点: `web/src/app/studio/profile/page.tsx` 已改为消费 `getStudioProfileEditorModel()` 与 `saveStudioProfileAction()`；`web/src/app/studio/profile/page.test.tsx` 固定验证页面显示 repository-backed 资料而非旧样本。
  - 严重级别: `important`
  - 重复性: `近似缺陷`
  - 置信度: `demonstrated`

- Pattern ID / 名称: `BP-T27-002` 写路径未被公共读面吸收
  - 机制: 资料保存如果只改页面局部状态或单独 cookie，而没有进入 community repository 真源，公共主页后续读取仍会看到旧资料。
  - 证据锚点: `web/src/features/community/profile-editor.test.ts` 直接证明 `saveCreatorProfileForRole()` 后，`getPublicProfilePageModel()` 能读取到更新后的名称 / 城市 / tagline / bio。
  - 严重级别: `important`
  - 重复性: `新风险`
  - 置信度: `demonstrated`

- Pattern ID / 名称: `BP-T27-003` 当前会话写到错误 creator profile
  - 机制: 当前认证只有 `primaryRole` / `accountId`，没有显式 `creatorProfileId`；如果写路径继续默认命中某个 sample slug，就可能把资料保存到错误对象。
  - 证据锚点: `web/src/features/community/profile-editor.ts` 改为在 repository 中解析“当前 role 下唯一 creator profile”，并在缺失 / 非唯一时抛错；`profile-editor.test.ts` 覆盖了缺失 profile 的拒绝路径。
  - 严重级别: `important`
  - 重复性: `新风险`
  - 置信度: `demonstrated`

- Pattern ID / 名称: `BP-T27-004` 未登录或无权限路径绕过 `StudioGuard`
  - 机制: 表单引入 server action 后，若只保护页面渲染而不在 action 内复核，会形成 guest 直接提交写请求的旁路。
  - 证据锚点: `web/src/features/community/profile-actions.ts` 在提交时再次调用 `getRequestAccessControl()` 并对未授权请求执行 redirect；`web/src/app/studio/profile/page.test.tsx` 保留 guest redirect 证明。
  - 严重级别: `important`
  - 重复性: `近似缺陷`
  - 置信度: `probable`

## 缺失的防护

- 当前未发现阻止进入 `ahe-test-review` 的缺失防护。
- 已知边界仍存在：当前只支持“当前 role 下唯一 creator profile”的 demo 写入边界；若未来支持同 role 多创作者账号，需要显式引入账号 -> profile 绑定。

## 回归假设与扩散面

- 假设: `studio/profile` 的 server action 接入不会破坏既有公开主页路由与当前 build 链。
  - 建议证伪方式: 在后续 `ahe-regression-gate` 中复核 `studio/profile`、`photographers/[slug]`、`models/[slug]` 相关测试与完整 build。

- 假设: 当前 role -> 唯一 creator profile 的解析边界足以支撑 demo 账号体系，不会在本轮任务范围内误写其他资料。
  - 建议证伪方式: 在 `ahe-test-review` / `ahe-code-review` 中继续核对缺失 / 非唯一路径是否真的被拒绝，而不是静默回退到某个 sample slug。

## 下一步

- `通过`：`ahe-test-review`

## 记录位置

- `docs/reviews/bug-patterns-T27.md`
