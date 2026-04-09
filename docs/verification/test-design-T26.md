## 测试设计确认

- Task ID: `T26`
- Execution Mode: `auto`
- Approval 依据:
  - `task-progress.md` 已记录“用户已授权后续测试设计直接视为确认”。
  - 当前轮用户继续要求自动推进，因此本轮按 `ahe-test-driven-dev` 的 auto approval step 落盘确认。

## 测试范围

- 页面层:
  - `web/src/app/page.test.tsx`
  - `web/src/app/page.discovery-regression.test.tsx`
  - `web/src/app/discover/page.test.tsx`
  - 验证首页首屏与主内容区已切到社区主线表达，`/discover` 未登录可访问，并为“关注中”保留稳定区域 / 空态。
- 发现编排层:
  - `web/src/features/home-discovery/*.test.ts`
  - 验证首页 / 发现页的精选、最新、关注中与次级合作 teaser 由社区读模型装配，而不是继续让约拍入口占据主线。

## 关键正向 / 反向场景

- 正向:
  - 首页首屏优先展示社区主线文案、作品 / 创作者浏览入口与 `/discover` 入口。
  - `/discover` 可浏览精选与最新内容；已登录时存在“关注中”区域。
  - 次级合作模块继续保留入口，但以 teaser 形式存在，不再作为首页主板块。
- 反向:
  - 未登录访客访问 `/discover` 时不应被阻断或重定向。
  - 当 follow 数据为空时，“关注中”应输出稳定空态，而不是报错或整区消失。
  - 首页主视觉与核心分区不得继续把约拍诉求作为社区主线表达。

## 预期 RED

- 在新增 `/discover` 页面测试并收紧首页断言后，当前代码应因缺少 `src/app/discover/page.tsx`、首页仍使用旧 `sample-data` hero / featured path 文案，以及 resolver 仍把 opportunities 作为主线 section 而失败。

## 分层说明

- 页面测试以渲染行为和入口可见性为主，可 mock resolver / session 边界，但不 mock页面自身结构。
- resolver 测试直接覆盖 community bundle 输入、follow 数据与精选回退规则，不把 repository 自身 SQL 行为混入 `T26` 证明。

## 轻量自检

- 已覆盖任务种子要求的主行为：首页社区化、`/discover` 浏览面、关注中稳定区域与次级模块降级。
- 已覆盖关键边界：未登录可访问、无 follow 数据空态稳定、旧约拍叙事不得重新占据主线。
- 当前测试能抓住“看似新增了 discover，但首页和 resolver 仍沿用旧展示 / 约拍结构”的伪完成实现。

## 结论

- `通过`：允许进入 `T26` 的 fail-first。
