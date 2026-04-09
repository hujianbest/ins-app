## 测试设计确认

- Task ID: `T30`
- Execution Mode: `auto`
- Approval 依据:
  - `task-progress.md` 已记录“用户已授权后续测试设计直接视为确认”。
  - 当前轮用户继续要求自动推进，因此本轮按 `ahe-test-driven-dev` 的 auto approval step 落盘确认。

## 测试范围

- 页面层:
  - `web/src/app/works/[workId]/page.test.tsx`
  - 验证作品详情页渲染评论区、已登录用户可见评论入口、guest 看到登录引导。
- 评论服务层:
  - `web/src/features/social/comments.test.ts`
  - `web/src/features/social/comment-actions.test.ts`
  - 验证 `1..500` 字校验、最新优先读取、guest 提交拦截与写入后回到详情页。

## 关键正向 / 反向场景

- 正向:
  - 已登录成员可提交纯文本评论。
  - 评论列表按最新优先展示。
- 反向:
  - 空评论与超长评论必须失败。
  - guest 评论必须被引导登录。
  - 首期不提供编辑 / 删除 / 举报 UI。

## 预期 RED

- 当前评论 repository 没有真实写入，作品详情页也没有评论区；补上评论 service / action / 页面渲染测试后，应因缺少 social comments 模块和详情页未接评论读写而失败。

## 结论

- `通过`：允许进入 `T30` 的 fail-first。
