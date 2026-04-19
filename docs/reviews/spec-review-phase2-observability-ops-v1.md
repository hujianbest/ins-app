# Spec Review — Phase 2 Observability & Ops V1

- Date: `2026-04-19`
- Reviewer: `hf-spec-review` subagent
- Spec under review: `docs/specs/2026-04-19-observability-ops-v1-srs.md`（草稿）
- Increment record: `docs/reviews/increment-phase2-observability-ops-v1.md`
- Roadmap anchor: `docs/ROADMAP.md` §3.8、§4 优先级 1
- Repo conventions: `web/AGENTS.md`
- Workflow state: `task-progress.md`

## 结论

通过

> 结论说明：核心 FR/NFR 范围清晰、可验收、可追溯，无 USER-INPUT 缺口，无阻塞设计的 critical finding，剩余条目均为 LLM-FIXABLE 的结构 / wording 问题，可在进入 `hf-design` 前由 `hf-specify` 一次性补齐，亦可在设计阶段顺手澄清。

## 发现项

### Important（建议在 approval step 前由 `hf-specify` 一次定向回修，但不阻塞设计起步）

- [important][LLM-FIXABLE][C1] `NFR-001`、`NFR-002`、`NFR-003`、`NFR-004`、`NFR-005` 全部缺少 `Source / Trace Anchor`（见 §7 各节，仅有 `Priority`）。规格契约要求关键 NFR 与核心 FR 同样具备来源锚点；当前条目的来源虽可从 §1 / §2 / 增量记录回推，但应显式回指（例如 ROADMAP §3.8、增量记录 §变更包/New 等），以便后续 traceability review 不必再补脑。
- [important][LLM-FIXABLE][C1][Q4] `FR-005` 的第 6 条验收引入了 `OBSERVABILITY_SLOW_QUERY_MS`（默认 100ms），但 `FR-006`（env 契约扩展）的「需求说明」与四条验收均未声明该字段；增量记录 §变更包/New 列举的 env 集合也不含 `OBSERVABILITY_SLOW_QUERY_MS`。这构成 env 契约与功能验收之间的不一致：要么把该字段补入 `FR-006` 的「需求说明」与默认值（100ms 已隐含），要么把 `FR-005` 改为引用一个常量并显式说明非 env。无论哪种修法都不引入新事实，属 LLM-FIXABLE。
- [important][LLM-FIXABLE][Q3][A5] `FR-002` 的第 4 条验收谈到「不在受控键集合中的字段」应被丢弃 / 截断，但规格全文未定义「受控键集合」是什么；§4 范围只列了 logger 的「最小字段集」（`timestamp` / `level` / `traceId` / `event` / `module` / `durationMs` / `error` / `context`），没有声明 logger 输入是「白名单」还是「白名单 + 子集 context」。验收无法在不约定该集合的情况下唯一判定。建议在 `FR-002` 需求说明里直接把「受控键集合」与最小字段集对齐（或在 §12 术语表里给出定义），属 LLM-FIXABLE，不增新事实。

### Minor（设计阶段可顺手澄清，可不在 approval step 前修）

- [minor][LLM-FIXABLE][Q6] `NFR-001` 的验收以「本增量前后 P95 时延差」为口径，但规格未规定「前」基线如何采集（在哪个 commit / 何种环境下跑、是否复用 `web/scripts/...` 既有基准）。当前措辞可执行（任意人工跑前后对比即可），但建议在验收中显式约束基线快照的获取方式，避免后续 regression-gate 阶段为「基线在哪」反复扯皮。
- [minor][LLM-FIXABLE][Q6][A1] `FR-007` 第 2 条验收「不会阻塞实例正常请求超过 2 秒」中「正常请求」未约束类型 / 目标 endpoint。阈值（2 秒）已量化，但「正常请求」可被解读为任一 route handler 或专门的 `/api/health` 探测请求。建议在验收里给出最小观测协议（如：备份运行期间对 `/api/health` 持续探测，单次响应 RTT 不超过 2 秒），属 LLM-FIXABLE。
- [minor][LLM-FIXABLE][A6] `FR-004` 已覆盖 `ERROR_REPORTER_PROVIDER=sentry` 且 `SENTRY_DSN` 缺省时的降级行为（→ `noop` + warn 日志），但未覆盖 §4 已经显式承诺的「默认不打包真实 SDK」场景下 `ERROR_REPORTER_PROVIDER=sentry` 且 `SENTRY_DSN` 已配置时应当如何（应同样降级到 `noop` 并打印一条 warn，而不是去尝试加载未打包的 SDK）。补一条对称验收即可，属 LLM-FIXABLE，不引入新事实。
- [minor][LLM-FIXABLE][C1] §8 `IFR-001 / IFR-002 / IFR-003`、§9 `CON-001 ~ CON-005` 均未带 Priority / Source。多数项目模板对 IFR / CON 的 Source 锚点是强建议而非强制；若希望与 FR/NFR 契约一致，可顺手补齐回指 ROADMAP §3.8 或本增量记录。

## 缺失或薄弱项

- **NFR Source 锚点系统性缺失**：5 个 NFR 节点均无 `Source / Trace Anchor`，与 FR 节点的契约严密度不一致。属 contract-level 结构空洞，但不影响设计可起步。
- **Env 契约面**：`OBSERVABILITY_SLOW_QUERY_MS` 仅出现在功能验收里，未进入 `FR-006` env 契约白名单；同时 `OBSERVABILITY_METRICS_TOKEN` 在 `FR-006` 第 2 条仅作为「未设置则启动失败」的负路径出现，建议在 `FR-006` 需求说明里把该字段也作为已声明字段显式列出（虽然增量记录 §变更包/New 已列出，但规格自身也应自洽）。
- **「受控键集合」定义空洞**：`FR-002` 验收引用了一个未在规格内定义的概念，建议在 §4 范围或 §12 术语表里把它和「最小字段集」绑定。
- **接口 / 约束 / 假设 节点的 Priority 与来源**：现状可读，但与 FR 块的契约要求不齐；严格按 rubric 的 C1 检查会偏弱，但不阻塞设计。

## 通过的关键检查（用于审计 trace）

- §2.2 success criteria 五条全部具体可判断（trace id 串联、结构化错误字段、`/api/metrics` JSON 出口、reporter 默认 noop 不外联、备份 / 恢复脚本可执行 + 健康检查反映）。
- §4 / §5 范围内 / 范围外闭合：明确「不接入真实 Sentry SDK」「不引入新运行时依赖」「不改 schema」「不改业务行为契约」；与 §3.1 的持久化迁移、§3.2 的运营后台审计日志显式分离。
- §10 假设 4 条均显式写出失效影响（`ASM-001/002/003/004`），路径回流 skill（`hf-increment` / `hf-design`）也指明，符合 C7。
- §11 阻塞性开放问题为空；非阻塞开放问题不会改变本轮设计主干（cron 样例 / Prometheus 文本格式 / 出口审计写入策略均为后续增量话题）。
- `IFR-001` / `CON-002` 的 404 vs 401 边界一致（METRICS_ENABLED=false → 404；METRICS_ENABLED=true 且鉴权失败 → 401），符合「不暴露能力指纹」的设计意图，无冲突。
- 范围外 §5「不接入真实 Sentry SDK」与 `FR-004` 的「`SENTRY_DSN` 缺省时降级到 noop」基本一致；只是缺少「sentry + DSN 已设置但 SDK 未打包」的对称验收（已在 minor 列出）。
- 无命中 GS1-GS6 的 oversized FR：`FR-009` 虽列举多个 server action，但属于横切「边界接入」单一关注点，不是 CRUD / 多角色 / 多状态打包，granularity 合格。
- 无设计泄漏越线：env 字段名 / `/api/metrics` 路径 / `AppError` 字段集均属可观测契约的「外部可见行为」，按 rubric 不计入 A3 设计泄漏。

## 下一步

- `通过` → `规格真人确认`（auto mode 下父会话写 approval record，不在本 review 内执行）
- 父会话在 approval step 前可选择是否先派发一次轻量 `hf-specify` 回修，把上述 important LLM-FIXABLE 三项（NFR Source 锚点、`OBSERVABILITY_SLOW_QUERY_MS` 入 env 契约、「受控键集合」定义）一次性补齐；这不是阻塞条件。
- approval 后 → `hf-design`（按 increment 记录 §变更包，design 阶段需就 `node:sqlite` 在线备份具体路径、`/api/metrics` 的 token 注入位置、boundary 接入封装形式给出技术结论）。

## 记录位置

- `/workspace/docs/reviews/spec-review-phase2-observability-ops-v1.md`

## 交接说明

- 父会话：先以 1-2 句 plain-language 结论告知用户「规格通过 review，可以进入真人确认」；不要把 LLM-FIXABLE 列表抛给用户。
- 若用户希望 review-once-more，则按上述「下一步」中的 important LLM-FIXABLE 三项做一次性补齐再回到 approval。
- reviewer 不修改规格、不写 approval record、不更新 `task-progress.md`。
