# Lens Archive Roadmap / 路线图

> Bilingual (中文 / English) follow-up plan after `Hybrid Platform Relaunch` Phase 1 + `Lens Archive Discovery Quality` were finalized on `2026-04-10`.

## 1. 现状基线 / Current baseline

- 已完成范围：见根目录 [`README.md`](../README.md) 的「功能完成度概览」 / "Capability completion overview" 章节。
- 主要工件 / Source-of-truth artifacts：
  - 规格 / Spec：`docs/specs/2026-04-09-hybrid-platform-relaunch-srs.md`、`docs/specs/2026-04-10-lens-archive-discovery-quality-srs.md`
  - 设计 / Design：`docs/designs/2026-04-09-hybrid-platform-relaunch-design.md`、`docs/designs/2026-04-10-lens-archive-discovery-quality-design.md`
  - 任务 / Tasks：`docs/tasks/2026-04-10-lens-archive-discovery-quality-tasks.md`
  - 收口 / Finalize：`docs/verification/finalize-lens-archive-discovery-quality.md`
  - Release：`RELEASE_NOTES.md`
- 显式延后的能力 / Explicitly deferred：完整运营后台、线程式消息、支付 / 订单 / 会员、推荐算法、独立检索服务、原生 App、复杂内容审核与风控。

## 2. 指导原则 / Guiding principles

| 原则 / Principle | 说明 / Notes |
| --- | --- |
| **不复写已收口的范围 / Do not re-litigate finalized scope** | 阶段 1 + Discovery Quality 的边界已批准。新增内容必须以新的 increment / spec 启动。Increments must enter through `hf-increment` → `hf-specify`. |
| **保持 repository 边界 / Preserve repository boundaries** | 任何持久化升级都需先扩展 `features/community` 等 repository，再切换实现，避免页面层耦合具体存储。 |
| **不引入伪装能力 / No fake capabilities** | 例如未做支付时，不在合作链路中展示伪造的「下单成功」状态（沿用 `NFR-002`）。 |
| **可信承接优先 / Trustworthy handoff first** | 任何新增交互都必须给出明确的「下一步」，避免封闭循环。 |
| **质量门禁不变 / Keep the quality chain** | 新任务继续走 `bug-patterns / test-review / code-review / traceability-review / regression-gate / completion-gate`。 |

## 3. 阶段 2 主题 / Phase 2 themes

### 3.1 生产数据与持久化收口 / Production data & persistence

**目标 / Goal**：从单实例 SQLite 演进到托管 SQL + 对象存储，使站点能横向扩展且具备备份 / 恢复能力。

**关键工作 / Key work**

- 给 `CreatorProfileRepository` / `WorkRepository` / `FollowRepository` / `CommentRepository` / `CurationConfigRepository` / `DiscoveryEventRepository` 增加 PostgreSQL 实现。
- 在 `web/src/config/env.ts` 中将 `DATABASE_PROVIDER` 扩展为 `sqlite | postgres`，并补 schema 迁移工具（推荐 `node-pg-migrate` 或 `drizzle-kit`，需评估）。
- 接入对象存储（S3 兼容），把 `web/public` 中的种子图片和未来用户上传迁出仓库。
- 增加备份 / 恢复脚本与文档，并在 CI / 周期任务中跑恢复演练。

**验收 / Acceptance**：在 staging 环境跑双写或迁移演练，应用层切换 provider 不需改业务代码；图片上传走对象存储统一签名链路。

### 3.2 运营 / 审核后台 V1 / Ops & moderation back office V1

**目标 / Goal**：把当前散落在 `studio` 内的「精选」「内容质量」管理收口为最小后台。

**关键工作 / Key work**

- 新建 `app/(admin)` 段（或 `studio/admin`）+ 管理员角色策略。
- 精选位维护界面对接 `CurationConfigRepository`。
- 内容审核：作品 / 资料的隐藏 / 警告 / 删除工具，配套审计日志。
- 举报处理：用户提交的举报队列与处置动作。
- 账号管理：基础的封禁 / 解封 / 角色变更。

**验收 / Acceptance**：管理员可以在不直接操作数据库的情况下完成精选编排、违规处置和账号干预。

**V1 已交付 / V1 delivered（2026-04-19）**

- ✅ 管理员能力：env `ADMIN_ACCOUNT_EMAILS` 白名单 + 纯函数 `createAdminCapabilityPolicy` / `createAdminGuard` + `getRequestAccessControl` 自动注入；名单为空 ⇒ 全链路 fail-closed。
- ✅ Admin shell：`/studio/admin` dashboard + `/studio/admin/curation` + `/studio/admin/works` + `/studio/admin/audit` 四个 SSR 页面；`metadata.robots = noindex,nofollow`；`/studio` 主页对 admin 显示「进入运营后台」入口卡，非 admin DOM 中不暴露。
- ✅ Curation：admin 可对 `home` / `discover` 两个 surface 进行 slot 增 / 删 / 重排（`upsertCuratedSlot` / `removeCuratedSlot` / `reorderCuratedSlot` server actions）；目标对象不存在仍允许写库 + audit `note=target_not_found_at_write`。
- ✅ Work moderation：`CommunityWorkStatus` 联合追加 `"moderated"`；admin `hideWork` (published → moderated) / `restoreWork` (moderated → published) server actions；公开 read model（5 surface：`getPublicWorkPageModel` / `listPublicWorks` / showcase / 推荐 `getRelatedWorks` / 搜索）一律屏蔽 moderated；owner-side `/studio/works` fail-closed（`resolveNextVisibility` throw `moderated_work_owner_locked`，3 种 intent 全拒绝），只有 admin restore 是恢复路径。
- ✅ Audit log：新 SQLite 表 `audit_log` + `idx_audit_log_created_at_desc` 索引；admin server action 强制 `bundle.audit.record({...})`；写 + audit 同 sqlite 事务（`SqliteCommunityRepositoryBundle.withTransaction` 显式 BEGIN/COMMIT/ROLLBACK）；`/studio/admin/audit` 渲染最新 100 条（按 `created_at desc, id desc`）。
- ✅ Metrics：`MetricsSnapshot.admin` 顶层加性扩展 6 counter（`curation.{added,removed,reordered}` / `work_moderation.{hidden,restored}` / `audit.appended`）；既有 `http` / `sqlite` / `business` / `recommendations` 命名空间不变。
- ✅ NFR-001 性能：`listAllForAdmin` (500 works) P95 = 0.03ms；`audit.listLatest(100)` (200 pool) P95 = 0.02ms；远低于 80ms 预算（≈2700× / 4000× 余量）。

**仍未做 / Still deferred to later slices**

- 用户举报队列与处置工作流
- 账号管理（封禁 / 解封 / 角色变更）
- Profile / opportunity / 评论维度的违规处置
- 二次审批 / 双人复核工作流
- audit log 归档 / 加密 / 滚动；admin 操作 rate limit / 防重放
- 外部 IAM / SSO 集成

### 3.3 线程式消息中心 / Threaded messaging

**目标 / Goal**：把 `/inbox` 的最小闭环升级为多线程、未读、附件与系统通知。

**关键工作 / Key work**

- 新增 `Thread` / `Message` / `Participant` schema，迁移现有联系动作生成的会话。
- 实时性策略：先做轮询 + 服务器渲染，下一阶段再评估 SSE/WebSocket。
- 富文本与附件（图片）支持，复用对象存储。
- 系统通知（关注、评论 @、合作回执）入站统一展示。

**验收 / Acceptance**：用户可以在多个独立会话中持续沟通，未读状态可信，系统通知不会被业务消息淹没。

### 3.4 合作线索到履约 / Collab leads → fulfillment（无支付）

**目标 / Goal**：在不引入支付的前提下，让合作线索具备「双向确认 + 状态推进」能力。

**关键工作 / Key work**

- 合作意向状态机：`新建 → 待确认 → 已确认 → 进行中 → 完成 / 取消`。
- 双方协作字段：拍摄时间、地点、可交付物清单、双方联系人。
- 站外联系方式回执（仅在双方确认后展示），与 `outbound` 事件区分记录。

**验收 / Acceptance**：合作线索可以在站内推进到「已确认」并形成留痕，不依赖外部工具协调基础信息。

### 3.5 支付 / 订单 / 会员 / Payments, orders, memberships

**目标 / Goal**：引入合规支付能力，覆盖创作者订阅与一次性下单。

**关键工作 / Key work**

- 选型：海外 Stripe，国内待评估；统一抽象 `PaymentGateway`。
- 创作者付费会员（增强主页 / 多链接 / 高级数据）。
- 一次性合作下单（约拍 / 授权），与 §3.4 的状态机串接。
- 财务账单与发票记录，符合最小合规要求。

**验收 / Acceptance**：用户可在站内完成订阅和单次合作下单，财务记录完整，对账可导出。

### 3.6 Discovery 智能化 / Discovery intelligence

**目标 / Goal**：在已采集的 `discovery_events` 上，先做规则化推荐，再评估 ML 能力。

**关键工作 / Key work**

- 离线分析作业：聚合「同城 / 同方向 / 同主题」的高匹配候选。
- 「相关创作者」「相关作品」模块灰度上线，支持 A/B 对比基线。
- 引入轻量向量检索（pgvector 或托管向量库）评估稠密相似度，但**不**作为主排序依赖，直到效果可证。
- Discovery 事件扩展（dwell time、scroll depth）需在隐私评估后再补。

**验收 / Acceptance**：相关推荐模块在不损害「高匹配」叙事的前提下，可量化提升下游承接动作（关注 / 联系 / 外链跳转）。

**V1 已交付 / V1 delivered（2026-04-19）**

- ✅ 规则化「相关创作者」：创作者公开主页底部新增 `RelatedCreatorsSection`，最多 4 张卡片，按 `weight(city)=0.6 / weight(shootingFocus)=0.4` 评分（满足 SRS §8.3 不变量 `weight(city) >= weight(shootingFocus)`）+ tie-breaker `updatedAt desc → targetKey asc`。
- ✅ 规则化「相关作品」：作品详情页评论区上方新增 `RelatedWorksSection`，最多 4 张卡片，按 `weight(sameOwner)=0.55 / weight(ownerCity)=0.3 / weight(category)=0.15` 评分（满足 SRS §8.3 不变量 `sameOwner > ownerCity >= category`）。
- ✅ Feature flag `RECOMMENDATIONS_RELATED_ENABLED`（默认 `true`，非法值降级 + warning），关闭时 SSR 层 DOM 无 panel、无 beacon、不计 metrics。
- ✅ 新事件类型 `related_card_view`（`DiscoveryEventType` 扩展 + view-beacon 类型放宽 + `/api/discovery-events` route handler 类型放宽 + 4 surface 端到端用例）。
- ✅ Metrics 加性扩展：`MetricsSnapshot.recommendations.{related_creators,related_works}.{cards_rendered,empty}` 共 4 个 counter，纯加性，不破坏既有 `http` / `sqlite` / `business` 命名空间消费者。
- ✅ NFR-001 性能：`getRelatedCreators` P95 = 0.05ms（100 candidates），`getRelatedWorks` P95 = 0.04ms（200 works + 50 owner profiles），均远低于 30ms 预算。
- ✅ FR-008 #3 单次 repository 读 spy 断言；soft-fail 安全降级（repository 异常 → warn log + counter empty + 稳定空态文案）。

**仍未做 / Still deferred to later slices**

- 向量检索 / pgvector / ML 排序（与 §3.1 PostgreSQL + 数据上量评估一起做）
- A/B 框架与流量分桶（先采集 `related_card_view` 事件作为基线，下一 slice 评估）
- 基于用户行为的个性化推荐（`discovery_events` 个性化通路）
- 首页 / 发现页 / 搜索页注入 Related 模块（首期仅创作者主页 + 作品详情页两处）
- 跨角色推荐（摄影师推模特 / 反之）
- `dwell time` / `scroll depth` 事件扩展（隐私评估后再补）
- 「为什么推荐」解释面（NFR-002 + SRS A-003 显式不展示 score / breakdown）

### 3.7 搜索升级 / Search upgrade

**目标 / Goal**：从关键词命中升级到带过滤面的搜索，并评估独立检索服务。

**关键工作 / Key work**

- 过滤面：城市、拍摄方向、合作类型、是否在线、是否带外部链接。
- 排序：默认按相关性 + 可切换最新；与 §3.6 的相似度复用。
- 评估 Meilisearch / Typesense / OpenSearch 与 PostgreSQL FTS 的取舍。

**验收 / Acceptance**：用户可以用「城市 + 方向」高效缩小结果集，搜索性能在 100ms 量级（P95）。

### 3.8 可观测性与运维 / Observability & ops

**目标 / Goal**：让生产环境可调试、可恢复、可演练。

**关键工作 / Key work**

- 结构化日志：以 trace id 串联请求；标准化错误对象。
- 错误上报：接入 Sentry 或同类。
- 指标：HTTP / DB / 队列基础指标 + 业务指标（注册、发布、关注、联系）。
- 备份与恢复演练：定期自动化执行并产出报告。

**验收 / Acceptance**：线上事故可以在 30 分钟内定位到代码位置；恢复演练有最近 30 天内的成功记录。

**V1 已交付 / V1 delivered（2026-04-19）**

- ✅ 结构化日志 + trace id（`x-trace-id` header + AsyncLocalStorage + 受控键集合 + 8 KiB 截断；详见 `docs/specs/2026-04-19-observability-ops-v1-srs.md` FR-001/FR-002）
- ✅ 统一错误对象（`AppError` + `normalizeError` + `appErrorToHttpBody`，I-2 不泄漏栈）
- ✅ 错误上报抽象（`noop` 默认；`console`；`sentry` 占位 + 安全降级）
- ✅ 指标：HTTP / SQLite / 业务命名空间 + 内部 `/api/metrics`（disabled→404 / unauth→401 / ok→200）
- ✅ 备份 / 恢复 CLI（`node:sqlite` 模块级 `backup` 主路径 + WAL checkpoint 兜底；原子 rename restore）
- ✅ `/api/health` 字段扩展（observability + backup 命名空间，向后兼容）
- ✅ NFR-001 性能：`/api/health` P95 = 3.099ms（含全部观测开销）远低于 5ms 预算

**仍未做 / Still deferred to later slices**

- 接入真实 Sentry SDK 与 dashboards / alerts
- 远端日志归档（Loki / OpenSearch / SLS）
- 自动化 cron 调度备份脚本（V1 仅提供脚本本身）
- 运营审计日志（与 §3.2 运营后台一起做）

### 3.9 可访问性与国际化 / Accessibility & i18n

**目标 / Goal**：让站点可被英文用户使用，并满足基本可访问性。

**关键工作 / Key work**

- 抽离文案到 i18n 资源（建议 ICU 格式），先增加英文 locale。
- 路由级 locale 切换，SSR 友好。
- a11y：键盘焦点链路、ARIA 名称、对比度检查、屏幕阅读器抽查。

**验收 / Acceptance**：所有主公开页和工作台关键流程在英文 locale 下可用，且通过 axe-core 自动检查无严重违规。

### 3.10 原生体验探索 / Native experience exploration

**目标 / Goal**：评估移动端体验上限。

**关键工作 / Key work**

- 当前 Web 项目升级为 PWA：可安装、离线壳层、通知权限。
- 对比 React Native（Expo） 实现成本与维护成本。
- 输出可执行的 go / no-go 决策与原型 demo。

**验收 / Acceptance**：产出移动端策略文档与 PWA 可安装版本。

## 4. 优先级建议 / Priority suggestion

技术依赖意义上的推进顺序（不带时间估计）：

1. §3.1 生产数据与持久化 → §3.8 可观测性与运维（**任何上量都先做这两件**；§3.8 V1 已交付，§3.1 待启动）。
2. §3.2 运营后台 V1 → §3.3 线程式消息中心（§3.2 V1 已交付）。
3. §3.4 合作线索到履约 → §3.5 支付 / 订单 / 会员（履约语义先于付费语义）。
4. §3.6 Discovery 智能化 → §3.7 搜索升级（共享相似度与事件管道；§3.6 V1 已交付）。
5. §3.9 可访问性与国际化（贯穿，与每个新模块同步建设）。
6. §3.10 原生体验探索（评估为主，不阻塞主线）。

## 5. 入流方式 / How to start each theme

- 每个主题进入时，先用 `hf-workflow-router` 判断当前阶段，再走 `hf-increment` → `hf-specify` → `hf-design` → `hf-tasks` → `hf-test-driven-dev`，并保留 review / gate 链路。
- 涉及 UI 的主题（§3.2、§3.3、§3.7、§3.9、§3.10）需经过 `hf-ui-design` / `hf-ui-review`。
- 跨数据迁移的主题（§3.1）需要在设计阶段产出迁移演练记录，并在 regression gate 阶段补 staging 演练证据。

## 6. 风险与开放问题 / Risks & open questions

- 托管 SQL / 对象存储 / 邮件 / 支付 / 错误上报 / 检索引擎的服务商选型未定。
- 阶段 2 的运营人员规模与权限模型尚未给出。
- 国内 / 海外双区域是否同步上线尚未确定，会显著影响 §3.5 与 §3.10 的选型。

> 以上路线随产品判断滚动更新；任何调整请同步更新 `task-progress.md` 与本文件。
