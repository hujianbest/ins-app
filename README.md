# Lens Archive

[English](#english) · [中文](#中文)

---

## 中文

Lens Archive 是一个面向**摄影师 / 模特双主身份**的创作者社区平台。当前主线（`Hybrid Platform Relaunch` 阶段 1 + `Lens Archive Discovery Quality` 增量）已经完成，整体定位收敛为：

> **高匹配发现**：让相关的人继续发现你的作品，而不是追求更大的曝光面。

技术栈：`Next.js 16` · `React 19` · `TypeScript 5` · `Tailwind v4` · `node:sqlite`（内置）· `Vitest 4` · `Playwright`，配合多阶段 `Dockerfile` 与 `/api/health` 健康检查。

### 仓库结构

```
.
├── Dockerfile               # 多阶段生产镜像（standalone 输出 + 健康检查）
├── RELEASE_NOTES.md         # 已发布特性的对外说明
├── task-progress.md         # Harness Flow 工作流当前状态
├── docs/                    # 规格 / 设计 / 任务 / 评审 / 验证 / 复盘记录
│   ├── specs/   designs/   tasks/
│   ├── reviews/ verification/
│   └── insights/  skill_record.md
└── web/                     # Next.js 应用（App Router）
    ├── src/app/             # 公开页 + 工作台 + API + outbound 重定向
    ├── src/features/        # auth / community / discovery / search …
    ├── src/config/env.ts    # 环境变量契约
    ├── e2e/                 # Playwright 端到端用例
    └── playwright.{,docker.}config.ts
```

### 已完成的功能（阶段 1 + Discovery Quality）

#### 1. 运行时与部署基线
- 多阶段 `Dockerfile`，基于 `node:22-bookworm-slim`，输出 Next.js `standalone` 产物，非 root 用户运行，内置 `HEALTHCHECK`。
- 环境变量契约 `web/src/config/env.ts`：`APP_BASE_URL` / `ASSET_BASE_URL` / `DATABASE_PROVIDER`（仅 `sqlite`）/ `SQLITE_DATABASE_PATH` / `SESSION_COOKIE_SECRET` / `SESSION_COOKIE_SECURE` / `HEALTHCHECK_ENABLED`。
- `GET /api/health` 返回运行时摘要（数据库提供方、库路径、可用性）。
- 数据通过 `node:sqlite` 落到 `web/.data/community.sqlite`，repository 边界已抽象，可平滑迁移到托管 SQL。

#### 2. 账号与会话
- 真实邮箱 / 密码注册 + 登录 + 登出，替代旧 demo cookie。
- 共享 `SessionContext`、`AccessControl`、`StudioGuard`、`CreatorCapabilityPolicy`，统一保护 `studio/*` 与 `inbox`。
- 双主身份：`摄影师` / `模特`。

#### 3. 公开浏览主线（高匹配发现）
- 路由：`/`、`/discover`、`/search`、`/photographers/[slug]`、`/models/[slug]`、`/works/[workId]`、`/opportunities`、`/opportunities/[postId]`、`/outbound/[role]/[slug]`。
- 全站统一暗色杂志风壳层 (`features/shell`)：`SiteHeader` / `SiteFooter` / `PageHero` / `SectionHeading` / `EditorialVisual`。
- 首页与发现页围绕「高匹配发现」叙事，展示 `featured` / `latest` 区块与精选配置。
- 创作者公开资料新增 `city` / `shootingFocus` / `discoveryContext` / `externalHandoffUrl` 等可读语境字段。
- 草稿安全：草稿作品对公开路由不可见；精选目标失效时回退而非报错。

#### 4. 创作者工作台
- `/studio` 主页 + `/studio/profile`（资料编辑，含发现语境字段）+ `/studio/works`（草稿 / 发布、回退草稿、保留已发布状态机）+ `/studio/opportunities`（合作诉求草稿与发布）。
- 通过 `features/community` 中的 `profile-editor` / `profile-actions` / `work-editor` / `work-actions` server action 链路，全部 repository-backed。

#### 5. 社交互动
- 关注 / 取消关注创作者（`features/social/follows`），关注后进入「关注中」发现流。
- 作品评论（`features/social/comments` + `comment-actions`），最新优先 + 长度校验。
- 登录态点赞作品、收藏创作者主页（`features/engagement`）。
- 站内联系入口 + 受保护的 `/inbox` 收件箱（线程在阶段 2 演进）。

#### 6. 基础搜索
- `features/search` 提供作品 / 创作者 / 合作诉求的关键词命中与稳定空态。

#### 7. 可信承接与发现事件
- `/outbound/[role]/[slug]` 用于跳转创作者自有外部链接，统一记录事件。
- `POST /api/discovery-events` + `features/discovery`：记录 `work_view` / `profile_view` / `follow` / `contact_start` / `external_handoff_click` 五类最小事件，用于后续判断「是否真的发生了高匹配发现」，但**不**作为推荐算法依赖。

#### 8. 初始引流内容
- `features/showcase/seed-data` + `sample-data.ts` 提供授权来源的种子图片、虚构创作者与作品文案，附带 `seedContentSourceManifest` 标注来源；图片本地化，不再依赖第三方外链。

#### 9. 测试与质量门禁
- Vitest 单元 / 组件级测试覆盖 community repository、profile / work editor、social、search、home-discovery resolver、shell 与首页空态等。
- Playwright 端到端配置（含 docker variant）。
- 每个完成任务（`T1`–`T18`、`T22`–`T45`）均经过 `bug-patterns / test-review / code-review / traceability-review / regression-gate / completion-gate` 链路并留痕于 `docs/reviews` 与 `docs/verification`。

### 阶段 2（明确**未**包含在当前版本）
完整运营 / 审核后台、线程式站内消息、支付 / 订单 / 会员、推荐算法、独立检索服务、原生 App、挑战赛 / 学习内容、复杂内容审核与风控。

### 功能完成度概览

| 模块 | 范围目标 | 当前状态 | 备注 |
| --- | --- | --- | --- |
| Docker / 健康检查 / env 契约 | 阶段 1 | 已完成 | 单实例持久化，托管 SQL/对象存储待选型 |
| 账号 / 会话 | 阶段 1 | 已完成 | 安全 cookie + 服务端校验 |
| 全站壳层 / 暗色杂志风 | 阶段 1 | 已完成 | 主公开页 + studio 全部覆盖 |
| 首页 + 发现页 + 搜索 | 阶段 1 + Discovery Quality | 已完成 | 收口为「高匹配发现」叙事 |
| 创作者主页 / 作品详情 | 阶段 1 + Discovery Quality | 已完成 | 新增发现语境字段与外部 handoff |
| 工作台资料 / 作品 / 诉求 | 阶段 1 | 已完成 | repository-backed，已发布作品保存不会误回退草稿 |
| 关注 / 评论 / 点赞 / 收藏 | 阶段 1 | 已完成 | 评论最新优先 + 校验 |
| 合作线索入口 + 站内联系 / inbox | 阶段 1 | 入口与最小闭环已完成 | 线程演进归阶段 2 |
| Discovery 最小事件记录 | Discovery Quality | 已完成 | 不依赖推荐算法 |
| 规则化「相关创作者」「相关作品」 | 阶段 2 §3.6 V1 | 已完成 | `RelatedCreatorsSection` 挂在创作者主页底部、`RelatedWorksSection` 挂在作品详情页评论区上方；P95 ≤ 30ms |
| 可观测性 / 备份恢复 / 内部 metrics | 阶段 2 §3.8 V1 | 已完成 | 详见 `RELEASE_NOTES.md` 2026-04-19 §3.8 章节 |
| 初始引流内容 | 阶段 1 | 已完成 | 授权来源 + 本地化 |
| 运营后台 / 消息中心 / 支付 / 向量检索 | 阶段 2 | 未开始 | 显式延后 |

总体：**阶段 1 + Discovery Quality 已 finalized**（详见 `docs/verification/finalize-lens-archive-discovery-quality.md` 与 `RELEASE_NOTES.md`），可作为可云端部署的产品基线。

### 本地启动与构建

要求：Node.js 22+（与 Docker 镜像保持一致）。

```bash
cd web
npm ci
npm run dev               # 开发服务器 http://localhost:3000
npm run lint              # ESLint
npm run typecheck         # tsc --noEmit
npm run test              # Vitest（一次性运行）
npm run test:e2e          # Playwright（需安装浏览器）
npm run build             # 生产构建
npm run start             # 生产启动（建议使用容器）
npm run verify            # lint + test + build 一站式
```

容器化：

```bash
docker build -t lens-archive .
docker run --rm -p 3000:3000 \
  -e APP_BASE_URL=http://localhost:3000 \
  -e SESSION_COOKIE_SECRET=change-me \
  -v $PWD/.data:/app/.data \
  lens-archive
```

### 下一步开发计划（阶段 2 路线建议）

详见 [`docs/ROADMAP.md`](./docs/ROADMAP.md)。要点摘录：

1. **生产数据与持久化收口**：选定托管 SQL（PostgreSQL）+ 对象存储（S3/兼容），给 `community` repository 增加 PostgreSQL 实现，把图片资产从仓库内迁出。
2. **运营 / 审核后台 V1**：精选位维护、内容审核、举报处理、账号管理；最小后台从 `studio/admin` 内嵌入口起步。
3. **线程式消息中心**：把当前 `inbox` 的最小闭环升级为多线程、未读、附件与系统通知。
4. **合作线索 → 履约**：在不引入支付的前提下，先补合作意向状态机、双向确认、外部联系方式回执。
5. **支付 / 订单 / 会员**：接入 Stripe（或国内方案），覆盖创作者订阅与一次性下单。
6. **Discovery 智能化**：基于已采集的 `discovery_events`，先做规则化「相关创作者」「相关作品」推荐，再评估是否引入向量检索 / ML 排序。
7. **搜索升级**：从关键词命中升级到带过滤面（城市、方向、合作类型）的搜索，并评估外部检索引擎。
8. **可观测性与运维**：结构化日志、错误上报、基础指标面板、定时备份与回滚演练。
9. **可访问性 / 国际化**：英文界面 + 站点 i18n、键盘 / 屏幕阅读器审计。
10. **原生体验探索**：移动端 PWA → React Native 评估。

---

## English

Lens Archive is a creator-community platform built around the dual primary identities **photographer** and **model**. The current trunk — `Hybrid Platform Relaunch` Phase 1 plus the `Lens Archive Discovery Quality` increment — is finalized and the product proposition is now scoped to:

> **High-fit discovery**: help the right people keep discovering your work, instead of chasing broader exposure.

Stack: `Next.js 16` · `React 19` · `TypeScript 5` · `Tailwind v4` · built-in `node:sqlite` · `Vitest 4` · `Playwright`, with a multi-stage `Dockerfile` and a `/api/health` endpoint.

### Repository layout

```
.
├── Dockerfile               # Multi-stage production image (standalone output + healthcheck)
├── RELEASE_NOTES.md         # Outward-facing change log
├── task-progress.md         # Harness Flow workflow state
├── docs/                    # Specs / designs / tasks / reviews / verification / insights
└── web/                     # Next.js app (App Router)
    ├── src/app/             # Public pages + studio + API routes + outbound redirect
    ├── src/features/        # auth / community / discovery / search / …
    ├── src/config/env.ts    # Environment-variable contract
    ├── e2e/                 # Playwright end-to-end suite
    └── playwright.{,docker.}config.ts
```

### Shipped capabilities (Phase 1 + Discovery Quality)

#### 1. Runtime & deployment baseline
- Multi-stage `Dockerfile` on `node:22-bookworm-slim`, emitting Next.js `standalone` output, running as a non-root user, with a built-in `HEALTHCHECK`.
- Environment contract in `web/src/config/env.ts`: `APP_BASE_URL`, `ASSET_BASE_URL`, `DATABASE_PROVIDER` (only `sqlite` today), `SQLITE_DATABASE_PATH`, `SESSION_COOKIE_SECRET`, `SESSION_COOKIE_SECURE`, `HEALTHCHECK_ENABLED`.
- `GET /api/health` returns a runtime summary (database provider, path, readiness).
- Data is persisted through `node:sqlite` into `web/.data/community.sqlite`. Repository boundaries are abstracted so a managed SQL backend can be swapped in.

#### 2. Accounts & sessions
- Real email / password registration, sign-in and sign-out replace the previous demo cookie role hack.
- Shared `SessionContext`, `AccessControl`, `StudioGuard`, and `CreatorCapabilityPolicy` protect every `studio/*` and `inbox` route.
- Two primary identities: `photographer` and `model`.

#### 3. Public browsing trunk (high-fit discovery)
- Routes: `/`, `/discover`, `/search`, `/photographers/[slug]`, `/models/[slug]`, `/works/[workId]`, `/opportunities`, `/opportunities/[postId]`, `/outbound/[role]/[slug]`.
- A unified editorial-dark shell in `features/shell`: `SiteHeader`, `SiteFooter`, `PageHero`, `SectionHeading`, `EditorialVisual`.
- Home and discover pages tell a single high-fit-discovery story across `featured` / `latest` curated sections.
- Public creator profiles now expose `city`, `shootingFocus`, `discoveryContext`, and `externalHandoffUrl` so visitors can judge relevance before contacting.
- Draft safety: drafts never leak to public routes, and curated targets fall back gracefully when missing.

#### 4. Creator studio
- `/studio` overview, `/studio/profile` (profile editor including the new discovery-context fields), `/studio/works` (draft / publish, intentional revert-to-draft, no accidental rollback when re-saving published works), `/studio/opportunities` (collab requests draft + publish).
- All flows go through the `features/community` server actions and editors (`profile-editor`, `profile-actions`, `work-editor`, `work-actions`), backed by repositories.

#### 5. Social interactions
- Follow / unfollow creators (`features/social/follows`), feeding the "following" lane on discover.
- Work comments (`features/social/comments` + `comment-actions`) with newest-first ordering and length validation.
- Authenticated likes on works and favorites on profiles via `features/engagement`.
- In-site contact actions plus a protected `/inbox` (rich threading is deliberately Phase 2).

#### 6. Basic search
- `features/search` provides keyword-based hits across works, creators, and opportunities, with stable empty states.

#### 7. Trustworthy handoff & discovery events
- `/outbound/[role]/[slug]` redirects visitors to a creator's external link while logging a uniform handoff event.
- `POST /api/discovery-events` plus `features/discovery` capture the minimal event set — `work_view`, `profile_view`, `follow`, `contact_start`, `external_handoff_click` — to evaluate whether high-fit discovery actually happened. Crucially, **no recommendation algorithm depends on these events yet**.

#### 8. Seeded launch content
- `features/showcase/seed-data` and `sample-data.ts` ship licensed seed imagery, fictional creators, and copy, with provenance documented in `seedContentSourceManifest`. All assets are local; no third-party hot-linking remains.

#### 9. Tests & quality gates
- Vitest unit / component tests cover the community repositories, profile / work editors, social flows, search, the home-discovery resolver, the shell, and the homepage empty state.
- Playwright e2e config (with a docker variant).
- Every completed task (`T1`–`T18`, `T22`–`T45`) passed the `bug-patterns / test-review / code-review / traceability-review / regression-gate / completion-gate` chain, with evidence under `docs/reviews/` and `docs/verification/`.

### Phase 2 (explicitly **not** in this release)
Full ops / moderation back office, threaded in-app messaging, payments / orders / memberships, recommender algorithms, dedicated search service, native apps, challenges / learning content, and heavy moderation / risk tooling.

### Capability completion overview

| Area | Scope target | Status | Notes |
| --- | --- | --- | --- |
| Docker / healthcheck / env contract | Phase 1 | Done | Single-instance persistence; managed SQL/object storage TBD |
| Accounts / sessions | Phase 1 | Done | Secure cookie + server-side validation |
| Site shell / editorial-dark visual system | Phase 1 | Done | All public pages + studio |
| Home + discover + search | Phase 1 + Discovery Quality | Done | Reframed around high-fit discovery |
| Creator profile / work detail | Phase 1 + Discovery Quality | Done | New discovery-context fields + external handoff |
| Studio profile / works / opportunities | Phase 1 | Done | Repository-backed; published works no longer accidentally revert to draft |
| Follow / comment / like / favorite | Phase 1 | Done | Newest-first comments with validation |
| Collab lead entry + in-site contact / inbox | Phase 1 | Minimal loop done | Rich threading deferred to Phase 2 |
| Discovery minimal event log | Discovery Quality | Done | No recommender dependency |
| Rule-based related creators / related works | Phase 2 §3.6 V1 | Done | `RelatedCreatorsSection` on profile pages, `RelatedWorksSection` above comments on work detail pages; P95 ≤ 30ms |
| Observability / backup-restore / internal metrics | Phase 2 §3.8 V1 | Done | See `RELEASE_NOTES.md` 2026-04-19 §3.8 |
| Seeded launch content | Phase 1 | Done | Licensed sources + local assets |
| Ops back office / messaging / payments / vector retrieval | Phase 2 | Not started | Explicitly deferred |

Overall: **Phase 1 + Discovery Quality is finalized** (see `docs/verification/finalize-lens-archive-discovery-quality.md` and `RELEASE_NOTES.md`); the codebase is a credible cloud-deployable product baseline.

### Local development & build

Requires Node.js 22+ (matching the Docker image).

```bash
cd web
npm ci
npm run dev               # Dev server at http://localhost:3000
npm run lint              # ESLint
npm run typecheck         # tsc --noEmit
npm run test              # Vitest (single run)
npm run test:e2e          # Playwright (requires browser install)
npm run build             # Production build
npm run start             # Production start (prefer the container)
npm run verify            # lint + test + build all-in-one
```

Container build:

```bash
docker build -t lens-archive .
docker run --rm -p 3000:3000 \
  -e APP_BASE_URL=http://localhost:3000 \
  -e SESSION_COOKIE_SECRET=change-me \
  -v $PWD/.data:/app/.data \
  lens-archive
```

### Next-step development plan (Phase 2 direction)

Detailed in [`docs/ROADMAP.md`](./docs/ROADMAP.md). Highlights:

1. **Production data & persistence**: pick a managed SQL (PostgreSQL) plus object storage, add a Postgres implementation behind the existing `community` repositories, and move image assets out of the repo.
2. **Ops / moderation back office V1**: curated-slot management, content moderation, abuse reports, account admin — entered from a `studio/admin` shell.
3. **Threaded messaging**: upgrade the minimal `/inbox` loop into multi-thread, unread state, attachments and system notifications.
4. **Collab leads → fulfillment**: without payments yet, add a state machine for collab intents, two-sided confirmations, and external contact receipts.
5. **Payments / orders / memberships**: integrate Stripe (or a regional equivalent) for creator subscriptions and one-off bookings.
6. **Discovery intelligence**: starting from the captured `discovery_events`, ship rule-based "related creators" and "related works", then evaluate vector retrieval / ML ranking.
7. **Search upgrade**: from keyword hits to faceted search (city, focus, collab type) and evaluate an external search engine.
8. **Observability & ops**: structured logs, error reporting, baseline metrics, scheduled backup + restore drills.
9. **Accessibility & i18n**: an English UI plus full site i18n, keyboard / screen-reader audits.
10. **Native experience exploration**: mobile PWA, then a React Native feasibility study.
