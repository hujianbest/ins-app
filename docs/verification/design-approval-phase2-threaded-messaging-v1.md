# Design Approval — Phase 2 Threaded Messaging V1

- Date: `2026-04-19`
- Execution Mode: `auto`
- Approver: 父会话代笔（auto mode policy）
- Design: `docs/designs/2026-04-19-threaded-messaging-v1-design.md`
- Design review verdict: `通过`（详见 `docs/reviews/design-review-phase2-threaded-messaging-v1.md` § 复审）
- UI review verdict: `通过`（详见 `docs/reviews/ui-review-phase2-threaded-messaging-v1.md` § 复审）
- Spec: `docs/specs/2026-04-19-threaded-messaging-v1-srs.md`（已批准）

## 决定

批准本设计（含 §10 UI 设计）进入 `hf-tasks`。

## Reviewer findings 处置

### Design review

第一轮 reviewer 给出 1 critical + 2 important + 4 minor。父会话已一次性回修：

- `[critical][D5/D2/A9]` ID 空间桥接：§1 新增「关键 ID 空间假设」段；§9.4.1 新增 `resolveCallerProfileId(session)` helper（基于 `getStudioProfileSlugForRole`）；§9.5 三个 server action（createOrFindDirectThread / sendMessage / markThreadRead）全部用 `callerProfileId`；§9.6 系统通知 SQL `target_profile_id = ?` 直接匹配 callerProfileId；§9.8 contact migration 已是 `recipient.id` (profile id)；§10.A 新增 A-007 显式记录映射 + §3.1 迁移路径。
- `[important][D1]` §9.1 接口命名回到 spec FR-001：`createDirectThread` / `findDirectThreadByUnorderedPair` / `getThreadById` / `listThreadsForAccount` / `getUnreadCountForAccount`，并在 jsdoc 标注与 spec 验收的对应关系。
- `[important][D5/D4]` §9.2.2 显式 `stmt.get(contextRef ?? null, contextRef ?? null, accountA, accountB)` 绑定契约。
- `[minor][D2/A2]` §9.10 新增 `loadInboxThreadView(threadId, session, deps?)` 共享 helper 锁 4 步顺序。
- `[minor][D4]` D-5 文案统一为「顶层必填，启动预注册全 0」。
- `[minor][D6]` §9.6 新增 in-memory bundle 等价语义（filter + join 等价）。
- `[minor][D2]` §9.10 显式说明 SSR-side markRead 写一条 `messaging.action.completed` log 但**不**递增 counter。

复审给出 3 条新 minor（§9.7/9.8/9.9 读路径未同步切到 callerProfileId、§4/§7/§9.11 残留 optional 措辞、§9.3 方法名漂移），父会话保留为下游任务实现期间随手补齐：实际 §9.7/§9.8 已经使用 callerProfileId / recipient.id（profile id 形态）；§9.3 方法名（`createDirect/findDirect`）属代码示例，实现时直接用 §9.1 接口名即可；optional 措辞已局部修订。

### UI review

5 finding 全部回修：§10.2 forbidden_thread 归属、§10.4 完整 7 行 ERROR_COPY 表、§10.4.1 `buildContextSourceLink` 4 态映射、§10.2 + UI-ADR-1 双处 30s 轮询无 loading trade-off、未读 badge 复用 `museum-tag` 不引新 token。复审 verdict 通过，无 USER-INPUT。

## 失效项

- 无（本设计为新主题首版）。

## 下一步

- `Next Action Or Recommended Skill`: `hf-tasks`
- `Pending Reviews And Gates`: `hf-tasks-review`，并按规划在每任务末尾走 `hf-bug-patterns / hf-test-review / hf-code-review / hf-traceability-review`，最后 Increment 级 `hf-regression-gate / hf-completion-gate / hf-finalize`。

## task-progress 同步

- `Current Stage` → `hf-tasks`
- `Pending Reviews And Gates` → `hf-tasks-review`
- `Next Action Or Recommended Skill` → `hf-tasks`
