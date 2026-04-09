## 测试设计确认

- Task ID: `T27`
- Execution Mode: `auto`
- Approval 依据:
  - `task-progress.md` 已记录“用户已授权后续测试设计直接视为确认”。
  - 当前轮用户继续要求自动推进，因此本轮按 `ahe-test-driven-dev` 的 auto approval step 落盘确认。

## 测试范围

- 页面层:
  - `web/src/app/studio/profile/page.test.tsx`
  - 验证 `studio/profile` 在登录且具备 creator 能力时渲染 repository-backed 的资料表单，并继续保留 guest `StudioGuard` 拦截。
- 写路径 / 读后可见层:
  - `web/src/features/community/profile-editor.test.ts`
  - `web/src/features/community/public-read-model.test.ts`
  - 验证资料保存会写入 repository 真源，且后续公共主页读取会看到最新名称 / 城市 / tagline / bio。
- 公共读取回归层:
  - `web/src/app/photographers/[slug]/page.test.tsx`
  - `web/src/app/models/[slug]/page.test.tsx`
  - 验证本轮写路径接入不会破坏现有公开主页路由与隐藏内容处理。

## 关键正向 / 反向场景

- 正向:
  - 已登录创作者可以看到当前 repository 中的公开资料，并提交保存。
  - 保存后，同一真源下的 public read model 再次读取能看到最新资料。
- 反向:
  - 未登录用户仍被 `StudioGuard` 重定向到 `/login`。
  - 写摄影师资料时，不应破坏模特主页路由；写模特资料时，不应破坏摄影师主页路由。
  - 当当前 role 下找不到可维护的 creator profile 时，不应静默成功。

## 预期 RED

- `studio/profile/page.tsx` 目前直接读取 `sample-data` 且按钮不是 server action；新增 repository-backed 页面测试与 profile write 契约测试后，应因缺少真实写入入口和页面仍旁路真源而失败。

## 分层说明

- 页面测试可 mock `access-control` 与 profile editor 边界，但不 mock 页面自身 DOM 结构。
- 写路径测试直接使用 in-memory / sqlite bundle 与 public read model 证明“写后可读”，不把页面壳测试当成写路径证据。

## 轻量自检

- 已覆盖任务种子要求的主行为：资料保存闭环、公开主页后续读取可见。
- 已覆盖关键边界：guest 拦截、双角色主页路由稳定、缺失可维护 profile 不得静默成功。
- 当前测试能抓住“页面看起来有表单，但仍然没有 repository 写路径”的伪完成实现。

## 结论

- `通过`：允许进入 `T27` 的 fail-first。
