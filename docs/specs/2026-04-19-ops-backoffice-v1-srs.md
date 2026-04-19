# Phase 2 — Ops Back Office V1 需求规格说明

- 状态: 已批准
- 批准记录: `docs/verification/spec-approval-phase2-ops-backoffice-v1.md`
- 主题: Phase 2 — Ops Back Office V1（运营 / 审核后台 V1）
- 输入来源: `docs/ROADMAP.md` §3.2；`docs/reviews/increment-phase2-ops-backoffice-v1.md`
- Execution Mode 偏好: `auto`

## 1. 背景与问题陈述

Lens Archive 已完成阶段 1 + Discovery Quality + Observability & Ops V1 + Discovery Intelligence V1，主线已具备「高匹配发现」叙事与可观测性 / 备份恢复基线，但**运营动作仍只能通过直接 `sqlite3` 操作数据库**：

- 「精选位编排」目前只能由开发者改 seed 文件 + 重启或手工 `INSERT INTO curated_slots`，导致：a) 没有变更留痕；b) 没有"谁改的、什么时候改的"可追溯性；c) 任何改动都需要工程师介入。
- 「内容质量管理」目前完全没有可执行手段：当用户上传违规作品（含 NSFW、版权侵权、骚扰内容等），运营**无法在不直接 `UPDATE works SET status='draft' WHERE id=?` 的前提下把作品从公开页移除**；并且 `draft` 是创作者自己的状态，让运营把作品改成 draft 会让创作者误以为是自己改了。
- 没有审计日志：无论是精选编排还是任何潜在的违规处置，运营**没有任何方式回看"谁、什么时候、对什么对象、做了什么"**。事故复盘、合规质询都缺乏证据链。

本轮要解决的，不是引入完整后台系统、不是做工单 / 举报队列、不是做账号管理，而是把当前最高频的两类运营动作（**精选位编排** + **作品违规处置**）收口到 **可登录、可授权、可追溯** 的最小后台 shell，并把所有写动作落到审计日志，使得阶段 2 后续主题（举报队列、账号管理、复杂内容审核）可以在「有 admin 入口 + 有审计基线」的前提下持续推进。

## 2. 目标与成功标准

### 2.1 总体目标

- 让 **管理员（通过 env 显式声明的邮箱）** 在不直接操作数据库的前提下，完成：a) 精选位增删 / 重排；b) 把违规作品从公开页移除 / 恢复。
- 让所有 admin 写动作 **强制** 进入审计日志，且 admin 用户自己可以在后台读到该日志，运维 / 法务可以从 sqlite 直接查 `audit_log` 表。
- **不破坏** 任何现有公开页 / 创作者工作台 / 关注 / 评论 / 联系 / 推荐模块的行为：非管理员账号在视觉与交互上不应感知到本增量带来的差异。
- 不引入第三方依赖、不接入 §3.1 生产数据，仍保持单实例 `node:sqlite` + Next.js App Router。

### 2.2 成功标准

- 管理员通过既有 `/login` 登录后，访问 `/studio/admin` 可以进入后台 dashboard；非管理员（含 guest 与普通 photographer / model）访问任意 `/studio/admin/**` 应被重定向到对应安全位置（guest → `/login`；非 admin → `/studio`），不暴露任何 admin 数据。
- 管理员可以在 `/studio/admin/curation` 上：
  - 看到当前 `home` / `discover` 两个 surface 下所有精选 slot 的列表（包含 `sectionKind`、`targetType`、`targetKey`、`order`、目标对象的 display name）。
  - 添加一个新 slot（指定 surface + sectionKind + targetType + targetKey + order）。
  - 删除一个 slot。
  - 调整一个 slot 的 `order`（重排）。
  - 每次写动作完成后，目标 surface 的公开页（`/`、`/discover`）下次 SSR 渲染就反映新顺序，不需要重启进程。
- 管理员可以在 `/studio/admin/works` 上：
  - 看到所有作品（不限 status）的列表，含当前 status (`draft` / `published` / `moderated`)、`title`、`ownerName`、最近更新时间。
  - 对任一 `published` 作品执行「隐藏」动作 → status 变为 `moderated` → 该作品立即在 `/works/[workId]`、`/photographers/[slug]` showcase、`/discover`、首页推荐等所有公开 surface 不可见。
  - 对任一 `moderated` 作品执行「恢复」动作 → status 回到 `published` → 公开页可见。
  - 对 `draft` 作品的隐藏 / 恢复动作不展示（draft 本就对公开不可见，不应被运营干预）。
- 管理员可以在 `/studio/admin/audit` 上看到最新优先的审计日志列表，每条至少含：`createdAt`、`actorAccountId`、`action`（如 `curation.upsert` / `work_moderation.hide`）、`targetKind`、`targetId`、`note`（可选）。
- 当管理员对一个不存在的 work 执行隐藏 / 恢复 → server action 应返回明确错误而非 5xx；UI 显示错误但不破坏页面其余区域。
- 当 admin 名单（`ADMIN_ACCOUNT_EMAILS`）为空时，**任何账号** 都不能访问 `/studio/admin/**`，即便是 `studio` 已登录账号；这是默认安全状态。
- 现有所有公开页 / studio 工作台 / 推荐模块 / `/api/health` / `/api/metrics` / 关注 / 评论 / 联系等行为不发生回归；vitest 全套 baseline 不漂移。

## 3. 用户角色与关键场景

### 3.1 主要角色

- **管理员**：邮箱在 `ADMIN_ACCOUNT_EMAILS` 中的已登录账号；通常也是 `photographer` / `model` 角色之一（admin 是叠加在 primary role 上的能力，不是独立 role）。
- **创作者（photographer / model）**：现有 `studio` 用户；不感知 admin 后台的存在，除非自己也是 admin。
- **公开访客 / 已登录非 admin 用户**：对本增量完全无感；只能感受到「违规作品被运营隐藏后从公开页消失」这件事。

### 3.2 次要角色

- **运维 / 法务**：通过直接读 sqlite `audit_log` 表得到线性可追溯证据；本 V1 不为他们做专门 UI（admin 后台审计页面已经够用）。

### 3.3 关键场景

- 一个标记为 admin 的摄影师 Avery 登录后访问 `/studio/admin`，看到 dashboard 顶部三张入口卡（精选位编排 / 作品审核 / 审计日志），点击「精选位编排」进入 `/studio/admin/curation`。
- Avery 看到首页「精选作品」区有一张已下架的作品仍然出现在配置中（虽然推荐模块运行时已 fallback），决定从配置里删掉这条 slot；点击「移除」→ 后台落库 + 写入 `audit_log` → 列表立刻刷新；下次首页 SSR 不再尝试该 slot。
- Avery 收到一条用户反馈某摄影师作品 `work-x` 含未授权肖像。她访问 `/studio/admin/works`，找到 `work-x`，点击「隐藏」→ status 变为 `moderated` → 立即访问 `/works/work-x` 应得到 404；该作品的 owner profile 公开页 showcase / 推荐模块 / 搜索结果等都不再展示该作品；操作落审计。
- 几小时后版权方撤回投诉，Avery 访问审计日志找到这条记录，回到作品列表点击「恢复」→ status 回到 `published` → 公开页可见，新增一条 `restore` 审计记录。
- 一个普通注册用户（非 admin）尝试直接访问 `/studio/admin` → 被重定向到 `/studio`，DOM 中不出现任何 admin 列表 / 数据。
- 一个未登录访客尝试访问 `/studio/admin/audit` → 被重定向到 `/login`。
- `ADMIN_ACCOUNT_EMAILS` 为空时，admin Avery 自己尝试访问 `/studio/admin` → 也被重定向到 `/studio`（默认安全：未配置 admin 名单等于没有 admin）。

## 4. 当前轮范围与关键边界

本轮**只做**：

- env 字段 `ADMIN_ACCOUNT_EMAILS`（CSV 形式邮箱白名单）。
- 共享的 `AdminCapabilityPolicy` + `AdminGuard`，与既有 `StudioGuard` 同形复用。
- `/studio/admin`（dashboard，仅入口卡片）+ `/studio/admin/curation` + `/studio/admin/works` + `/studio/admin/audit` 四个 SSR 页面。
- `CommunityWorkStatus` 联合追加 `"moderated"`；公开 read model + 推荐模块 + 列表 + showcase 都过滤 moderated。
- `WorkRepository.listAllForAdmin()` 新读能力；`CurationConfigRepository.upsertSlot / removeSlot / reorderSlot` 新写能力。
- `AuditLogRepository.record / list`；新 `audit_log` SQLite 表。
- `features/admin/curation-actions.ts`、`features/admin/work-moderation-actions.ts` 两个 server action 文件，全部包 `wrapServerAction`。
- 新 metrics 命名空间 `admin.{curation,work_moderation,audit}.*`，复用 `MetricsRegistry`。
- `/studio` 主页对 admin 用户显示「进入运营后台」入口（仅入口；不改既有 dashboard 结构）。

## 5. 范围外内容

明确**不在**本增量做：

- 不做举报队列（用户可点「举报作品」并形成待处置队列）。
- 不做账号管理（封禁 / 解封 / 角色变更）。
- 不做 profile 维度的隐藏 / 警告（仅作品；profile 处置与举报队列一起做）。
- 不做评论审核（评论现有创作者级别即可删除，运营如需删评论可与创作者协调）。
- 不引入二次审批 / 双人复核工作流（V1 admin 单人即时生效）。
- 不接入外部 IAM / SSO / 角色管理后端；admin 名单直接来自 env。
- 不引入 audit log 的 redaction / 加密 / 滚动归档（V1 仅 append；后续 §3.8 V2 评估）。
- 不引入 admin 操作的 rate limit 与防重放（V1 信任 admin 名单本身的安全性）。
- 不开放 `audit_log` 给非 admin 账号查看。
- 不做 `/api/admin/*` REST 端点；所有 admin 写动作走 server action（form action）。

## 6. 功能需求

> 注：V1 范围内 8 条 FR 互为前置（缺任一条会破坏「admin 入口 + 审计闭环 + 公开屏蔽 + 可观测性」中的一环），故全部 `Must`。

### FR-001 Admin Capability + Guard
#### 需求说明
系统应在 `web/src/config/env.ts` 引入 `ADMIN_ACCOUNT_EMAILS`（CSV 形式邮箱白名单），并由 `createAdminCapabilityPolicy(session, adminEmails, account)` 与 `createAdminGuard(session, adminCapability)` 把"是否 admin"判定与"是否允许进入 `/studio/admin`"判定收口为纯函数；二者在 `getRequestAccessControl()` 中自动注入。

#### 验收标准
- Given `ADMIN_ACCOUNT_EMAILS` 未设置 / 空字符串 / 仅含空白，When `getRequestAccessControl()` 解析 admin 名单，Then 解析结果为空集合；任何账号的 `adminCapability.isAdmin === false`；任何账号的 `adminGuard.allowed === false`。
- Given `ADMIN_ACCOUNT_EMAILS="alice@example.com,Bob@Example.com,  carol@example.com  "`，When 解析名单，Then 名单归一化为 `["alice@example.com","bob@example.com","carol@example.com"]`（trim + lower + dedup）。
- Given 名单中包含非法邮箱片段（如 `not-an-email`、`@example.com`、`a@`），When 解析名单，Then 非法片段被丢弃 + 写一条 `warn` 启动日志，不阻塞启动。
- Given 已认证账号 email 在归一化后的 admin 名单中，When 解析 `adminCapability`，Then `isAdmin === true` + `adminGuard.allowed === true`。
- Given 已认证账号 email 不在 admin 名单中，When 解析 `adminGuard`，Then `allowed === false` + `redirectTo === "/studio"` + `reason === "not_admin"`。
- Given guest，When 解析 `adminGuard`，Then `allowed === false` + `redirectTo === "/login"` + `reason === "unauthenticated"`。
- Given 任何 admin 判定，When 写入 server log，Then 不允许把 admin 邮箱原文进入结构化日志的受控键集合（沿用 §3.8 logger 白名单约束）。

#### Priority
Must

#### Source / Trace Anchor
ROADMAP §3.2「管理员角色策略」；增量记录 §变更包/New。

---

### FR-002 `/studio/admin` Dashboard 与导航
#### 需求说明
系统应在 `/studio/admin` 提供 admin dashboard 页面，含三张入口卡（精选位编排、作品审核、审计日志），并在 `/studio` 主页对 admin 用户显示「进入运营后台」入口；所有 `/studio/admin/**` 子路由都由 `AdminGuard` 保护。

#### 验收标准
- Given admin 已登录，When 访问 `/studio/admin`，Then 页面 HTTP 200 + 渲染 dashboard（三张入口卡 + 当前账号 email 提示）。
- Given guest，When 访问 `/studio/admin` 或任意子路由，Then 服务端 redirect 到 `/login`。
- Given 已认证非 admin 账号，When 访问 `/studio/admin` 或任意子路由，Then 服务端 redirect 到 `/studio`。
- Given admin 已登录，When 访问 `/studio` 主页，Then 主页渲染「进入运营后台 → /studio/admin」入口卡片。
- Given 非 admin 账号，When 访问 `/studio` 主页，Then 不渲染该入口卡片（DOM 不存在），即不暴露 admin 后台存在。

#### Priority
Must

#### Source / Trace Anchor
ROADMAP §3.2「新建 `app/(admin)` 段（或 `studio/admin`）」；增量记录 §变更包/New。

---

### FR-003 Curation 精选位维护
#### 需求说明
系统应在 `/studio/admin/curation` 提供 admin 对 `home` / `discover` 两个 surface 上现有 `featured` 区域 slot 的列表 + 添加 + 删除 + 重排能力；写操作通过 `CurationConfigRepository.upsertSlot / removeSlot / reorderSlot` 完成。

#### 验收标准
- Given admin 已登录，When 访问 `/studio/admin/curation`，Then 页面按 surface 分两段，列出当前 `home` / `discover` surface 下的所有 slot；每行至少含：`sectionKind`、`targetType`、`targetKey`、`order`、目标对象 display name（profile / work / opportunity）或「目标不存在」标识。
- Given admin 提交「添加 slot」表单（合法 surface + sectionKind + targetType + targetKey + order），When server action 执行，Then 新 slot 写入 `curated_slots` 表 + 写入一条 `audit_log` 条目（`action="curation.upsert"`），UI 重定向回列表，新 slot 出现在对应位置。
- Given admin 提交「删除 slot」，When server action 执行，Then 该 slot 从 `curated_slots` 删除 + 写入 `audit_log`（`action="curation.remove"`）。
- Given admin 提交「重排」（指定一个已存在 slot 的新 `order`），When server action 执行，Then 该 slot 的 `order_index` 更新（不动其他 slot；不进行整体重排算法，仅按提交值写入）+ 写入 `audit_log`（`action="curation.reorder"`）。
- Given admin 提交合法但指向不存在的 `targetKey`（如 `targetType="work"` + `targetKey` 对应作品已删除 / moderated），When server action 执行，Then **仍然落库**（保留运营手动维护"占位 slot"以待目标恢复的灵活性）；但 UI 列表对该行显示「目标不存在 / 已下架」标识 + 在审计 `note` 中记录「target_not_found_at_write」。
- Given admin 对同一 `(surface, sectionKind, targetKey)` 重复 upsert，When server action 执行，Then 视为更新（沿用主键约束 + UPSERT 语义）；只写一条审计。
- Given admin 提交非法 surface / sectionKind / targetType（不在联合内），When server action 执行，Then 返回明确错误（`AppError` `code="invalid_curation_input"` `status=400`），不写库 / 不写审计。
- Given 任意 curation 写动作完成，When `MetricsRegistry` 快照，Then 对应 counter（`admin.curation.added` / `removed` / `reordered`）递增 1。

#### Priority
Must

#### Source / Trace Anchor
ROADMAP §3.2「精选位维护界面对接 `CurationConfigRepository`」；增量记录 §变更包/New + Modified。

---

### FR-004 作品违规处置（hide / restore）
#### 需求说明
系统应在 `/studio/admin/works` 提供所有作品的 admin 列表，并对 `published` 作品提供「隐藏」（→ `moderated`）、对 `moderated` 作品提供「恢复」（→ `published`）能力；`draft` 作品不提供任何处置按钮。

#### 验收标准
- Given admin 已登录，When 访问 `/studio/admin/works`，Then 页面列出所有作品（不限 status），按 `updatedAt desc` 排序；每行至少含：`title`、`ownerName`、当前 status（i18n 标签：草稿 / 已发布 / 已隐藏）、最近更新时间、对应处置按钮（published → 「隐藏」；moderated → 「恢复」；draft → 不显示处置按钮）。
- Given admin 对 `published` 作品执行「隐藏」，When server action 执行，Then 作品 status 变为 `moderated` + 写入 `audit_log`（`action="work_moderation.hide"`）；列表刷新后该行 status 变为「已隐藏」、按钮变为「恢复」。
- Given admin 对 `moderated` 作品执行「恢复」，When server action 执行，Then 作品 status 变回 `published` + 写入 `audit_log`（`action="work_moderation.restore"`）。
- Given admin 对 `draft` 作品提交 hide / restore（表单被恶意构造），When server action 执行，Then 返回 `AppError` `code="invalid_work_status_transition"`，不改库 / 不写审计。
- Given admin 对不存在的 `workId` 执行 hide / restore，When server action 执行，Then 返回 `AppError` `code="work_not_found"` `status=404`，不改库 / 不写审计。
- Given 一个 `published` 作品被隐藏后，When guest 访问 `/works/<workId>`，Then 应返回 404（沿用 `getPublicWorkPageModel` 对非 published 的 nullable 行为）；`/photographers/<slug>` showcase / `/discover` / `/`（首页发现 + 相关创作者 / 相关作品推荐）/ `/search` 都不再展示该作品。
- Given 该作品 owner 自己访问 `/studio/works`（创作者自己的工作台），Then 应仍能在自己的列表中看到该作品（含「已隐藏」标识，但**不**提供恢复入口；运营隐藏的作品由运营恢复，不允许创作者自己绕过审核）。
- Given 任意 hide / restore 完成，When `MetricsRegistry` 快照，Then 对应 counter（`admin.work_moderation.hidden` / `restored`）递增 1。

#### Priority
Must

#### Source / Trace Anchor
ROADMAP §3.2「内容审核：作品 / 资料的隐藏 / 警告 / 删除工具，配套审计日志」；增量记录 §变更包/New + Modified。

---

### FR-005 Audit Log
#### 需求说明
系统应在 SQLite 中新增 `audit_log` 表 + `AuditLogRepository.record / list`；所有 admin 写动作（curation 编辑、work hide / restore）必须经过一次 `recordAuditEntry` 才算完成；并在 `/studio/admin/audit` 提供最新优先的只读列表。

#### 验收标准
- `audit_log` 表至少含字段：`id (TEXT PRIMARY KEY)`、`created_at (TEXT NOT NULL)`、`actor_account_id (TEXT NOT NULL)`、`actor_email (TEXT NOT NULL)`、`action (TEXT NOT NULL)`、`target_kind (TEXT NOT NULL)`、`target_id (TEXT NOT NULL)`、`note (TEXT)`，`created_at` 为 ISO8601 字符串。
- Given admin 触发任意 curation / work-moderation 写动作，When server action 完成，Then `audit_log` 必须已 append 一条对应记录（`actor_account_id` / `actor_email` 来自当前 session + admin 名单匹配的 email；`action` / `target_kind` / `target_id` 与动作语义一致）。
- Given server action 内部抛出异常，When 异常被 `wrapServerAction` 归一化，Then **不**写审计（要么动作完成 + 写审计，要么动作失败 + 不写审计；不允许"作弊半套"）。
- Given admin 访问 `/studio/admin/audit`，Then 页面渲染最新 100 条 audit 记录（按 `created_at desc, id desc` 排序），每行含 `created_at`（人类可读 + ISO 双显）、`actor_email`、`action`、`target_kind:target_id`、`note`。
- Given 非 admin 账号访问 `/studio/admin/audit`，Then 重定向 + DOM 中无任何审计内容。
- Given 任意 audit append 完成，When `MetricsRegistry` 快照，Then `admin.audit.appended` counter 递增 1。
- Given audit log 体积增长，When 列表加载 100 条，Then 单次 SSR 内只触发一次 `audit_log` SELECT；不允许 N+1。

#### Priority
Must

#### Source / Trace Anchor
ROADMAP §3.2「内容审核 ... 配套审计日志」；增量记录 §变更包/New。

---

### FR-006 公开 read model 屏蔽 moderated 作品
#### 需求说明
系统应在 `web/src/features/community/public-read-model.ts` 与所有公开消费 work 的链路（首页发现、`/discover`、`/works/[workId]`、`/photographers/[slug]` showcase、`/models/[slug]` showcase、搜索、推荐 Related Works）一律把 `status === "moderated"` 视为对公开不可见，与既有 `draft` 同形。

#### 验收标准
- Given 一篇 `moderated` 作品，When 调用 `getPublicWorkPageModel(workId)`，Then 返回 `null`（与 draft 同形）。
- Given `getPublicProfilePageModel(role, slug)` 返回的 `showcaseItems`，When 任一作品 status 为 `moderated`，Then 该作品不应出现在 showcase 列表中。
- Given `bundle.works.listPublicWorks()`，When 返回值，Then `moderated` 作品不在内（与 draft 同形：`getPublicWorkRecords` 显式 filter `status === "published"`）。
- Given 推荐模块 `getRelatedWorks(seed)`，When 候选池构建，Then `moderated` 作品不进入候选池。
- Given 搜索 `features/search`，When 返回 work 命中，Then 不命中 `moderated` 作品。
- Given `WorkRepository.listAllForAdmin()`，When admin 列表加载，Then **包含**所有 status 的作品（`draft` / `published` / `moderated`）；该方法仅由 admin server action / admin SSR 消费。

#### Priority
Must

#### Source / Trace Anchor
ROADMAP §3.2「内容审核」隐含的「已隐藏作品对公开不可见」语义；增量记录 §变更包/Modified。

---

### FR-007 env 契约扩展
#### 需求说明
系统应在 `web/src/config/env.ts` 引入新 env 字段，并按 §3.8 V1 已建立的「降级 + warning」风格处理非法值。

新增字段：

- `ADMIN_ACCOUNT_EMAILS`（CSV 邮箱白名单；缺省 / 空 / 仅空白 ⇒ 名单为空）。

#### 验收标准
- Given 默认配置，When 系统启动，Then 行为：admin 名单为空；任何账号 `adminCapability.isAdmin === false`。
- Given `ADMIN_ACCOUNT_EMAILS="A@example.com, b@example.com, A@EXAMPLE.com"`，When 解析，Then 归一化后名单为 `["a@example.com","b@example.com"]`（trim + lower + dedup）。
- Given `ADMIN_ACCOUNT_EMAILS="not-an-email,carol@example.com,@bad,d@example.com"`，When 解析，Then 名单为 `["carol@example.com","d@example.com"]` + 写一条 `warn` 启动日志说明丢弃了 `not-an-email` / `@bad`。
- Given env 解析失败，When 系统启动，Then 不应阻塞启动（仅写 warn）；admin 名单为空时**不允许任何 admin 入口生效**（默认安全）。

#### Priority
Must

#### Source / Trace Anchor
ROADMAP §3.2「管理员角色策略」；增量记录 §变更包/Modified。

---

### FR-008 admin metrics 命名空间扩展
#### 需求说明
系统应在 `MetricsSnapshot` 上加性扩展 `admin` 顶层 optional 字段，预注册 6 个 counter；与 §3.8 V1 + §3.6 V1 两次加性扩展同形（不破坏既有 `http` / `sqlite` / `business` / `recommendations` / `gauges` / `labels`）。

预注册集合：
- `admin.curation.added`
- `admin.curation.removed`
- `admin.curation.reordered`
- `admin.work_moderation.hidden`
- `admin.work_moderation.restored`
- `admin.audit.appended`

#### 验收标准
- Given 系统启动且无 admin 写动作，When 调用 `/api/metrics`（带 token），Then `MetricsSnapshot.admin` 字段存在且 6 个 counter 全部为 0。
- Given admin 完成一次 curation upsert（new slot），When metrics 快照，Then `admin.curation.added` 递增 1 + `admin.audit.appended` 递增 1；其他 admin 字段不变。
- Given admin 完成一次 work hide，When metrics 快照，Then `admin.work_moderation.hidden` 递增 1 + `admin.audit.appended` 递增 1。
- Given 既有 `http` / `sqlite` / `business` / `recommendations` / `gauges` / `labels` 字段，When metrics 快照，Then 不被新 `admin` 命名空间影响 / 不被改名 / 不缺失。

#### Priority
Must

#### Source / Trace Anchor
ROADMAP §3.2「配套审计日志」；§3.8 V1 metrics 注册表；§3.6 V1 加性扩展先例；增量记录 §变更包/New。

---

## 7. 非功能需求

### NFR-001 性能
- admin 列表页 SSR 时延：在 ≤ 500 个作品 / ≤ 200 个 audit / ≤ 50 个 slot 的规模下，单页服务端渲染时延 ≤ **80ms**（基于 vitest micro-benchmark；剔除冷启动 100 次）。
- audit list 单次加载固定 100 条；不引入 SQL N+1（FR-005）。

### NFR-002 安全
- admin 名单仅由 env 注入；任何 admin 入口（页面 / server action / metrics 子命名空间）在名单为空时严格失败 closed（默认拒绝）。
- admin 邮箱不进入结构化日志的受控键白名单（FR-001）；只在 `audit_log.actor_email` 列存留（DB 层面，不进 log）。
- admin 写动作必须由 server action（form action）触发，不开放 REST 端点（CON-005）。
- 非 admin 账号在 DOM / 网络响应中均无法获得 admin 数据（FR-002 重定向）。

### NFR-003 可观测性
- 所有 admin server action 必须经 `wrapServerAction("admin/<actionName>", fn)` 包装，沿用 §3.8 V1 logger / metrics / errors 横切。
- 每条 admin 写动作产生一条结构化 server log（`event=admin.action.completed` 或 `event=admin.action.failed`），字段含 `actionName` / `targetKind` / `targetId` / `durationMs`；不允许把 `actor_email` 进入 log 字段（NFR-002）。

### NFR-004 可测试性
- `AdminCapabilityPolicy` / `AdminGuard` 是纯函数，可在 vitest 内不依赖 sqlite 的情况下断言。
- `AuditLogRepository` / `CurationConfigRepository` 写能力 / `WorkRepository.listAllForAdmin` 必须支持 in-memory bundle 注入（沿用既有 `createInMemoryCommunityRepositoryBundle` 模式）。
- admin server action 必须通过 deps 注入接受 fake `Session` / `bundle` / `metrics` / `auditLog` / `logger`。

### NFR-005 兼容性
- 不修改任何已交付公开页 / studio 工作台 / 推荐模块 / `/api/health` / `/api/metrics` / 关注 / 评论 / 联系 / outbound 行为；仅新增 admin 模块 + 公开 read model 加一个过滤条件（与既有 draft 过滤同形）。
- env 字段缺省时全行为与当前主线一致（admin 入口默认隐藏）。

## 8. 数据契约

### 8.1 类型扩展

```ts
// features/community/types.ts
export type CommunityWorkStatus = "draft" | "published" | "moderated";

// features/auth/types.ts
export type AdminCapabilityPolicy = {
  isAdmin: boolean;
  email: string | null; // matched admin email (lowercase) or null
};

export type AdminGuard = {
  allowed: boolean;
  redirectTo: "/login" | "/studio" | null;
  reason: "allowed" | "unauthenticated" | "not_admin";
};

// AccessControl gains:
//   adminCapability: AdminCapabilityPolicy;
//   adminGuard: AdminGuard;
```

### 8.2 新增类型

```ts
// features/admin/audit-log.ts
export type AuditAction =
  | "curation.upsert"
  | "curation.remove"
  | "curation.reorder"
  | "work_moderation.hide"
  | "work_moderation.restore";

export type AuditTargetKind = "curation_slot" | "work";

export type AuditLogEntry = {
  id: string;
  createdAt: string;
  actorAccountId: string;
  actorEmail: string;
  action: AuditAction;
  targetKind: AuditTargetKind;
  targetId: string;
  note?: string;
};

export interface AuditLogRepository {
  record(entry: Omit<AuditLogEntry, "id" | "createdAt"> & Partial<Pick<AuditLogEntry, "id" | "createdAt">>): Promise<AuditLogEntry>;
  listLatest(limit: number): Promise<AuditLogEntry[]>;
}
```

### 8.3 不变量

- `actorEmail` 永远是已归一化的 lowercase；与 admin 名单匹配的同一字符串。
- `audit_log.id` 由 server action 生成（randomUUID）；不接受外部输入覆盖（除测试注入）。
- admin server action 完成 = 业务写动作 + 一次 `auditLog.record`，二者在同一个事务边界（V1 串行调用，仍同 sqlite 进程内即时一致；设计阶段需选择"显式 BEGIN/COMMIT"或"反向修复"具体策略并写入 ADR）；不允许一者成功而另一者失败仍返回 success。
- 同一 `(surface, sectionKind)` 内允许多个 slot 的 `order_index` 重复；公开渲染层（`CurationConfigRepository.listSlotsBySurface` 与 home-discovery resolver）按 `(order_index ASC, sectionKind ASC, targetKey ASC)` 三层稳定排序；admin curation 写入不强制 `order_index` 唯一性，避免运营在重排过程中需要先腾位。

## 9. 约束

- CON-001：仅扩展现有 `community` repository 与新增 `audit_log` 表；不引入新外部数据源 / 队列 / 缓存。
- CON-002：仅纯 TypeScript / Node 22 内置模块；不引入新 runtime npm 依赖。
- CON-003：UI 改动仅限 `/studio/admin/**` 新路由集 + `/studio` 主页一处 admin 入口；不改既有公开页 / 工作台 layout / shell 组件契约。
- CON-004：新 metrics 严格走 `MetricsSnapshot.admin` 命名空间；既有 `http` / `sqlite` / `business` / `recommendations` 不动。
- CON-005：admin 写动作仅经 server action；不开放新 REST 端点。
- CON-006：admin 操作即时生效，不引入二次审批 / 双人复核（V1 不为复杂运营流程做工作流）。

## 10. 假设 / 待澄清

- A-001：本 V1 admin 名单规模 ≤ 10 人；env 解析与判定不需要专门索引。
- A-002：`audit_log` 单表预计 ≤ 10k 条 / 月；不引入分区 / 滚动归档。
- A-003：`moderated` 作品对 owner 创作者**仍可见**于自己的 `/studio/works`（带「已隐藏」标识），但**不**提供"自助恢复"按钮（恢复必须由 admin 执行）。这是合规一致性而非工程取舍；如未来要支持创作者申诉，需要单独 slice。
- A-004：admin 通过 `/login` 用普通账号登录；不引入 admin 专属登录页。

## 11. 影响 / 出口工件

- 新增（src）：
  - `web/src/features/admin/{audit-log,audit-log.test,curation-actions,curation-actions.test,work-moderation-actions,work-moderation-actions.test,test-support,index}.ts`
  - `web/src/app/studio/admin/{page,page.test,curation/{page,page.test},works/{page,page.test},audit/{page,page.test}}.tsx`
- 修改（src）：
  - `web/src/config/env.ts` + `env.test.ts`（新增 `ADMIN_ACCOUNT_EMAILS` 解析）
  - `web/src/features/auth/types.ts` + `access-control.ts` + `access-control.test.ts`（admin policy / guard）
  - `web/src/features/community/types.ts`（`CommunityWorkStatus` 增加 `"moderated"`、`WorkRepository.listAllForAdmin`、`AuditLogRepository`、`CurationConfigRepository.{upsertSlot,removeSlot,reorderSlot}`）
  - `web/src/features/community/contracts.ts` + `contracts.test.ts`（`getPublicWorkRecords` 仍旧仅返回 `published`；contracts 测试补 `moderated` case）
  - `web/src/features/community/sqlite.ts` + `sqlite.test.ts`（schema 增加 `audit_log`；works status check 兼容 `moderated`；curation 写能力；`listAllForAdmin`；audit log mapper）
  - `web/src/features/community/test-support.ts`（in-memory bundle 支持 `audit` repository + curation 写能力）
  - `web/src/features/community/public-read-model.ts` + `public-read-model.test.ts`（屏蔽 moderated；按需）
  - `web/src/features/observability/metrics.ts` + `metrics.test.ts`（`MetricsSnapshot.admin` 加性扩展）
  - `web/src/app/studio/page.tsx` + `page.test.tsx`（admin 用户显示入口卡片）
  - `web/src/features/recommendations/related-works.ts`（候选池过滤 `moderated` — 由 `listPublicWorks` 已过滤兜底，T57 任务回归断言）
- finalize 阶段同步：`task-progress.md`、`RELEASE_NOTES.md`、`docs/ROADMAP.md` §3.2、`README.md`。

## 12. Trace Anchor 索引

| FR | ROADMAP / 增量记录锚点 |
|----|---|
| FR-001 | §3.2「管理员角色策略」；增量 §New |
| FR-002 | §3.2「新建 admin 段」；增量 §New |
| FR-003 | §3.2「精选位维护」；增量 §New + Modified |
| FR-004 | §3.2「内容审核 ... 隐藏 / 警告 / 删除」；增量 §New + Modified |
| FR-005 | §3.2「配套审计日志」；增量 §New |
| FR-006 | §3.2「内容审核」隐含的「已隐藏作品对公开不可见」语义；增量 §Modified |
| FR-007 | §3.2「管理员角色策略」；增量 §Modified |
| FR-008 | §3.2「配套审计日志」；§3.8 V1 metrics 注册表；增量 §New |
