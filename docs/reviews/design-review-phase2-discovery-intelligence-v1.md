# Phase 2 — Discovery Intelligence V1 设计评审记录

- 评审范围: `docs/designs/2026-04-19-discovery-intelligence-v1-design.md`（草稿）
- 已批准规格: `docs/specs/2026-04-19-discovery-intelligence-v1-srs.md`
- 关联增量: `docs/reviews/increment-phase2-discovery-intelligence-v1.md`
- 关联 spec approval: `docs/verification/spec-approval-phase2-discovery-intelligence-v1.md`
- 评审 skill: `hf-design-review`
- 执行模式: `auto`，profile: `full`
- 评审者: reviewer subagent（hf-design-review）
- 评审时间: 2026-04-19

## Precheck

- 设计草稿存在且稳定可定位 ✅
- 规格已批准（`docs/verification/spec-approval-phase2-discovery-intelligence-v1.md`） ✅
- AGENTS.md 与 ROADMAP §3.6 输入与设计章节一致 ✅
- 设计声明的接入点（`view-beacon.tsx`、`metrics.ts`、`profile-showcase-page.tsx`、`works/[workId]/page.tsx`、`config/env.ts`）均存在于代码库 ✅

precheck 通过，进入正式评审。

## 维度评分（内部）

| ID | 维度 | 评分 | 备注 |
|---|---|---|---|
| D1 | 需求覆盖与追溯 | 9/10 | §3 表逐条映射 FR/NFR；FR-001..FR-008、NFR-001..NFR-005 全部承接，未发现孤立设计。 |
| D2 | 架构一致性 | 8/10 | 三层（pure core / orchestration shell / SSR section）边界清楚，复用既有 bundle / metrics / logger / beacon；§8.1/§8.2/§8.3 视图自洽。但 §3 trace 表中"不修改 MetricsRegistry 实现"与 §12/§17 中"在 metrics.ts 新增 recommendations 命名空间快照字段、且把 metrics.ts 列为修改文件"互相矛盾，需内部对齐。 |
| D3 | 决策质量与 trade-offs | 9/10 | §5/§6 给出方案 A/B/C 与 X/Y 完整对比表，覆盖收益、代价、可逆性；ADR 5 条均锚回 FR/CON 与具体 §。 |
| D4 | 约束与 NFR 适配 | 8/10 | CON-001..CON-005 与 NFR-001..NFR-005 进入设计正文（§1/§3/§12/§13）；NFR-001 有 §13 micro-benchmark 计划；NFR-003 logger 字段已显式列出。Metrics 命名空间扩展声称"纯加性"——经核对 `web/src/features/observability/metrics.ts` 的 `MetricsSnapshot` 形状（`http` / `sqlite` / `business` / `gauges?` / `labels?`），新增 optional `recommendations` 字段确实可以做到不破坏既有消费者；可行性 OK，但必须把改动写明（见 D2 矛盾）。 |
| D5 | 接口与任务规划准备度 | 7/10 | scoring / orchestration / section 接口签名已写出；类型 §9.1 完整。两处具体接口缺口：(a) FR-005 依赖的 server route handler `web/src/app/api/discovery-events/route.ts` 内置了硬编码的 `DiscoveryEventRequestBody = { eventType: "work_view" \| "profile_view"; ... }`，设计 §3 / §12 仅强调"server-side schema 已是 `DiscoveryEventCreateInput`，自然兼容新枚举"，未把该 route handler 的本地类型放宽列入 §17 修改清单，hf-tasks 拆任务时容易漏；(b) `WorkSignals.updatedAt: string` 与 `CreatorSignals.updatedAt: string` 是必填，但底层 `CreatorProfileRecord.updatedAt` / `CommunityWorkRecord.updatedAt` 都是 `string | undefined`，FR-007 tie-breaker 依赖 `updatedAt` desc，必须显式定义缺省回退（如 `publishedAt ?? ""`），否则在数据缺失时排序行为未定义。 |
| D6 | 测试准备度与隐藏假设 | 9/10 | §14 单元 / 组件 / 集成 / e2e / bench 五层覆盖；§11 不变量列表 I-1..I-10 与 §15 风险表互补；A-001 假设来自 SRS 已显式承接。 |

## 关键证据核对

1. **FR/NFR/I 覆盖**：§3 trace 表对每条 FR/NFR 都有承接模块或文件；规格 §11.2「flag disabled 时 DOM 不出现 section」与设计 I-3 / §10.2 一致，没有遗漏。
2. **ADR 锚证据**：ADR-1（CON-001 / FR-008 / NFR-001 + 候选池规模假设 A-001 来自 SRS §10）、ADR-2（CON-004 + N≤4 量级）、ADR-3（FR-006 + CON-005 + §3.8 V1 metrics 形状）、ADR-4（FR-004 / I-3）、ADR-5（SRS §8.3 不变量）全部锚回稳定 SRS 条目或既有合同。
3. **Metrics 扩展兼容性**：核对 `web/src/features/observability/metrics.ts`，`MetricsSnapshot` 当前形状为 `{ http, sqlite, business, gauges?, labels? }`；`incrementCounter(name, ...)` 对任意字符串都接受并写入内部 `counters` map；`business` 只对 `business.<a>.<o>` 命名做特殊解析，不会"吞掉" `recommendations.*` 命名空间。新增 `recommendations` optional 顶层字段属于纯加性扩展，对现有 `/api/metrics` 消费者向后兼容。**但设计 §3 表（"不修改 MetricsRegistry 实现，只新增 4 个键名常量与一个 helper"）与 §12 / §17（"在 metrics.ts 中新增 recommendations 命名空间快照字段、且把 metrics.ts 列入修改清单"）互相矛盾，需在一处统一表述：要么承认 metrics.ts 会被加性修改，要么改用纯 `labels` 出口而不动 `MetricsSnapshot` schema。**
4. **DiscoveryViewBeacon 类型放宽不动 server schema 的可行性**：核对 `view-beacon.tsx`，当前 `eventType: Extract<DiscoveryEventType, "work_view" \| "profile_view">`；放宽为完整 `DiscoveryEventType` 是单一类型修改，不影响运行时；客户端把 `props` 整体序列化后 POST 至 `/api/discovery-events`。**但 server route `web/src/app/api/discovery-events/route.ts` 自己声明 `type DiscoveryEventRequestBody = { eventType: "work_view" \| "profile_view"; ... }` 并 `as DiscoveryEventRequestBody` 强制 cast；下游 `recordDiscoveryEvent` 接受 `DiscoveryEventCreateInput` 已经支持完整 `DiscoveryEventType`，因此运行时入库不会失败，但 route handler 的本地类型会让 `related_card_view` 在 TypeScript 层面成为隐式漏洞，且与 FR-005 验收 #5「TypeScript 类型层显式覆盖新值（穷尽式 switch / 联合判定），不应只是非穷尽兜底」直接冲突。** 设计 §3 / §12 / §17 必须把该 route handler 的本地类型放宽列入修改文件，至少加一条 §9.x 子节说明。
5. **SSR safe-degrade 具体化**：§3.7 / §8.3 / §9.4 步骤 7 / §11 I-3 + I-8 描述明确——orchestrator 内单一 try/catch 包住 IO + 排序，catch 分支强制 logger.warn + counter `.empty` 递增 + 返回 `{ kind: "empty", reason: "soft-fail" }`；section 组件用 `kind === "empty"` 渲染稳定空态。FR-008 第 4 条与 NFR-003 都被吸收，可冷读。
6. **权重不变量 vs SRS §8.3**：
   - `RELATED_CREATORS_WEIGHTS = { city: 0.6, shootingFocus: 0.4 }`：满足 `city >= shootingFocus > 0` ✅，权重和 = 1.0 ≤ 1.0 ✅，且对应 FR-001 验收推导出严格序「同城同方向 1.0 > 同城 0.6 > 同方向 0.4 > 都不同 0」✅。
   - `RELATED_WORKS_WEIGHTS = { sameOwner: 0.55, ownerCity: 0.3, category: 0.15 }`：满足 `sameOwner > ownerCity >= category > 0` ✅，权重和 = 1.0 ≤ 1.0 ✅。同 owner ⟹ 同 ownerCity 必然命中，最低分 0.55 + 0.3 = 0.85，严格大于「同 owner 城市 / 不同 owner」最高 0.45，再大于「同 category / 不同 owner / 不同 owner 城市」0.15，再大于"都不同" 0 ✅，与 FR-002 验收一致。
7. **Tie-breaker 类型设计**：`rankCandidates<TSignals extends { targetKey?: string; workId?: string; updatedAt: string }>` 把 `targetKey` / `workId` 都写成可选，意图让单一函数同时为 creator / work 服务，但比较器内如何挑出唯一 key 没在签名里写明（要么编排层自己 normalize，要么签名应改为 `getKey: (c: TSignals) => string` 注入）；属于细化问题，不阻塞 task planning，但下游容易写出歧义实现。

## 反模式扫描

- A1（无 NFR 评估）：无，§13 / §14.4 / NFR-001..NFR-005 全部进入设计。
- A2（只审 happy path）：基本覆盖，但 server route handler 本地类型未放宽这条**失败/不一致路径**没被设计正文显式标出（详见发现项 F-2）。
- A3（无 trade-offs）：无，§6 与 §5 双对比表完整。
- A4（单点故障未记录）：无，flag / repository 异常 / scoring 异常都有 mitigation。
- A5（实现后评审）：本评审在编码前进行 ✅。
- A6（上帝模块）：无，三层职责严格分离。
- A7（循环依赖）：无，依赖方向 Page → Section → Orchestrator → Score / Bundle / Metrics / Logger 单向。
- A8（分布式单体）：本场景不适用。
- A9（task planning gap）：F-1 / F-2 都属于"留给 hf-tasks 猜"的小空洞，本轮回修可关闭。

## 结论

需修改

整体设计质量高、可读、决策有锚；但 §3 trace 表与 §12 / §17 关于 `metrics.ts` 是否被加性修改存在内部矛盾，且 FR-005 依赖的 server route handler 本地类型放宽未被设计正文/出口工件显式列出。两条都是 LLM 一轮可关闭的 important 缺口，不构成阻塞，但必须在 approval 前修订。

## 发现项

- [important][LLM-FIXABLE][D2] §3 trace 表对 FR-006 写"不修改 `MetricsRegistry` 实现，只新增 4 个键名常量与一个 helper"，与 §12「在 `metrics.ts` 中新增 `recommendations` 命名空间快照字段」和 §17「修改文件清单含 `web/src/features/observability/metrics.ts` + `metrics.test.ts`」直接矛盾。请二选一：(a) 承认对 `MetricsRegistry.snapshot()` 做加性扩展（首选，符合 FR-006 验收 #1「响应 JSON 中应至少包含 4 个 counter，初始值为 0」对预注册的隐含要求），并把 §3 表对 FR-006 的承接说明改为"复用 `incrementCounter` + `MetricsSnapshot` 加性扩展 `recommendations` 顶层字段"；或 (b) 改用既有 `labels` 出口承接，不修改 `MetricsSnapshot` schema，但需要在设计中说明 `/api/metrics` 消费者如何稳定读到 4 个预注册键。两种走法都可，关键是设计内部表述统一。

- [important][LLM-FIXABLE][D5,A2] §3 / §12 仅说"server-side `/api/discovery-events` schema 已是 `DiscoveryEventCreateInput`，自然兼容新枚举，无需改字段"，但实际 `web/src/app/api/discovery-events/route.ts` 的 route handler 自己声明了硬编码本地类型 `DiscoveryEventRequestBody = { eventType: "work_view" \| "profile_view"; ... }` 并 `as` cast；不放宽这处类型，FR-005 验收 #5「依赖 `DiscoveryEventType` 的代码必须在 TS 类型层显式覆盖新值，不应只是非穷尽兜底」无法被满足，且 hf-tasks 拆任务时极易漏掉这处文件。请在 §9.8 接入点改动与 §17 出口工件清单中显式追加 `web/src/app/api/discovery-events/route.ts` 的本地 `DiscoveryEventRequestBody` 类型放宽（或直接改用 `DiscoveryEventCreateInput`），并在 §3 trace 表的 FR-005 行中补一条承接说明。

- [minor][LLM-FIXABLE][D5] §9.1 `CreatorSignals.updatedAt: string` 与 `WorkSignals.updatedAt: string` 是必填，但底层 `CreatorProfileRecord.updatedAt` / `CommunityWorkRecord.updatedAt` 在 `community/types.ts` 里都是 `string | undefined`。FR-007 tie-breaker 依赖 `updatedAt` desc 且需要确定性。请在 §9.4 / §9.5 编排层 mapping 步骤里显式定义缺省回退口径（建议 `record.updatedAt ?? record.publishedAt ?? ""`），并在 §11 / §14 加一条不变量与单测覆盖"updatedAt 缺省时仍稳定排序"。

- [minor][LLM-FIXABLE][D5] §9.3 `rankCandidates<TSignals extends { targetKey?: string; workId?: string; updatedAt: string }>` 把两个互斥的稳定键写成共存可选字段，不利于冷读，下游容易写出歧义比较器。建议把签名改为接受显式 `getKey: (c: TSignals) => string` 或要求 signals 类型统一暴露 `targetKey: string`（可在 mapping 阶段为 work 计算 `targetKey = workId`）。

## 薄弱或缺失的设计点

- §10.1 / §10.2 提到 section 容器在 disabled 时不渲染 panel，但 §9.6 / §9.7 section 组件的 `if (!result) return null` 保护点只覆盖到了"flag disabled"分支，没有显式提到"flag disabled 时也不应在客户端再 hydrate 任何 beacon"的不变量；I-3 已隐含覆盖，但建议在 §11 内加一条「I-11：flag disabled 时编排层 `null` 短路 ⟹ section 不渲染 ⟹ DiscoveryViewBeacon 也不挂载」防漂移。
- §13.2 SSR 整页 micro-benchmark 标为「可选」，FR-008 验收 #1 / #2 的 30ms 预算其实更需要整页层级证据；建议改为推荐而非可选。

## 下一步

需修改 → `hf-design`：按上述 4 条 finding 与 2 条薄弱点定向回修，回修后无需再走全量评审，可由 reviewer 复审矛盾点是否消除即可。

## 记录位置

- `docs/reviews/design-review-phase2-discovery-intelligence-v1.md`

## 交接说明

- `hf-design` 回修：focus 在 §3 / §9.1 / §9.3 / §9.4 / §9.5 / §9.8 / §11 / §12 / §17 几节做定向修订，无需重写架构。
- 待回修通过后由父会话再发起 `hf-design-review` 复审 + `设计真人确认` + `hf-tasks` 链路。
- 不发起 `hf-workflow-router`：未发现需求漂移、route/stage 冲突或证据链断裂。

---

## 复审 (2026-04-19)

复审范围：仅核对上一轮 4 条 finding 与 2 条薄弱点的关闭情况；不重启全维度评分。

### 关闭核对

| 上一轮 Finding / 薄弱点 | 期望关闭点 | 复审证据 | 关闭状态 |
|---|---|---|---|
| F-1 [important][D2] metrics 内部矛盾 | §3 FR-006 行 + §12 + §17 三处统一为「`metrics.ts` 加性修改，暴露 `MetricsSnapshot.recommendations` optional 字段」 | §3 FR-006 行（L43）已改为「加性扩展 `MetricsSnapshot.recommendations` 顶层 optional 字段」；§12（L477-479）显式说明纯加性 + 在 §17 列出；§17（L568）已含 `web/src/features/observability/metrics.ts`；ADR-3（L543）一致；§9.8（L408）给出新字段精确形状 | ✅ 已关闭（主体），仍有微小文本残留（见下「最小残留」） |
| F-2 [important][D5,A2] `/api/discovery-events` route handler 类型放宽未列入设计 | §3 FR-005 行 + §9.8 + §17 三处显式列出 `web/src/app/api/discovery-events/route.ts` 本地 `DiscoveryEventRequestBody` 放宽 | §3 FR-005 行（L42）已显式列出 + 标注「必须同步放宽以满足 FR-005 验收 #5」；§7 D-8（L105）补足；§9.8（L406）作为接入点显式列出 | ⚠️ 已实质关闭（authoritative §9.8 + §3 表已覆盖），但 §17 出口工件「修改 src」清单（L565-571）漏列 `web/src/app/api/discovery-events/route.ts` —— 详见下「最小残留」 |
| F-3 [minor][D5] `updatedAt` 缺省回退口径 | §9.4 / §9.5 + I-12 + §14 单测条目显式 | §9.4 步骤 3（L340）+ §9.5（L351）写入 `record.updatedAt ?? record.publishedAt ?? ""`；I-12（L472）固化口径并禁止 `Date.now()` 兜底；§14.1（L507）`related-creators.test.ts` 新增「缺省回退后排序仍稳定」用例 | ✅ 已关闭 |
| F-4 [minor][D5] `rankCandidates` 签名歧义 | `TSignals` 强约束 `targetKey: string`；`CreatorSignals` / `WorkSignals` 都暴露 `targetKey` | §9.3（L305）签名改为 `<TSignals extends { targetKey: string; updatedAt: string }>` + 文末（L313）解释意图；§9.1（L220-237）两个 signals 类型首字段均为 `targetKey: string` 并注明编排层在 mapping 阶段填入 | ✅ 已关闭 |
| 薄弱点 W-1 I-11 防 hydrate 漂移 | §11 新增 I-11 | I-11（L471）已写入「flag disabled ⟹ orchestrator null ⟹ section null ⟹ DOM 既无 panel 也不挂 beacon」 | ✅ 已关闭 |
| 薄弱点 W-2 §13.2 推荐而非可选 | §13.2 升级为推荐 + 具体断言 | §13.2（L495-499）标题改为「推荐」，给出 100 次链路调用 + P95 ≤ 30ms 断言 + 标注「不再标为可选」 | ✅ 已关闭 |

### 最小残留（minor，不阻塞 approval）

- [minor][LLM-FIXABLE][D2] §1 概述段（L19）仍写「新增 4 个 counter ... 进入既有 `business` / `labels` 出口（详见 §11）」，与 ADR-3 / §12 / §3 / §17 已统一的「加性 `recommendations` 顶层字段」表述不一致；§11 也并非 metrics 扩展所在节（应指 §12）。属于上一轮回修后未同步刷新的概述段，建议在 finalize 阶段顺手修订为「通过加性 `recommendations` 顶层字段输出（详见 §12）」。
- [minor][LLM-FIXABLE][D2] §7 D-5（L102）仍写「snapshot() 输出沿用现有 labels / gauges 兼容机制；不修改 MetricsSnapshot schema」，与同文 §12 / §17 / ADR-3 / §9.8 直接相反；建议改为「snapshot() 输出加性扩展 `recommendations` 顶层 optional 字段；不删/不重命名既有字段，对现有消费者向后兼容」。
- [minor][LLM-FIXABLE][D5] §17 出口工件「修改（src）」清单未列出 `web/src/app/api/discovery-events/route.ts`；该文件已在 §3 FR-005 行、§7 D-8、§9.8 接入点改动中显式标注，hf-tasks 实际拆任务时不会漏（§9.8 是模块设计的 authoritative file list），但 §17 仍应补一行以保持双源一致。

以上 3 条均为同一类「上一轮回修后未同步刷新的描述性文本」，与设计实质决策无冲突，且权威小节（§3 表、§12、§9.8、ADR-3）已自洽；可由 `hf-design` 在 finalize 同步阶段顺手清理，不需要单独回修轮次，也不阻塞 `hf-tasks`。

### 复审结论

通过

理由：

- 4 条上一轮 finding 的 authoritative 关闭点（§3 表 FR-005 / FR-006 行、§9.8 接入点、§9.1 / §9.3 / §9.4 / §9.5 / §11 I-11 + I-12、§12 metrics 加性扩展、ADR-3）全部到位。
- 2 条薄弱点（I-11、§13.2 推荐）已写入。
- 残留只是上一轮回修未同步刷新的 3 处描述性文本，不与权威小节冲突结论本身，且 hf-tasks 拆任务的输入面（§9.8 + §3 表 + §17 大部分清单）已稳定。

### 复审下一步

- 通过 → 父会话发起 `设计真人确认`（auto 模式下父会话写 design approval record）。
- 真人确认后进入 `hf-tasks`，可顺手在第一批任务的 PR 描述里把上述 3 条文本残留一并清理（视为 finalize-stage 文档同步项）。
- 不发起 `hf-workflow-router`。

