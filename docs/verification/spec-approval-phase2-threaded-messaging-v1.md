# Spec Approval — Phase 2 Threaded Messaging V1

- Date: `2026-04-19`
- Execution Mode: `auto`（用户已显式授权 auto mode + 推荐路径）
- Approver: 父会话代笔（auto mode policy）
- Spec: `docs/specs/2026-04-19-threaded-messaging-v1-srs.md`
- Spec review verdict: `需修改 → 通过`（详见 `docs/reviews/spec-review-phase2-threaded-messaging-v1.md` + 本文 §回修与决策）
- Increment record: `docs/reviews/increment-phase2-threaded-messaging-v1.md`

## 决定

批准本规格进入 `hf-design`（含 `hf-ui-design` 并行）。

## Reviewer findings 处置

第一轮 reviewer 给出 4 important + 5 minor。父会话已在 approval 之前一次性回修：

### USER-INPUT 项（auto mode 下父会话基于产品最佳实践裁决）

- `[important][USER-INPUT][Q4]` **同一对账号 + 同一 contextRef 是否跨方向 dedupe**：
  - **裁决：无序去重（unordered pair dedupe）**。理由：(a) 符合主流 IM 直觉（用户不区分"我开的 thread"vs"对方开的 thread"，否则同一对人在 work-1 上会出现 2 条线性互不相通的对话）；(b) 简化 `/inbox` 列表语义（同一对方 + 同一 context 永远只一行）；(c) `message_thread_participants.role` 仍记录 initiator/recipient 用于 audit 与 UI display，业务读写权限不依赖 role 字段。
  - 落地：FR-002 acceptance 显式增加"反向同上下文复用 thread"用例 + "无序"措辞 + role 字段语义说明。
  - 影响：`MessageThreadRepository.findDirectThreadByContext` 必须按 unordered pair `{accountX, accountY}` + contextRef 匹配；design 阶段 SQL 用 `(account_id IN (?, ?) AND ... GROUP BY thread_id HAVING COUNT(DISTINCT account_id) = 2)` 形态。
- `[important][USER-INPUT][Q3]` **未读数是否包含自身发出的消息**：
  - **裁决：排除（不计入）**。理由：(a) 主流 IM 默认行为；(b) 否则用户发完一条消息进 `/inbox` 立即看到自己刚发的 thread 高亮 unread "1"，与"未读语义可信"直接冲突。
  - 落地：FR-005 unread SQL 显式增加 `AND author_account_id <> 当前 account_id`；in-memory bundle 实现同形过滤。

### LLM-FIXABLE 项（父会话直接修订）

- `[important][Q3] 空 thread 排序 + 可见性`：FR-005 已新增「空 thread 仍出现在 `/inbox`，排序按 `COALESCE(last_message_at, created_at) DESC, id DESC`」验收。
- `[important][Q3] FR-006 markRead 与 guard 顺序`：FR-006 已新增 SSR 入口 4 步执行顺序（解析 session → 校验 participant 不通过即 notFound → 才 markRead → 才 fetch + render），并显式声明这是 NFR-002 隐私边界硬约束。
- `[minor][A3]` FR-006 验收的 useEffect/setInterval/router.refresh 设计泄漏：已改写为「客户端每 30 秒触发一次 SSR re-fetch；不引入 fetch / SWR / WebSocket / 第三方依赖；具体实现技术栈由 design 选定」。
- `[minor][A6]` FR-007 recipient 不存在错误回流：已对齐 `?error=recipient_not_found` 协议。
- `[minor][A4]` FR-008 排除式 wording：已改为「允许的关联键**仅**为 `thread_id` 与 `recipient_account_id`」+ 显式禁止 body / email / display name 列表。
- `[minor][C7]` `node:sqlite` 单进程顺序写假设：已加 A-006，并指出 §3.1 迁移后需要 schema 层 `UNIQUE INDEX` 冗余。
- `[minor][Q4]` increment 与 spec 的术语漂移（owner/participant vs initiator/recipient；thread_created vs threads_created）：本规格统一为 `initiator/recipient` + `messaging.threads_created` 复数，与 §3.2 V1 metrics 命名习惯一致；增量记录原文不动（历史快照）。

## 失效项

- 无（本规格为新主题首版）。

## 下一步

- `Next Action Or Recommended Skill`: `hf-design`（含 `hf-ui-design`）。
- 路由说明：本增量含 UI surface（`/inbox` 升级 + `/inbox/[threadId]` 新建），按 `hf-workflow-router` §4A 应激活 `hf-ui-design`，与 `hf-design` 并行。Design Execution Mode 默认 `parallel`。

## task-progress 同步

- `Current Stage` → `hf-design`
- `Pending Reviews And Gates` → `hf-design-review`、`hf-ui-review`、`hf-tasks-review`
- `Next Action Or Recommended Skill` → `hf-design`
