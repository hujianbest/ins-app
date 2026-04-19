# 设计评审 — Phase 2 Threaded Messaging V1

- 评审 skill: `hf-design-review`
- 评审目标设计: `docs/designs/2026-04-19-threaded-messaging-v1-design.md`
- 已批准规格: `docs/specs/2026-04-19-threaded-messaging-v1-srs.md`
- 规格批准记录: `docs/verification/spec-approval-phase2-threaded-messaging-v1.md`
- 增量记录: `docs/reviews/increment-phase2-threaded-messaging-v1.md`
- workflow profile: `full`；execution mode: `auto`
- reviewer: design-review subagent（独立于 hf-design 起草者）
- peer review: `hf-ui-review`（设计含 UI surface，需独立 peer，本节点不跨权评 UI）

## Precheck

- 设计草稿稳定可定位 ✅
- 已批准规格可回读 ✅
- route/stage/profile 与 approval evidence 一致 ✅（profile=full / stage=design / spec 已批准）
- precheck 通过，进入正式评审。

## 维度评分

| ID | 维度 | 分数 | 摘要 |
|---|---|---|---|
| D1 | 需求覆盖与追溯 | 7/10 | §3 追溯表覆盖 8 条 FR + 5 条 NFR；但 FR-007 的关键依赖（recipient slug→account_id）落地路径与现有代码 ID 空间冲突，未在设计层闭合。 |
| D2 | 架构一致性 | 7/10 | 模块边界、3 视图（逻辑/时序/SSR 顺序）清晰；但 §9.5 / §9.6 / §9.8 在 `accountId` vs `creator_profiles.id` 两个 ID 空间之间反复混用，连贯性破裂。 |
| D3 | 决策质量与 trade-offs | 8/10 | §5–§6 对 unordered pair dedupe + 系统通知派生两条最关键路径列出 3 + 2 候选 + 显式 trade-off 表，可冷读。 |
| D4 | 约束与 NFR 适配 | 7/10 | NFR-001 / NFR-002 / NFR-003 / CON-007 都在 §11 不变量与 §12 兼容点落到具体模块；但 NFR-002 / FR-007 在 ID 解析路径上未真正落地。 |
| D5 | 接口与任务规划准备度 | 5/10 | `MessageThreadRepository.findDirectByUnorderedPair` 的 `recipientAccountId` 参数语义、`bundle.profiles.getById(recipientAccountId)`、`startContactThreadAction` 改写后传给 `createOrFindDirectThread` 的 `recipient.id` 三处共同形成 ID 空间空洞，会直接破坏 hf-tasks 的首批任务拆解。 |
| D6 | 测试准备度与隐藏假设 | 7/10 | §14 列出 unit / integration / 性能 micro-bench；§13 给出 P95 预算；但隐藏假设"creator_profiles 与 auth_accounts 之间存在可解析的 1:1 映射"未显式列出。 |

任一维度 < 6 → 不得 `通过`。D5 = 5/10，触发硬阻。

## 结论

需修改

D5 维度低于 6，且对应一条 critical finding；其余维度 ≥ 7。设计核心结构（3 表 schema、unordered pair dedupe SQL 形态、tx 边界、metrics namespace 同形、SSR 入口顺序硬约束）成立，可经一轮定向修订补齐 ID 空间桥接 + 几处接口/参数语义不一致后再次评审。属"局部缺口可通过一轮定向修订补齐"，未到"无法支撑规格"。

## 发现项

### Critical

- `[critical][LLM-FIXABLE][D5/D2/A9] § 9.5 / § 9.6 / § 9.8 在 accountId 与 creator_profiles.id 两个 ID 空间之间未给出桥接，directly 破坏 FR-002 / FR-007 的实现路径。`
  - 现状证据：`web/src/features/auth/auth-store.ts > buildAccountId` 生成 `account:<hex>:<role>` 形态的 `SessionAccountId`；`web/src/features/community/contracts.ts > buildCreatorProfileId` 生成 `${role}:${slug}` 形态作为 `creator_profiles.id`；`creator_profiles` 表（`web/src/features/community/sqlite.ts` schema）**没有 `account_id` 列**，全仓也无任何 `account_id ↔ creator_profile_id` 映射函数 / 表（rg 搜索 `creator_profiles.*account` / `account.*creator_profile_id` / `accountToProfile` 均无命中）。
  - 设计中冲突点 1（§9.5 `createOrFindDirectThread`）：`const recipientProfile = await ctx.bundle.profiles.getById(recipientAccountId)`。`profiles.getById(id)` 实现是 `SELECT * FROM creator_profiles WHERE id = ?`，期望 `id = "photographer:alice"` 形态；而 `recipientAccountId` 是 `account:<hex>:<role>` 形态。该查询永远返回 `null`，所有非 self / 非 invalid 路径都会抛 `recipient_not_found`，整个 happy path 立即被堵死。
  - 设计中冲突点 2（§9.8 `startContactThreadActionImpl`）：`const recipient = await bundle.profiles.getByRoleAndSlug(...); const { threadId } = await createOrFindDirectThread(recipient.id, contextRef)`。`recipient.id = "photographer:alice"`（creator_profiles 主键），随后被作为 `recipientAccountId` 传给 `createOrFindDirectThread`，写入 `message_thread_participants.account_id`。这会让 thread participant 的 accountId 既混入 `account:<hex>:<role>` 也混入 `${role}:${slug}`，**两侧根本不会自然合流为一对一线程，FR-002 unordered pair dedupe 在跨设备场景全部失效**。
  - 设计中冲突点 3（§9.6 系统通知）：声称 `WHERE target_profile_id = ?`、且 `target_profile_id` 形如 `photographer:slug`，"通过 accountId → primaryRole + slug 反查"。但 session 只携带 `accountId + primaryRole + email`，slug 维度全仓不可由 accountId 单独反查。设计未给出任何具体反查方法（既无 schema 字段、也无 helper 函数）。
  - 同等冲突点 4：spec FR-007 自身的验收语句 "通过 `slug` → `bundle.profiles.getByRoleAndSlug` → `account_id`" 也假定了存在 `creator_profile → account_id` 字段，但 `CreatorProfileRecord` 类型与 sqlite schema 都没有 `account_id`。该缺口不是规格漂移，而是设计层必须给出落地方案的 hidden assumption（应在 §10 假设清单中显式列出）。
  - 修订方向（不指定唯一方案，可由 hf-design 选取）：
    1. 在 `creator_profiles` 上加性新增 `account_id TEXT` 列 + 反查/seed 逻辑（可与 `auth_accounts` join 解析），并在 `MessageThreadRepository.findDirectByUnorderedPair` 与 `MessageThreadParticipantRecord.accountId` 中固定使用 `auth_accounts.id`。
    2. 把 messaging participant 的身份换为 `creator_profiles.id`（现状 spec 中 `accountId` 字面量就改为 profile id 语义）；此方案显著影响 NFR-002（隐私 vs profile id 是 public 信息）需重新评估。
    3. 维持 `accountId` 是 `auth_accounts.id`，但提供一个明确的解析层 `resolveRecipientAccountIdByRoleAndSlug(role, slug)` + 在系统通知反向查询时用 join `auth_accounts ↔ creator_profiles`。
  - 任一修订都需要在 §9 模块设计、§9.2 schema、§9.5 / §9.8 控制流、§9.6 系统通知 SQL、§14 测试中同步落地，并在 §10（应改回 §假设栏）显式记录该映射作为不变量。

### Important

- `[important][LLM-FIXABLE][D1] §9.1 接口签名与 spec FR-001 验收清单的命名/能力不完全一致。`
  - spec FR-001 验收：`MessageThreadRepository` 暴露 `findDirectThreadByContext(initiatorAccountId, recipientAccountId, contextRef?)`，`ParticipantRepository` 暴露 `getUnreadCountForAccount(accountId)`。
  - 设计 §9.1 改名为 `findDirectByUnorderedPair(accountA, accountB, contextRef)`、`ParticipantRepository` 完全不暴露 `getUnreadCountForAccount`。改名 + 删能力既影响 trace 严格性，又会让 hf-tasks 在交付物清单上和 spec 不可一一对齐。
  - 修订方向：要么保持 spec 命名（更安全），要么在 §3 追溯表与 §17 出口工件中显式声明命名变更并解释（FR-001 验收"暴露 X"被等价能力 Y 覆盖的迁移说明）。
- `[important][LLM-FIXABLE][D5/D4] §9.2.2 unordered pair dedupe SQL 的参数绑定语义未在设计层固化。`
  - SQL 形态 `((? IS NULL AND t.context_ref IS NULL) OR t.context_ref = ?)` 在 SQL 语义上正确（已逐 case 验证 NULL/非 NULL 双向匹配语义），但 `node:sqlite` 位置参数对 `undefined` 与 `null` 的处理在仓内既有 repository 已有先例（如 `audit_log.note ?? null`、`work.publishedAt ?? null`）需要显式 `contextRef ?? null` 绑定，否则会因 `undefined` 落到驱动层报错或落库为字符串 `"undefined"`。设计未在 §9.2.2 / §9.5 文中显式说明该绑定约定，hf-tasks 容易误绑直接 `contextRef`。
  - 修订方向：在 §9.2.2 SQL 块下方明确 "binding: `[contextRef ?? null, contextRef ?? null, accountA, accountB]`"，与 §9.3 in-memory 实现 `(t.contextRef ?? null) !== (ctx ?? null)` 显式对齐。

### Minor

- `[minor][LLM-FIXABLE][D2/A2] §8.3 / D-4 SSR 入口 4 步顺序在代码层无单一 entry helper 强约束。`
  - 设计明确 (1) session → guest redirect、(2) requireThreadParticipant → notFound、(3) markRead、(4) fetch+render 是 NFR-002 硬约束。当前由 `app/inbox/[threadId]/page.tsx` 顺序写死可达成，但缺一个 `loadInboxThreadView(threadId, accountId)` helper，未来稍微重构（例如错误边界包裹、并行 Promise.all）就会破坏顺序。建议补充一个统一入口 helper（与 §3.2 V1 admin runtime 同形），把 4 步固化在一处。
  - 不阻塞，但显著提升 audit 友好度与 traceability-review 可证伪性。
- `[minor][LLM-FIXABLE][D4] §9.11 `MetricsSnapshot.messaging` 顶层 "optional" 措辞与既有 §3.6 V1 / §3.2 V1 模式不完全一致。`
  - 现有 `recommendations`/`admin` 在 `web/src/features/observability/metrics.ts` 是**必填**字段（启动预注册全 0 → snapshot 始终带值）。设计 §9.11 / §1 多处写"顶层 optional"，与既有模式相反。语义意图正确（"始终预注册全 0 + always emitted"），但措辞会让任务规划阶段出现"是否要 `?:` optional"的二义。
  - 修订方向：把"顶层 optional"统一改为"顶层必填，启动预注册全 0"。
- `[minor][LLM-FIXABLE][D6] §9.6 系统通知 work_comments 反查 owner 的等价语义在 in-memory bundle 未给出。`
  - 设计给出 SQL `INNER JOIN works ON works.id = work_comments.work_id WHERE works.owner_profile_id = ? AND work_comments.author_account_id <> ?`。in-memory 等价路径（`features/community/test-support.ts` 不含 join 概念）未给出，hf-tasks 会需要自己约定。建议在 §9.3 / §9.6 补一段 in-memory 等价伪码。
- `[minor][LLM-FIXABLE][A6] §9.4 `runMessagingAction` 与 `runAdminAction` 高度同形但不复用，未来维护抽取 helper 的回收路径未列入 ADR-4 后果。`
  - ADR-4 已说"易做"，但未声明何时收敛。建议追加一句"V2 / 第三处类似 helper 出现时统一抽取到 `community/runtime` 公共模块"。

## 薄弱或缺失的设计点

- `creator_profiles ↔ auth_accounts` 的 ID 空间桥接是本增量最大的隐藏假设，未列入 §10/§11 任一不变量或假设；已批准 spec 同样未明确，需要在设计回修时显式补齐（critical finding 已覆盖）。
- §9.10 `markThreadRead` 在 SSR 入口阶段直接调 `bundle.messaging.participants.markRead`，绕过 `runMessagingAction` 横切：决定不计 metric（与 server action 路径区分），但 NFR-003 受控键扩展（`threadId`）的 logger.info 落点是否同样跳过未说明。建议明确"SSR-side markRead 也写一条 `messaging.action.completed` 或显式说明只写 metric 不写 log"。
- §13.2 "既有性能不退化" 仅口头声明 `/api/health` `/api/metrics` 不受影响；建议引用 §3.6 V1 / §3.2 V1 已建立的 micro-bench 基线作为对照（不阻塞，便于回归阶段引证）。
- §15 风险表"admin 模块意外导入 `bundle.messaging`"缓解给出 "code review + traceability-review + 单测 `expect(...).not.toContain('messaging')`"，未提到是否纳入 lint / import-boundary 自动检查（rg 仓内未见现成 boundary lint，可不强求；建议至少把字符串扫描断言列入 §14.1 unit 列表，而非仅在 §15 出现）。

## peer 一致性观察（不代位 hf-ui-review）

- §10 UI 设计要点中 `?error=` URL 协议、SSR alert 形态、未读 badge sr-only 中文等与 §3.2 V1 既有模式一致；UI-ADR-1..5 与本节点关心的后端契约（30s polling 不持有数据 / 错误码字典共享 §8.3）无冲突。
- 若 hf-ui-review 决定调整发送表单 UX 或 polling 间隔语义，需要回流到 §9.5 `sendMessage` 错误码与 §9.10 client component 边界；本节点未发现 peer 交接块不一致，仅作信息标注。

## 下一步

- 结论 `需修改` → next action: `hf-design`
- 由 hf-design 在一次定向修订中覆盖：
  1. 闭合 critical finding 的 ID 空间桥接（任选三方案之一并落到 schema/接口/控制流/测试）
  2. 修正 §9.1 接口命名 / `getUnreadCountForAccount` 缺口（与 spec FR-001 对齐或显式说明等价覆盖）
  3. 在 §9.2.2 / §9.5 显式声明 sqlite 参数绑定 `contextRef ?? null`
  4. 把 §9.11 / §1 中 "顶层 optional" 措辞统一为"必填，启动预注册全 0"
  5. 补 §9.10 SSR-side markRead 的 logger 行为说明 + §9.3/§9.6 in-memory 等价伪码
  6. 在 §10 假设清单（或新增 §假设栏）显式记录 ID 桥接为不变量
- 修订完成后回到 `hf-design-review` 复审；通过后由父会话发起 `设计真人确认`。

## 记录位置

- `docs/reviews/design-review-phase2-threaded-messaging-v1.md`

## 交接说明

- 仅返回评审结论与发现项；不代写设计；不发起 approval；不进入 hf-tasks。
- 与 `hf-ui-review` 是 design stage 并行 peer：本节点 `需修改`，UI 评审可独立推进其稳定部分；两条 review 均 `通过` 后由父会话联合发起 `设计真人确认`。

---

## 复审 (2026-04-19)

### 复审对象

- 同一份设计：`docs/designs/2026-04-19-threaded-messaging-v1-design.md`（hf-design 一轮定向修订后）
- 复审仅检查首轮发现项的关闭情况 + 修订是否引入新缺口；不重做全 6 维评分。

### 首轮发现项关闭情况

| ID | 严重度 | rule | 修订点 | 关闭判定 |
|---|---|---|---|---|
| F-1 | critical | D5/D2/A9 | §1 关键 ID 空间假设段落 + §10.A A-007 假设条目 + §9.4.1 `resolveCallerProfileId(session)` helper（基于 `getStudioProfileSlugForRole`）+ §9.5 三个 server action 全部改用 `callerProfileId` / `initiatorProfileId`（不再用 `session.accountId`）+ §9.6 system-notifications 入参 `accountId` 直接与 `target_profile_id` / `owner_profile_id` 等值匹配 + §9.8 注释明确 `recipient.id` 即 profile id。**ID 空间桥接已闭合**。 | ✅ 关闭 |
| F-2 | important | D1 | §9.1 接口签名全部回到 spec FR-001 命名：`createDirectThread` / `findDirectThreadByUnorderedPair`（命名差异在 JSDoc 中显式声明等价于 spec `findDirectThreadByContext`）/ `getThreadById` / `listThreadsForAccount` / `getUnreadCountForAccount`。**spec 验收命名一一对齐**。 | ✅ 关闭 |
| F-3 | important | D5/D4 | §9.2.2 明确 binding contract：`stmt.get(contextRef ?? null, contextRef ?? null, accountA, accountB)`，并在同段说明 `node:sqlite` undefined 行为不稳 + 仓内既有 `?? null` 惯例 + in-memory `(t.contextRef ?? null) !== (ctx ?? null)` 的语义对齐。 | ✅ 关闭 |
| F-4 | minor | D2/A2 | §9.10 引入 `features/messaging/inbox-thread-view.ts > loadInboxThreadView(threadId, session, deps?)` 共享 helper，明确"由 page.tsx 单点调用，未来错误边界 / Suspense 包裹不会破坏 4 步顺序"，§17 出口工件清单同步加 `inbox-thread-view`。 | ✅ 关闭 |
| F-5 | minor | D4 | §1 概述更新为 "`MetricsSnapshot.messaging` 必填字段（启动预注册全 0）"。**注**：§4 / §7 D-5 / §9.11 注释中仍残留 "顶层 optional 字段" 措辞（见下方 R-1），但 §1 与 §11 I-7 已是必填语义，主契约清晰；剩余措辞不影响 hf-tasks 推断。 | ✅ 关闭（语义层面）|
| F-6 | minor | D6 | §9.6 末尾补 in-memory 等价段：discovery_events filter + work_comments 通过 `works.find(w => w.id === comment.workId)` join + filter owner_profile_id == accountId && author_account_id != accountId + 归并 sort + slice。 | ✅ 关闭 |
| F-7 | minor | A6 | §9.10 step 3 明确 SSR-side markRead "主动写 `logger.info("messaging.action.completed", { module, actionName: "messaging/markThreadRead.ssr", threadId })`，但**不递增** `messaging.threads_read` counter（仅统计 client form-action 触发的 markRead）"。同时也覆盖了首轮"§9.10 SSR-side markRead 的 logger 行为说明"薄弱点。 | ✅ 关闭 |

### 复审新发现

均为 minor 级别，不阻塞 approval。建议在 hf-tasks 起始任务"消息身份语义对齐"中一并落地，无需再走一轮 design-review。

- `[minor][LLM-FIXABLE][D2/D5] R-1：§9.7 inbox-model / §9.8 contact/state.ts > getInboxThreadsForRole / §9.9 inbox/page.tsx 的"读路径"伪码仍直接传 session.accountId 给 listForAccount(...)，与 §1 关键 ID 空间假设语义错位。`
  - 现象：`listInboxThreadsForAccount(session.accountId)` 与 `bundle.messaging.threads.listForAccount(session.accountId, 100)` 字面拿到的是 `account:<hex>:<role>` 形态；而 messaging 参与人键已统一为 profile id（§1 + §9.4.1）。读路径在运行时会返回空列表（FR-005 验收 "列出每条" 失败）。
  - 写路径已正确改为 `resolveCallerProfileId(ctx.session)`（§9.5 三个 action）；只需把读路径同步改为同一 helper 即可。
  - 不阻塞原因：§1 关键 ID 空间假设 + §9.4.1 helper 已建立"凡是传 messaging 的 accountId 都用 profile id"的全局契约；hf-tasks 在拆 inbox-model / inbox/page.tsx 任务时按该契约即可正确实现；§14.2 integration 测试 `app/inbox/page.test.tsx` 也会立即捕获该错配。
  - 建议补丁：把 §9.7 的入口注释、§9.8 `getInboxThreadsForRole` 的 `session.accountId` 调用、§9.9 step 3 的 `Promise.all([listInboxThreadsForAccount(session.accountId), listSystemNotificationsForAccount(session.accountId)])`，三处都换成 `resolveCallerProfileId(session)`（或显式声明在 inbox-model 内部 wrap 一次）。
- `[minor][LLM-FIXABLE][D4] R-2：§4 "Additive Metrics Namespace" / §7 D-5 / §9.11 注释残留"顶层 optional 字段"措辞。`
  - §1 已统一为 "必填字段（启动预注册全 0）"，§11 I-7 也是 "始终存在"；剩余三处只是历史措辞未刷新，不会影响实现意图（既有 `recommendations` / `admin` 都是必填）。建议下一轮整体校稿时统一替换。
- `[minor][LLM-FIXABLE][D2] R-3：§9.3 in-memory 示例方法名仍写作 `findDirectByUnorderedPair`（小写 d、缺 Thread），与 §9.1 正式签名 `findDirectThreadByUnorderedPair` 不一致。`
  - 仅文档命名漂移，hf-tasks 实现时按 §9.1 正式接口落地即可。

### 维度评分（增量更新）

| ID | 维度 | 首轮 | 复审 | 变化原因 |
|---|---|---|---|---|
| D1 | 需求覆盖与追溯 | 7 | 9 | F-2 接口命名回到 spec FR-001；A-007 假设显式落入 §10.A |
| D2 | 架构一致性 | 7 | 8 | F-1 ID 空间桥接 + F-4 SSR helper 抽出；R-1/R-3 残留为 minor 措辞 |
| D3 | 决策质量与 trade-offs | 8 | 8 | 无变化（首轮已可冷读）|
| D4 | 约束与 NFR 适配 | 7 | 8 | F-5 metrics 必填语义在 §1 / §11 I-7 落地；R-2 仅措辞残留 |
| D5 | 接口与任务规划准备度 | 5 | 8 | F-1 + F-2 + F-3 + F-4 全部关闭；R-1 是局部读路径同步任务，不再阻塞 hf-tasks |
| D6 | 测试准备度与隐藏假设 | 7 | 8 | F-6 in-memory 等价 + A-007 假设显式 |

无任一维度 < 6；D5 从 5 升至 8，硬阻条件解除。

### 结论

通过

修订一轮关闭 1 critical + 2 important + 4 minor 全部首轮发现；新增 3 条均为 minor 且不阻塞 hf-tasks（已有 §1 假设 + §9.4.1 helper 提供契约口径，hf-tasks 按契约实现可自然修复）。设计已可支撑任务拆解，进入 `设计真人确认`。

### 下一步

- 结论 `通过` → next action: `设计真人确认`（`needs_human_confirmation=true`）。
- 复审记录与首轮记录共存于本文件（追加 `## 复审` 段落，未重写正文）。
- R-1 / R-2 / R-3 三条 minor 由 hf-tasks 在首批任务"消息身份语义对齐 + 文档刷新"中顺手落地；不再回 hf-design。
- 与 `hf-ui-review` 仍是并行 peer，需等 UI 评审同样 `通过` 后由父会话联合发起 `设计真人确认`；本节点不代位发起。
