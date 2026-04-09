## 测试设计确认

- Task ID: `T23`
- Execution Mode: `auto`
- Approval 依据:
  - `task-progress.md` 已记录“用户已授权后续测试设计直接视为确认”。
  - 当前轮用户显式要求“auto mode继续往下”，因此本轮按 `ahe-test-driven-dev` 的 auto approval step 落盘确认。

## 测试范围

- 纯权限层:
  - `web/src/features/auth/access-control.test.ts`
  - 验证 `CreatorCapabilityPolicy` 将 `摄影师` 与 `模特` 都视为可维护主页、可发布作品的创作者。
  - 验证非法 / 缺失 cookie 会回落为 guest `SessionContext`，且 `StudioGuard` 会要求跳转登录。
- 页面守卫消费层:
  - `web/src/app/studio/page.test.tsx`
  - `web/src/app/studio/works/page.test.tsx`
  - 验证 `studio` 首页与现有工作台子页通过共享 `AccessControl` / `StudioGuard` 消费统一会话上下文，而不是继续手写页面级登录判断。

## 关键正向 / 反向场景

- 正向:
  - `photographer` 与 `model` 两类主身份都通过 `CreatorCapabilityPolicy` 获得创作者能力。
  - `model` 主身份通过 `CreatorCapabilityPolicy` 获得主页维护和作品发布资格。
  - 已登录创作者通过 `StudioGuard` 进入 `studio` 首页。
- 反向:
  - 缺失或非法 cookie 会被解析为 guest，会话不应伪装成已登录。
  - guest 访问 `studio/works` 时也必须被共享守卫拦截。
  - guest 访问 `studio` 首页时继续被重定向到 `/login`。

## 预期 RED

- 在新增 `access-control.test.ts` 并引用 `SessionContext` / `AccessControl` / `StudioGuard` / `CreatorCapabilityPolicy` 相关 API 后，当前代码应因缺少统一权限模块与会话上下文 API 而失败。

## 分层说明

- `src/features/auth` 下测试属于纯逻辑 / 单元测试，不 mock 自身权限逻辑。
- `src/app/studio/page.test.tsx` 属于页面级 server component 测试，允许 mock `redirect` 与共享 access-control 边界，但不再回退为页面手写 `getSessionRole()` 判断。

## 轻量自检

- 已覆盖任务种子要求的主行为：模特主身份也可进入创作者发布路径。
- 已覆盖关键负向场景：非法或缺失会话必须回落为未登录。
- 当前测试能抓住“角色存在但权限层没统一建立”与“页面仍散落手写守卫”的伪完成实现。

## 结论

- `通过`：允许进入 `T23` 的 fail-first。
