# Code Review — T57

- Task: T57
- Date: `2026-04-19`

## 检查点

| 维度 | 评估 |
|---|---|
| 命名 / 文件结构 | ✅ 与 design §17 出口工件一致（`features/admin/metrics.ts` 新增；其他文件加性扩展现有模块）|
| 加性扩展 (ADR-3 / ADR-4) | ✅ `MetricsSnapshot` 仅新增 `admin` 字段，既有 `http`/`sqlite`/`business`/`recommendations` 不变；`AuthenticatedSessionContext.email` 加性，guest 分支不变 |
| 单一职责 | ✅ 每个 helper / repository method 聚焦单一 SQL / 转换 |
| 错误边界 | ✅ env 解析非法 piece 降级 + warning（不抛错）；`withTransaction` ROLLBACK 包裹避免二次失败掩盖原始错误 |
| 类型安全 | ✅ `CurationSlotKey` / `AuditLogCreateInput` 类型清晰；`SqliteCommunityRepositoryBundle.withTransaction` optional via type intersection |
| 注释质量 | ✅ 仅在不变量 / 关键设计选择处加 "为什么" 注释（admin email 不进 logger / fail-closed 默认 / sqlite tx 用于 ADR-2）|
| 与 SRS / Design 锚点 | ✅ FR-001 / FR-005 / FR-006 / FR-007 / FR-008 / ADR-2 / ADR-3 / ADR-4 / ADR-5 / I-2 / I-5 / I-6 / I-7 / I-9 / I-10 / I-11 / I-12 / I-13 在源码或测试可回读 |
| 性能 | ✅ schema 索引 `idx_audit_log_created_at_desc` 与 list query 匹配；listAllForAdmin 单次 SELECT；不引入 N+1 |
| 兼容性 | ✅ 全部既有 vitest 行为不漂移；既有 server action / route handler / 推荐模块零修改 |
| 安全 | ✅ admin 名单 fail-closed；`audit_log.actor_email` 仅入 sqlite，不进 logger 受控键集合 |

## 发现项

无 important / blocking。

Minor（不阻塞，留作下游任务自然吸收）：
- `SqliteCommunityRepositoryBundle.withTransaction` 在类型上是必填字段；in-memory bundle 没有该字段。这意味着 T58 `runAdminAction` 必须使用 optional chaining `bundle.withTransaction?.(fn) ?? fn()` 进行 fallback；T58 实现 + 单测覆盖（已在 task plan §T58 acceptance 中明示）。
- `audit_log` 的 schema 没有显式 `CHECK (action IN (...))` 约束；类型层由 TypeScript 联合保证；如需要数据库层硬约束，可在 §3.2 V2 加 `CHECK` 或迁移。

## 结论

通过。
