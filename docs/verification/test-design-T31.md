## 测试设计确认

- Task ID: `T31`
- Execution Mode: `auto`
- Approval 依据:
  - `task-progress.md` 已记录“用户已授权后续测试设计直接视为确认”。
  - 当前轮用户继续要求自动推进，因此本轮按 `ahe-test-driven-dev` 的 auto approval step 落盘确认。

## 测试范围

- `web/src/app/page.discovery-regression.test.tsx`
- `web/src/app/opportunities/page.test.tsx`
- `web/src/app/opportunities/[postId]/page.test.tsx`
- `web/src/features/contact/actions.test.ts`

## 核心判断

- 首页必须继续把合作模块保持为次级 teaser，而不是重新回到主视觉。
- `/opportunities` 与 `/opportunities/[postId]` 仍需可访问。
- 站内联系动作仍需对 guest 做登录引导、对已登录成员写入 thread 并跳转 `/inbox`。

## 预期 RED

- 若社区主线切换误删了旧合作路径或重新抬升了合作模块，以上回归测试中至少应有一项失败。

## 结论

- `通过`：允许进入 `T31` 的回归确认。
