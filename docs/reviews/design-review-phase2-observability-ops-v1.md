# Phase 2 — Observability & Ops V1 设计评审记录

- 评审对象: `docs/designs/2026-04-19-observability-ops-v1-design.md`
- 已批准规格: `docs/specs/2026-04-19-observability-ops-v1-srs.md`
- Spec 评审 / 批准: `docs/reviews/spec-review-phase2-observability-ops-v1.md` / `docs/verification/spec-approval-phase2-observability-ops-v1.md`
- 增量记录: `docs/reviews/increment-phase2-observability-ops-v1.md`
- 评审 skill: `hf-design-review`
- 评审者: design reviewer subagent（独立于设计起草者）
- Execution Mode: `auto`
- 评审日期: 2026-04-19

## 结论

需修改

设计在覆盖度、模块边界、ADR 表达方式、失败模式列举上整体到位，§3 / §9 / §11 已经能让 `hf-tasks` 起步。但两处 ADR 在「与本仓库实际运行时和 Next.js 16 实际语义」之间存在事实性偏差（ADR-1 上下文传播链在 Next 16 `proxy` 模型下不成立；ADR-2 主路径调用了 `node:sqlite` 中**不存在**的实例方法 `db.backup()`），若直接进入任务规划会立刻在 walking skeleton 阶段返工。这两条都属于 `LLM-FIXABLE`，可在一轮定向修订中关闭，无需重新进入 `hf-specify`，因此判定为 `需修改` 而非 `阻塞`。

## 维度评分

| 维度 | 分数 | 说明 |
|------|------|------|
| `D1` 需求覆盖与追溯 | 8/10 | §3 表完整覆盖 FR-001..FR-009、NFR-001..NFR-005、CON-001..CON-005；NFR 行有 markdown 列数错位（少了「主要承接模块」列），影响冷读体验，但语义未丢。 |
| `D2` 架构一致性 | 7/10 | §8 三视图清晰，§9 模块清单边界明确；问题在中间件层与 boundary decorator 之间的「上下文链」在 Next 16 `proxy` 语义下其实是断的（详见 F-1）。 |
| `D3` 决策质量与 trade-offs | 7/10 | §6.1 / §6.2 给出真实可读的方案对比表，trade-off 不是稻草人；扣分点是 ADR-1 选定方案对 Next 16 `proxy` 隔离的边界条件未列入劣势栏；ADR-2 选定方案的 API 签名错误（详见 F-2）。 |
| `D4` 约束与 NFR 适配 | 7/10 | §12 落地表逐项映射；NFR-002（不引入新依赖）落地清楚；NFR-001 由 §13.3 指回规格基线协议合理；CON-002（disabled→404）落到 ADR-4 与 §11 I-1。扣分点是 NFR-005 行只列「提供工厂」而未交代 ALS 在测试隔离中的具体处理方式（与 F-1 同源）。 |
| `D5` 接口与任务规划准备度 | 7/10 | §11.1 类型契约具体到方法名 / 参数 / 返回；§15 显式回答 readiness。扣分点是 `wrapServerAction` 的 Next.js Server Action 契约保留方式未在设计层固定（详见 F-3），会让 T49 在「fail-first」阶段找不到稳定 acceptance。 |
| `D6` 测试准备度与隐藏假设 | 8/10 | §13 分单元 / 集成 / 现有回归 / e2e / CLI 五层，结构清楚；§14 失败模式覆盖到位。扣分点是 §18 把 `wrapServerAction` 的 Next.js 契约保留与 `db.backup` 可用性都列为「非阻塞 / 实现时再看」，但它们其实是会决定整个 walking skeleton 能否跑通的关键假设（详见 F-1 / F-2）。 |

每个维度按 `references/review-checklist.md` 的 0–10 标尺评分，任一关键维度低于 6 即不得 `通过`。当前最低 7，无 `通过` 阻断；存在 ≥1 维度低于 8，对应至少一条具体发现项。

## 发现项

### 关键

- `[critical][LLM-FIXABLE][D2/A2] F-1 ADR-1 在 Next 16 `proxy` 模型下，proxy 层创建的 AsyncLocalStorage 上下文不会自动透传到 route handler / server action。`
  - 证据：本仓库 `web/package.json` 锁定 `next@16.2.2`；`web/node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md` 第 11 行声明「`middleware` 文件名约定已废弃，改为 `proxy`」，第 17–21 行明确「Proxy is meant to be invoked separately of your render code... you should not attempt relying on shared modules or globals. To pass information from Proxy to your application, use headers, cookies, rewrites, redirects, or the URL.」。第 217–219 行进一步说明 Proxy 默认 Node.js runtime，但**与 render code 是隔离的边界**。
  - 影响：设计 §8.1 / §8.2 / ADR-1 / §9 `app/middleware`（路径还写的是 `web/src/middleware.ts`）依赖「middleware 内 `als.run(trace, () => action())` 把 server action 调用包进 ALS」这一假设；在 Next 16 的 proxy 隔离语义下，server action / route handler 在另一边界恢复执行时**不会**继承 proxy 端建立的 ALS context，导致 `getCurrentTraceId()` 在所有 boundary 内返回 `undefined`，整个 trace id 串联（FR-001、FR-002、FR-003、FR-009 的成功路径与失败路径）退化为 `traceId='unknown'` 兜底——直接动摇 walking skeleton（§13.1）的成立条件。
  - 修订要求（任选其一并在文档中说明）：
    1. 把 trace id 落地路径改为 **proxy 层只做「生成 / 校验 / 写入请求头与响应头」，不依赖 ALS 跨进程传播**；ALS 改为在 `wrapServerAction` / `wrapRouteHandler` 内部 `als.run()`，从入参 `Request.headers.get('x-trace-id')`（route handler）或 `headers()`（server action）读取由 proxy 注入的 trace id。
    2. 或改用 `instrumentation.ts`（`web/node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/instrumentation.md`）+ boundary decorator 自己 `als.run()`，proxy 只负责响应头回写。
  - 同时把文件路径从 `web/src/middleware.ts` 改为 `web/src/proxy.ts`，并把 §6.1 候选表的方案 A 列「主要代价 / 风险」补上「在 Next 16 `proxy` 隔离边界下 ALS 不会自动透传到 render server，必须以请求头作为传播媒介」。

- `[critical][LLM-FIXABLE][D3/A3] F-2 ADR-2 主路径调用的 `db.backup()` 不是 `node:sqlite` 的实例方法。`
  - 证据：在仓库自身的 Node 22.22.2 运行时执行 `Object.getOwnPropertyNames(Object.getPrototypeOf(new sqlite.DatabaseSync(':memory:')))`，得到 `['open','close','prepare','exec','function','location','aggregate','createSession','applyChangeset','enableLoadExtension','loadExtension','constructor']`——**不包含 `backup`**。模块顶层导出为 `DatabaseSync, StatementSync, constants, backup`，即 API 是模块级函数 `sqlite.backup(source, path, options)`，而非实例方法 `db.backup(destPath, ...)`。
  - 影响：
    - §1 / §2 第 3 条 / §4 / §6.2 表 X 行 / §7 D-2 / §10.2 序列图 / ADR-2 / §14 fallback 条件 / §18 ASM-002 引用都写的是 `db.backup()`；按现状落到任务时实现会立刻报「`db.backup is not a function`」。
    - §14 fallback 条件 `if (typeof db.backup !== 'function') 切到 fs.copyFile`——按现状会**永远**触发 fallback，「主路径」从未真正执行；ADR-2 立项理由（在线备份不阻塞实例 + FR-007 第 2 条 2 秒不可用窗口验收）就形同虚设。
  - 修订要求：
    1. 把 §6.2 / §7 / §10.2 / §14 / ADR-2 中所有 `db.backup(...)` 改写为模块级 `sqlite.backup(sourceDb, destPath, { rate, progress })`（或对应当前 Node 22 实测签名），并补一条「设计阶段已在本仓库 Node 22.22.2 上 smoke 验证 API surface」的证据脚注。
    2. 同步把 §14 的 fallback 自检条件改为「检测 `sqlite.backup` 模块级函数是否可用」，并明确 fallback 触发时是 ADR-2 的 *回退路径*，不是 *默认路径*。
    3. 在 ASM-002 行末追加一句「若运行时实测 `node:sqlite` 模块级 `backup` 行为不符合 FR-007 第 2 条不可用窗口要求，回退方案 Y 已在 §6.2 与 §14 显式标注，无需回到 hf-specify」。

### 重要

- `[important][LLM-FIXABLE][D5/A9] F-3 `wrapServerAction` 对 Next.js Server Action 契约的保留方式未在设计层固定，§18 把它推到 T49「实现时再看」。`
  - 在 Next 16 中，Server Action 的 action ID 由 React 编译器基于 `"use server"` 文件 + 导出名派生；如果在 wrapper 中**重新创建一个非异步 / 非箭头 / 非顶层导出的函数**，可能会错过 action ID 注入或 `bind` 形态绑定。
  - §10 / §11.1 没有显式约束 wrapper 必须满足的契约（异步、保留 `this`、保留 `length`、保留模块顶层 `"use server"` 作用域、不能在 wrapper 文件内执行 wrap 而要在原 `"use server"` 文件 export 处 wrap）。
  - 修订要求：在 §9 `observability/server-boundary` 行的「不允许做」一栏 / §11 不变量段补一条 I-7：「`wrapServerAction(name, fn)` 必须在原 `"use server"` 模块的 `export` 现场调用，wrapper 必须返回 async function 且保持 `fn.length`、`fn.name`、`this` 绑定行为；wrapper 自身所在文件不引入新的 `"use server"` 顶层指令，避免污染 action ID 命名空间。」并在 ADR-5 后果栏明确这是 Next 16 Server Action 模型的硬约束。

- `[important][LLM-FIXABLE][D1] F-4 §3 追溯表 NFR-001..NFR-005 五行的 markdown 列数与表头不一致，缺「主要承接模块」列。`
  - 表头是「| 规格条目 | 主要承接模块 | 备注 |」三列，但 NFR 行只填了 2 个 cell，会被渲染成「备注列空 / 主要承接模块塞进备注」。
  - 修订要求：补齐 NFR-001..NFR-005 行的「主要承接模块」列（如 NFR-001 → `observability/logger`、`observability/metrics`、`observability/trace`；NFR-005 → `observability/init` 的 `resetObservabilityForTesting` 与各 `createXxx` 工厂等），让追溯能被冷读。

- `[important][LLM-FIXABLE][D6] F-5 §13.3 把 NFR-001 的实测全部委托给 `hf-regression-gate`，但未在设计层标注「需要在哪个 task 完成后立刻具备可执行的基线 / 增量提交对」。`
  - 规格 §7 NFR-001 第 2 条要求 checkout `master` 与本增量最终提交各跑一次 1000 次顺序请求；如果 §13.3 不显式锚定「在 T51 之后才进行 NFR-001 measurement，不在 T46 walking skeleton 之后做」，hf-tasks 阶段会很容易把 NFR-001 验收挂在错误的 task 完成节点上，进而被 regression-gate 退回。
  - 修订要求：在 §13.3 增加一句「NFR-001 基线测量在 §15 任务规划列表全部 `Done` 之后、`hf-regression-gate` 阶段一次性执行；不绑定单个 task 的 fail-first 用例。」

### 次要

- `[minor][LLM-FIXABLE][D2] F-6 §9 中 `app/middleware` 一行的「路径」列写的是 `web/src/middleware.ts`，与 Next 16 `proxy` 命名约定不一致（已被 F-1 覆盖，但请在修订时同步更新）。`
- `[minor][LLM-FIXABLE][D3] F-7 ADR-4 的 disabled→404 实现里，§10.3 流程图末端的 404 响应 body 写的是 `'not found'` 字符串，但 §11 类型契约层对响应 body 形态没有约束。`
  - 与生产 Next.js 默认 404 形态（HTML / JSON）不一致也算一种弱指纹。建议明确「404 路径返回与 Next.js 默认未匹配路由相同形态的 body（最小化指纹）」，或显式说明「采用 `Response.json({ error: 'not_found' }, { status: 404 })` 是有意识接受的小指纹，trade-off 已被 ADR-4 涵盖」。
- `[minor][LLM-FIXABLE][D6] F-8 §13.2「现有业务回归」列没有给出最低门槛断言（例如「现有 vitest suite 在 wrap 后 0 失败」），仅口头描述「行为应完全一致」。建议把 CON-004 的回归断言落到一条具体的可执行 gate（命令 + 期望 exit code）。`

## 薄弱或缺失的设计点

- §8 没有给出「proxy / instrumentation / boundary decorator 之间的进程边界与 ALS 生命周期视图」，导致 F-1 这种 Next 16 隔离语义问题不容易在冷读时被捕获。建议在 §8 补一张「请求 → proxy（边界 1）→ render server（边界 2）→ wrapServerAction `als.run()`」的边界图。
- §10.1「启动序列」第 4 条「`backup.lastBackupAt` 通过对 `SQLITE_BACKUP_DIR` 的最近 mtime 扫描」未声明该扫描在多 worker / Next standalone build 下的并发安全性。当前选择 5s 短缓存 + best-effort（§18），但缓存层归属哪个模块（health route handler 内部 / 还是 `observability/init` / 还是 `backup` 模块）没有在 §9 落点。
- §14 `restore` 行的「文档要求停服后执行；脚本启动时检测 `lsof` 不可行（不引入新依赖），改为 readlink 检查 + `--force` 显式覆盖标志」未在 §11.1 类型契约或 §9 模块职责中体现 `--force` 标志的存在；hf-tasks 拆解时容易漏。

## 与 spec / 增量记录的一致性

- 设计未引入新的功能能力，未触碰 schema（CON-003）、未变更 server action 对外行为（CON-004）、未引入新 runtime 依赖（CON-001 / NFR-002）。
- ADR-2 修订（F-2）只触动备份脚本内部 API 形态，不放大范围、不改变规格已批准的 FR-007 验收口径，符合 ASM-002 关于「设计阶段定结论可调整、不回 hf-specify」的预期。
- ADR-1 修订（F-1）只调整 trace id 在 boundary 之间的传播媒介，不改变 FR-001 的对外契约（响应头 `x-trace-id`、归一化错误对象 `traceId` 字段）；属于设计阶段内部修订。
- 未发现 phase 1 / Discovery Quality 已交付能力被回退或被打穿的迹象。
- §3 / §9 接入点与现有 `web/src/app/api/health/route.ts`、`web/src/app/api/discovery-events/route.ts`、`web/src/features/community/runtime.ts`、`web/src/config/env.ts` 的真实形态吻合（已逐文件读取核对）。

## Anti-Pattern 检测

- `A1` 无 NFR 评估：未触发；§12 / §13.3 已落地。
- `A2` 只审 happy path：F-1 触发——失败路径在 ALS 不传播下会全员退化；纳入修订要求。
- `A3` 无权衡文档：§6.1 / §6.2 已显式列出；F-2 触发，因为「主路径 vs fallback」的真实分布与 ADR-2 描述相反。
- `A4` 单点故障未记录：未触发；§14 已逐项映射。
- `A5` 实现后评审：未触发（在设计阶段评审）。
- `A6` 上帝模块：未触发；§9 模块按命名空间分。
- `A7` 循环依赖：未触发；`server-boundary` 单向依赖 `trace / logger / errors / error-reporter / metrics`，`init` 顶层装配。
- `A8` 分布式单体：未触发；本设计本就是进程内能力。
- `A9` task planning gap：F-3 / F-5 触发；纳入修订要求。

## 下一步

- 主链下一步: `hf-design`（针对 F-1、F-2、F-3、F-4、F-5 做一轮定向修订；F-6、F-7、F-8 顺手补上）
- 修订完成后：重新触发 `hf-design-review`；通过后进入 `设计真人确认`，再进入 `hf-tasks`
- 不需要 `hf-workflow-router`：本评审未发现需求漂移、route / stage / 证据链冲突；ASM-002 已显式允许「设计阶段调整备份策略不回 hf-specify」。

## 记录位置

- `docs/reviews/design-review-phase2-observability-ops-v1.md`

## 交接说明

- 本结论为 `需修改`，不进入 `设计真人确认`；由父会话调度 `hf-design` 处理 F-1..F-8。
- 父会话不应在本轮直接进入 `hf-tasks`：F-1 / F-2 若未关闭，T46（trace + logger walking skeleton）与 T51（backup / restore CLI）两条任务的 fail-first acceptance 都会立刻挂掉。
- reviewer 不代写设计修订内容；仅给出修订要求与证据。
