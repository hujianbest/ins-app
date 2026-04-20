# Bug Patterns — T69

## 已规避

1. **删除 cookie 工具触发下游 import 漂移**：删除前 rg 全仓只有 actions.ts + actions.test.ts 引用；先重写 actions.ts，再清空 state.ts，再重写 test.ts，避免间断态破坏 typecheck。
2. **invalid_self_thread 被 wrapServerAction 包成 internal_error 抛回去 → UI 显示通用错误**：actions.ts 内部 try/catch 拦截 AppError(invalid_self_thread)，转为 redirect ?error=invalid_self_thread；UI 走错误码字典渲染中文 copy。
3. **测试通过 redirect throw 模拟 redirect 控制流 → wrapServerAction 把 throw 包成 internal_error**：测试改为 redirect mock 不 throw；用 `expect(redirectMock).toHaveBeenCalledWith(...)` 断言，与既有 server action 测试惯例一致。
4. **recipient profile 解析用 auth account id 形态查 creator_profiles → 永远找不到**：重写后用 `${role}:${slug}` profile id 形态查 `bundle.profiles.getById`，与 creator_profiles 主键一致（A-007）。
5. **公开页面 contact button signature 漂移破坏 profile / work / opportunity page tests**：signature `(recipientRole, recipientSlug, sourceType, sourceId)` 完全保留；rg 全仓 + vitest baseline 18 不变 双向验证。

## 候选下游

- 增量级 regression-gate：跑 micro-bench 确认 NFR-001 P95 ≤ 120ms；
- finalize：更新 RELEASE_NOTES / ROADMAP §3.3 / README / task-progress。
