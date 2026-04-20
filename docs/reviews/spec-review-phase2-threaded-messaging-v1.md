# Spec Review — Phase 2 — Threaded Messaging V1

- 评审目标：`docs/specs/2026-04-19-threaded-messaging-v1-srs.md`（草稿）
- 输入证据：`docs/reviews/increment-phase2-threaded-messaging-v1.md`、`docs/ROADMAP.md` §3.3、`docs/specs/2026-04-19-ops-backoffice-v1-srs.md`（已批准范例）、`web/src/features/community/types.ts`（既有 `discovery_events` / `work_comments` 锚点）
- Workflow Profile：`full`
- Execution Mode：`auto`
- Reviewer：subagent
- Skill：`hf-spec-review`
- Rubric：`references/spec-review-rubric.md`

## 结论

需修改

## Precheck

- 存在稳定 spec 草稿 ✅
- route / stage / profile 一致（`hf-specify` 输出 → `hf-spec-review`，profile=`full`，与 `task-progress.md` 与 increment 记录一致）✅
- 上游 increment 记录与 ROADMAP §3.3 锚点一致 ✅
- 不需要 reroute via router

## 发现项

### Important（建议批准前修复）

- [important][USER-INPUT][Q4][C2] FR-001 / FR-002 把 `(initiatorAccountId, recipientAccountId, contextRef)` 定义为**有序元组**（参与方角色为 `initiator` / `recipient`，schema PRIMARY KEY 也按 ordered participant 行存储），意味着「A 在 work:1 上联系 B」与「B 在 work:1 上联系 A」会被当成两条独立 direct thread，但 §2.2 成功标准里"避免同一上下文重复创建 thread"的语义并未明确这种**反向同上下文**的去重策略。该业务规则会改变 `createOrFindDirectThread` 与 `findDirectThreadByContext` 的查询条件、影响 `idx_thread_participants_account` 设计，需要业务方裁决「同一对人 + 同一 context 是否应跨方向 dedupe」。
- [important][USER-INPUT][Q3][C7] FR-005 把"未读数"定义为 `messages where created_at > 当前 account 的 last_read_at`，未排除"自己发出的消息"。在常见 IM 语义下用户发送消息后**不会**在自己的 inbox 看到 thread 未读 = 1，否则发完一条消息进入 `/inbox` 列表会立刻看到自己的 thread 高亮未读，与"未读语义可信"冲突。需要业务方明确未读 SQL 聚合是否应附加 `author_account_id <> currentAccount` 条件；该决定不变会同时影响 `getUnreadCountForAccount` 的接口契约。
- [important][LLM-FIXABLE][Q3][A6] FR-005 列表排序使用 `last_message_at DESC`，但 FR-002 允许创建一条**尚无消息**的空 thread（点「联系」即建 thread，发消息为下一动作）。空 thread 的 `last_message_at` 为 `NULL`，规格未声明：(a) 空 thread 是否在 `/inbox` 列出；(b) 排序时 `NULL` 与 `created_at` 的 fallback 关系。`A-001` 与 `idx_threads_last_message_at_desc` 索引都默认非空，需要在 FR-005 验收里显式补一行排序与可见性规则（不引入新业务事实，可由作者直接补齐）。
- [important][LLM-FIXABLE][Q3] FR-006 既写"非 participant → `notFound()`"，又写"SSR 入口同步阶段自动调用 `markThreadRead`"，但未声明执行顺序。若实现先 `markRead` 再判 participant，会出现：(a) 非 participant 触发对不属于自己的 thread 的写动作；(b) 通过 metric / log 暴露 thread 是否存在。应在 FR-006 验收中显式补一句「先 participant 校验、不在则立即 `notFound()`，校验通过后才 `markThreadRead`」。

### Minor（建议修复但不阻塞）

- [minor][LLM-FIXABLE][A3] FR-006 验收第 6 条把"`useEffect` + `setInterval` + `router.refresh()`"作为验收条件，属轻度设计泄漏（A3）。规格层只需描述 WHAT：「客户端每 30 秒触发一次 SSR re-fetch，不引入 fetch / SWR / WebSocket / 第三方依赖」，HOW 留给 design。
- [minor][LLM-FIXABLE][Q4] increment 记录中使用了 `role: owner / participant` 与 `messaging.thread_created` 命名，规格统一为 `initiator / recipient` 与 `messaging.threads_created`。规格内自洽，仅是与上游记录的术语漂移；建议在「§11 影响 / 出口工件」补一行交接说明，避免 design 阶段重复二选一。
- [minor][LLM-FIXABLE][A6] FR-007「recipient profile 没找到 → `redirect("/inbox")` + 不创建 thread」未给出用户感知（错误码 / 文案 / 是否走既有 `?error=` 协议）。建议沿用 §3.2 既有错误回流模式（如 `?error=recipient_not_found`），与既有 ops-backoffice 错误回流风格一致。
- [minor][LLM-FIXABLE] FR-008 "不含 `recipient_account_id` 之外的额外用户标识" 这种否定+排除的句式容易被误读为「允许 / 鼓励 log `recipient_account_id`」。建议明确「仅 `thread_id` 与 `recipient_account_id` 可作为关联键，不记录 email / display name / message body」。
- [minor][LLM-FIXABLE][C7] §10 假设里没有显式记录"`node:sqlite` 单进程下，`bundle.withTransaction` + 先 read 后 write 已足以保证 `findOrCreate` 不会插出重复行"的依据；当前 §6 FR-001 仅以脚注形式说明「不引入 UNIQUE INDEX 因为 contextRef 可空」。建议在 §10 中以 `A-00x` 形式补一条单进程 sqlite 顺序写假设，便于 design / 测试阶段直接回读。

### 用户重点关注的 4 项的对照判定

1. **`(initiator, recipient, contextRef)` 唯一性是否在无 `UNIQUE INDEX` 下可行**：方向 / 事务 / 单进程 sqlite 顺序写本身可行，规格也已显式承认 contextRef 可空导致 UNIQUE INDEX 不可用、并强制走 `bundle.withTransaction` + 先查后写。机制层 OK；但**业务唯一性的语义边界**（有序 vs 无序元组）尚未明确 → 见上面 important USER-INPUT 第 1 条。
2. **隐私边界（admin 不可见 + thread 枚举走 404）在 server-action 层是否可执行**：FR-008 + NFR-002 + FR-006 已把校验收口为 `bundle.messaging.participants.listForThread(threadId)`，admin 后台不接 `bundle.messaging`，写动作统一 `forbidden_thread`、SSR 路由统一 `notFound()`，且日志不含 body。机制可执行 ✅。仅 FR-006 的 markRead 与 guard 顺序需在 wording 上明确（已落 important LLM-FIXABLE 第 4 条）。
3. **系统通知 read-only 派生（不持久化）对 V1 是否可接受**：§4 范围、§5 范围外、A-002、FR-005 验收、§8.2 不变量都明确这是 V1 的显式选择，并已写出 V2 触发条件（"我标记某通知已读"才需要持久化）。可接受 ✅，无 finding。
4. **30s 客户端轮询 vs SSE 是否被正确 scope 为 deferred**：§5 显式排除 SSE / WebSocket，A-003 把 30s 硬编码记为 V1 假设并指明 V2 评估方向，FR-006 明确客户端轮询。Scope 处理正确 ✅，仅留下 minor A3 设计泄漏（已落上面 minor 第 1 条）。

## 缺失或薄弱项

- 双向同上下文 thread 的 dedup 语义（important USER-INPUT 第 1 条）。
- 自身消息是否计入未读（important USER-INPUT 第 2 条）。
- 空 thread 在 `/inbox` 的可见性与排序 fallback。
- `markThreadRead` 与 participant guard 的执行顺序。
- single-process sqlite 顺序写假设未显式落到 §10。
- FR-007 recipient 不存在路径的错误回流 wording 与 §3.2 协议未对齐。

## 通过的关键检查（摘要）

- Q1 / Q8 Source / Trace Anchor：每条 FR 均回指 ROADMAP §3.3 与 increment §New / §Modified；§12 提供索引表。
- Q2 量化：性能阈值（120ms / 80ms / 30ms）、消息体上限（4000 字符）、列表上限（最近 50 / ≤ 200 / ≤ 500）均量化。
- Q5 Priority：8 条 FR 全 `Must` 并给出"互为前置"的整体说明，避免"全员最高优先级但无依据"。
- Q6 Verifiable：每条 FR 均按 Given / When / Then 形成可判断的验收。
- Q7 Modifiable：FR ↔ 范围内 / 范围外 / 不变量 / 错误码字典 / 影响矩阵不重复散落。
- C1 Requirement contract：8 条 FR + 5 条 NFR 均含 ID / Statement / Acceptance / Priority / Source。
- C2 Scope closure：§4 / §5 范围内外明确闭合，且与 increment 一致。
- C3 Open-question closure：无阻塞性开放问题，剩余开放点都属 V2。
- C4 Template alignment：与已批准的 `2026-04-19-ops-backoffice-v1-srs.md` 同骨架同分级。
- C5 Deferral handling：§5 显式列出 V2 评估项；A-001 ~ A-005 给出延后边界。
- C6 Goal & success criteria：§2.1 / §2.2 / §3.3 形成可判断的端到端剧本。
- C7 Assumption visibility：A-001 ~ A-005 已显式（除 single-process sqlite 顺序写假设建议补齐）。
- G1 / G2：8 条 FR 切分清晰，未触发明显 GS1-GS6；当前轮与 V2 边界没有混写。

## 下一步

- `需修改` → `hf-specify`
- 修订聚焦 4 条 important finding：双向 dedup 业务裁决、未读自身消息业务裁决、空 thread 排序 / 可见性、markRead 与 guard 顺序；附带处理 5 条 minor。
- 不需要 `reroute_via_router`。

## 记录位置

- `docs/reviews/spec-review-phase2-threaded-messaging-v1.md`

## 交接说明

- 不进入 `规格真人确认`（结论非 `通过`）。
- 仅向父会话抛 USER-INPUT 类问题（双向 dedup + 未读自身消息）；其余 LLM-FIXABLE 由 `hf-specify` 直接修订，不转嫁用户。
- 预计 1 轮回修可达标。

## Finding Breakdown（机器可读）

```json
[
  {"severity":"important","classification":"USER-INPUT","rule_id":"Q4","summary":"FR-001/FR-002 未明确 (A,B,ctx) 与 (B,A,ctx) 是否跨方向 dedupe 到同一 direct thread"},
  {"severity":"important","classification":"USER-INPUT","rule_id":"Q3","summary":"FR-005 未读 SQL 未排除自身消息，是否计入未读需业务裁决"},
  {"severity":"important","classification":"LLM-FIXABLE","rule_id":"Q3","summary":"FR-005 未声明空 thread 的 /inbox 可见性与 last_message_at NULL 排序 fallback"},
  {"severity":"important","classification":"LLM-FIXABLE","rule_id":"Q3","summary":"FR-006 未明示 markThreadRead 与 participant guard 的执行顺序"},
  {"severity":"minor","classification":"LLM-FIXABLE","rule_id":"A3","summary":"FR-006 把 useEffect/setInterval/router.refresh 作为验收，属设计泄漏"},
  {"severity":"minor","classification":"LLM-FIXABLE","rule_id":"Q4","summary":"increment 与 spec 在 role / counter 命名上有术语漂移，建议交接说明"},
  {"severity":"minor","classification":"LLM-FIXABLE","rule_id":"A6","summary":"FR-007 recipient 不存在路径未对齐 §3.2 ?error= 协议"},
  {"severity":"minor","classification":"LLM-FIXABLE","rule_id":"A4","summary":"FR-008 排除式 wording 易被误读为允许 log recipient_account_id"},
  {"severity":"minor","classification":"LLM-FIXABLE","rule_id":"C7","summary":"§10 缺 single-process sqlite 顺序写假设记录"}
]
```
