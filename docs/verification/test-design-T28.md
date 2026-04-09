## 测试设计确认

- Task ID: `T28`
- Execution Mode: `auto`
- Approval 依据:
  - `task-progress.md` 已记录“用户已授权后续测试设计直接视为确认”。
  - 当前轮用户继续要求自动推进，因此本轮按 `ahe-test-driven-dev` 的 auto approval step 落盘确认。

## 测试范围

- 页面层:
  - `web/src/app/studio/works/page.test.tsx`
  - 验证 `studio/works` 在登录且具备 creator 能力时渲染 repository-backed 作品列表与草稿 / 发布状态入口，并继续保留 guest `StudioGuard` 拦截。
- 写路径 / 可见性层:
  - `web/src/features/community/work-editor.test.ts`
  - `web/src/features/community/public-read-model.test.ts`
  - 验证创建草稿不会进入公开面、发布后可进入公开面、已发布编辑后保持公开、显式回退草稿后退出公开面。
- 公共读取回归层:
  - `web/src/app/works/[workId]/page.test.tsx`
  - 验证作品详情路由仍通过 public read model 隐藏 draft 并维持公开展示行为。

## 关键正向 / 反向场景

- 正向:
  - 创作者可创建新作品草稿。
  - 创作者可发布作品，并继续编辑已发布作品且保持公开可见。
  - 创作者可显式把已发布作品回退为草稿。
- 反向:
  - 草稿作品不得进入公开主页、发现页或作品详情。
  - guest 用户仍被 `StudioGuard` 拦截，不能进入管理路径。
  - 若图片上传系统尚未到位，本轮只要求 `coverAsset` 引用稳定，不扩展上传系统本身。

## 预期 RED

- `studio/works` 目前直接读取 `sample-data` 且没有真实状态写入；新增 repository-backed 页面测试与作品发布契约测试后，应因缺少 work editor 模块、没有草稿 / 发布写路径、页面仍旁路真源而失败。

## 分层说明

- 页面测试可 mock `access-control` 与 work editor 边界，但不 mock 页面自身 DOM 结构。
- 写路径测试直接使用 sqlite bundle 与 public read model 证明“草稿 / 已发布 / 回退草稿”的公开可见性，不把页面壳测试当成作品状态证据。

## 轻量自检

- 已覆盖任务种子要求的主行为：草稿创建、发布、已发布再编辑、显式回退草稿。
- 已覆盖关键边界：草稿不可见、guest 拦截、`coverAsset` 仅作为引用链路稳定。
- 当前测试能抓住“页面看起来有管理按钮，但没有真实作品状态写路径”的伪完成实现。

## 结论

- `通过`：允许进入 `T28` 的 fail-first。
