# Release Notes — Phase 2 Ops Back Office V1

- Date: `2026-04-19`
- Increment: Phase 2 §3.2 — Ops Back Office V1（运营 / 审核后台 V1）
- Source ROADMAP: `docs/ROADMAP.md` §3.2

## 用户可见变化

- env `ADMIN_ACCOUNT_EMAILS` 中列出的邮箱账号登录后，可在 `/studio` 主页看到第五张「进入运营后台」入口卡，进入 `/studio/admin` 总览，再进入：
  - `/studio/admin/curation`：维护首页 + 发现页精选位（增 / 删 / 重排）。
  - `/studio/admin/works`：所有作品列表 + 隐藏 / 恢复按钮。
  - `/studio/admin/audit`：最近 100 条管理员操作的审计记录。
- 公开访客：违规作品被运营隐藏后立即从 `/works/[id]` / 创作者主页 / 推荐 / 搜索 / 首页发现等所有公开 surface 消失（与草稿同形屏蔽）。
- 创作者（owner）：自己的作品如被运营隐藏，在 `/studio/works` 仍能看到（标签「已隐藏（运营处置）」+ 申诉提示），但不能自助 publish / save_draft / revert_to_draft；如强行提交，页面会显示「该作品已被运营隐藏；如需恢复，请联系管理员。」alert。
- 非 admin 用户：DOM 中完全不出现 admin 后台入口卡（即使是已登录账号）；任何对 `/studio/admin/**` 的直接访问都被 server-side `redirect` 拦截。
- admin 名单为空（默认）：任何账号都不是 admin，admin 后台全链路 fail-closed。

## 内部新增 / 改动

- 新 feature 模块 `web/src/features/admin/`（admin-policy / runtime / curation-actions / work-moderation-actions / audit-log / metrics / test-support / index）。
- 新 SQLite 表 `audit_log` + 索引 `idx_audit_log_created_at_desc` + repository `bundle.audit.{record,listLatest}`。
- 新 `bundle.works.listAllForAdmin()` 读路径（仅 admin SSR / admin server action 消费）。
- 新 `bundle.curation.{upsertSlot,removeSlot,reorderSlot}` 写路径。
- 新 `SqliteCommunityRepositoryBundle.withTransaction(fn)`（显式 BEGIN IMMEDIATE / COMMIT / ROLLBACK）；in-memory bundle noop 等价。
- 类型扩展：`CommunityWorkStatus` 联合追加 `"moderated"`；`AuthenticatedSessionContext.email`；`AccessControl.adminCapability` + `adminGuard`。
- env 字段 `ADMIN_ACCOUNT_EMAILS`（CSV，默认空，非法降级 + warning）。
- `MetricsSnapshot` 加性扩展 `admin` 顶层命名空间（6 counter，零状态全 0）。
- `wrapServerAction("admin/...", fn)` × 5（curation × 3 + work moderation × 2）+ 5 form-action wrappers；admin server action 全部经 `runAdminAction` 内层包装（admin 校验 + sqlite 事务 + 双 log）。
- 4 新 SSR 路由 `/studio/admin/{,curation,works,audit}` + 1 处 `/studio` 主页条件渲染入口卡。
- owner-side `/studio/works` + `work-editor.ts > resolveNextVisibility` fail-closed for moderated。

## 性能 / 质量基线

- NFR-001 micro-bench：`listAllForAdmin` (500 works) P95 = 0.03ms / `audit.listLatest(100)` (200 pool) P95 = 0.02ms；80ms 预算下余量 ≈ 2700× / 4000×。
- 业务零回归：全套 vitest baseline 不漂移；新增 10 个 passed test files / 70 个 passed tests。
- 不引入运行时 npm 依赖；`package.json` / lockfile 未变。

## 显式延后 / 仍未做

- 用户举报队列与处置工作流
- 账号管理（封禁 / 解封 / 角色变更）
- Profile / opportunity / 评论维度的违规处置
- 二次审批 / 双人复核工作流
- audit log 归档 / 加密 / 滚动；admin 操作 rate limit / 防重放
- 外部 IAM / SSO 集成

## 关键工件索引

- 增量记录: `docs/reviews/increment-phase2-ops-backoffice-v1.md`
- SRS / Design / Tasks: 见 `docs/{specs,designs,tasks}/2026-04-19-ops-backoffice-v1-*.md`
- 7 任务全套评审 / 验证证据: `docs/{reviews,verification}/*-T57..T63.md`
- Increment regression / completion / finalize: `docs/verification/{regression-gate,completion-gate,finalize}-phase2-ops-backoffice-v1.md`
