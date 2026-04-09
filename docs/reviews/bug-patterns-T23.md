## 结论

通过

## 上游已消费证据

- Task ID: `T23`
- 实现交接块 / 等价证据: `docs/verification/implementation-T23.md`
- 触碰工件:
  - `web/src/features/auth/types.ts`
  - `web/src/features/auth/session.ts`
  - `web/src/features/auth/actions.ts`
  - `web/src/features/auth/access-control.ts`
  - `web/src/features/auth/access-control.test.ts`
  - `web/src/app/studio/page.tsx`
  - `web/src/app/studio/page.test.tsx`
  - `web/src/app/studio/profile/page.tsx`
  - `web/src/app/studio/profile/page.test.tsx`
  - `web/src/app/studio/works/page.tsx`
  - `web/src/app/studio/works/page.test.tsx`
  - `web/src/app/studio/opportunities/page.tsx`
  - `web/src/app/studio/opportunities/page.test.tsx`

## 命中的缺陷模式（结构化）

- Pattern ID / 名称: `BP-T23-001` / demo account id 粒度过粗导致身份塌缩
- 机制: `SessionContext.accountId` 当前只按主身份 role 派生为 `demo-account:<role>`；若后续关注、评论或资料写路径直接把它当成真实账号唯一键，同角色的不同 demo 会话会被折叠成同一账号。
- 证据锚点:
  - `web/src/features/auth/session.ts`
  - `docs/verification/implementation-T23.md`
  - `docs/designs/2026-04-08-photography-community-platform-design.md`
- 严重级别: `important`
- 重复性: `新风险`
- 置信度: `probable`

- Pattern ID / 名称: `BP-T23-002` / 权限消费双路径残留
- 机制: `studio` 路径已切到 `AccessControl`，但 `contact`、`engagement`、公开页互动入口仍直接消费 `getSessionRole()`；若后续在 `AccessControl` 中加入更多会话语义而忘记同步 legacy 入口，会出现登录态判断口径漂移。
- 证据锚点:
  - `web/src/features/auth/access-control.ts`
  - `web/src/features/auth/session.ts`
  - `web/src/features/contact/actions.ts`
  - `web/src/features/engagement/actions.ts`
- 严重级别: `minor`
- 重复性: `新风险`
- 置信度: `demonstrated`

- Pattern ID / 名称: `BP-T23-003` / 非法 cookie 回落失守
- 机制: 会话边界升级时，最常见错误是保留旧 cookie 直读逻辑，导致非法值被误视为已登录或错误角色；本轮若没把 fallback 统一进 `SessionContext`，`StudioGuard` 会在 guest / invalid cookie 上出现旁支漂移。
- 证据锚点:
  - `web/src/features/auth/session.ts`
  - `web/src/features/auth/access-control.test.ts`
  - `docs/verification/implementation-T23.md`
- 严重级别: `important`
- 重复性: `近似缺陷`
- 置信度: `demonstrated`

## 缺失的防护

- 无阻塞下游 `ahe-test-review` 的高风险缺口。
- 当前风险已被以下方式吸收:
  - `BP-T23-003` 已由 `resolveSessionContext("invalid-role")` + `createAccessControl()` 测试直接承接，非法 cookie 会稳定回落为 guest，并被 `StudioGuard` 拦截。
  - `BP-T23-002` 虽然仍存在双路径残留，但 `getSessionRole()` 已改为消费统一的 `SessionContext`，至少把原始 cookie 解析逻辑收拢为单一真源。
  - `BP-T23-001` 当前仍是未来扩散风险，但在 `T23` 的 demo 单账号前提下尚未造成当前行为错误，且已被交接块显式记录为后续任务风险。

## 回归假设与扩散面

- 假设: 当前 demo 登录模型仍是一种“每个 role 只代表一个稳定 demo 账号”的过渡前提，因此 `accountId` 按 role 派生不会在 `T23` 直接产生用户可见错误。
- 建议证伪方式:
  - 在 `T24` / `T29` / `T30` 的测试评审中，重点检查真实 repository 或互动写路径是否仍把 `demo-account:<role>` 当成长期唯一账号主键。

- 假设: 现有 legacy 入口即便仍直接调用 `getSessionRole()`，由于 cookie 解析已统一进入 `SessionContext`，短期内不会再出现“非法 cookie 被不同入口解析成不同结果”的双路径故障。
- 建议证伪方式:
  - 在后续 `ahe-test-review` 与 `ahe-code-review` 中确认是否需要为 `contact` / `engagement` 增加最小 smoke test，或者在后续任务里统一迁移到 `AccessControl`。

## 下一步

- `通过`：`ahe-test-review`

## 记录位置

- `docs/reviews/bug-patterns-T23.md`
