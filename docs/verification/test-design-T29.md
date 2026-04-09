## 测试设计确认

- Task ID: `T29`
- Execution Mode: `auto`
- Approval 依据:
  - `task-progress.md` 已记录“用户已授权后续测试设计直接视为确认”。
  - 当前轮用户继续要求自动推进，因此本轮按 `ahe-test-driven-dev` 的 auto approval step 落盘确认。

## 测试范围

- 页面层:
  - `web/src/app/photographers/[slug]/page.test.tsx`
  - `web/src/app/models/[slug]/page.test.tsx`
  - `web/src/app/discover/page.test.tsx`
  - 验证创作者主页渲染关注 / 取消关注入口，discover 页面继续呈现已关注更新区。
- 社交写路径层:
  - `web/src/features/social/follows.test.ts`
  - `web/src/features/social/actions.test.ts`
  - 验证已登录成员可关注 / 取消关注创作者，follow graph 写入后 discover `关注中` 会消费同一条关系链。

## 关键正向 / 反向场景

- 正向:
  - 已登录成员可关注摄影师 / 模特主页。
  - 已关注后可取消关注。
  - discover `关注中` 可显示被关注创作者的最新公开作品。
- 反向:
  - guest 触发关注动作必须被引导登录。
  - 未关注任何创作者时，discover `关注中` 继续输出稳定空态。
  - follow graph 只应消费已发布作品，不把草稿带入 `关注中`。

## 预期 RED

- 当前创作者主页只有收藏按钮，没有真实 follow action；`features/social` 尚不存在。补上 follow 动作与 feed 契约测试后，应因缺少 social 模块、主页未接 follow 状态而失败。

## 分层说明

- 页面测试可 mock `social` 边界，但不 mock 页面自身 DOM 结构。
- social 写路径测试直接使用 sqlite bundle 与 discover resolver，证明“关注 -> discover 关注中看到已关注作品 -> 取消关注后消失”的真实闭环。

## 轻量自检

- 已覆盖任务种子要求的主行为：关注 / 取消关注、discover `关注中` 接入。
- 已覆盖关键边界：guest 引导登录、无关注稳定空态、只消费公开作品。
- 当前测试能抓住“页面上出现关注按钮，但没有真实 follow graph 写入”的伪完成实现。

## 结论

- `通过`：允许进入 `T29` 的 fail-first。
