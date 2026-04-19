# Test Design — T57 Cross-Cutting Skeleton (Phase 2 §3.2)

- Date: `2026-04-19`
- Spec: `docs/specs/2026-04-19-ops-backoffice-v1-srs.md`
- Design: `docs/designs/2026-04-19-ops-backoffice-v1-design.md`
- Tasks: `docs/tasks/2026-04-19-ops-backoffice-v1-tasks.md` § T57

## 测试单元

| 测试文件 | 覆盖目标 |
|---|---|
| `web/src/config/env.test.ts`（扩展） | `readAdminAccountsConfig` 默认 / CSV / 大小写 / 非法降级 + warning |
| `web/src/features/auth/auth-store.test.ts`（扩展） | `AuthSession.email` 字段；`resolveAuthSession` JOIN 出 email；既有 register/authenticate/createSession 行为不变 |
| `web/src/features/community/sqlite.test.ts`（扩展） | `audit_log` schema + 索引；`bundle.audit.record/listLatest`；`bundle.curation.upsertSlot/removeSlot/reorderSlot`；`bundle.works.listAllForAdmin` 含 moderated；`bundle.works.listPublicWorks` 不含 moderated；`SqliteCommunityRepositoryBundle.withTransaction` 成功 commit / 异常 rollback |
| `web/src/features/community/contracts.test.ts`（扩展） | `getPublicWorkRecords` 对 `moderated` 同形屏蔽（与 `draft` 一致） |
| `web/src/features/observability/metrics.test.ts`（扩展） | `MetricsSnapshot.admin` 6 counter 零状态全 0；增量后正确写入；既有 http/sqlite/business/recommendations 字段不被影响 |
| `web/src/features/admin/metrics.test.ts`（新增） | 6 个 helper（`incrementCurationAdded` 等）路由到正确 counter key；I-6 单点定义 |

## fail-first 主行为

1. **env**：缺省 ⇒ 名单为空 Set；CSV "A@x.com,b@x.com,A@X.com" ⇒ `["a@x.com","b@x.com"]`；非法 piece "@bad" ⇒ 丢弃 + warning slug `admin-account-email-invalid`。
2. **AuthSession.email**：register account → resolveSession → 拿到 email（lowercase）。
3. **AuthSession 既有行为**：authenticate 失败 / createSession 流程不漂移。
4. **audit_log schema**：建表后可 INSERT + SELECT；`idx_audit_log_created_at_desc` 索引存在；listLatest(N) 返回 ≤ N 条按 `created_at desc, id desc`。
5. **bundle.curation.upsertSlot**：新 slot → INSERT；同主键 → UPDATE；返回结果与 row 一致。
6. **bundle.curation.removeSlot**：DELETE；多次 remove 不报错（idempotent）。
7. **bundle.curation.reorderSlot**：UPDATE 现有 → 返回 row；不存在 → 返回 null。
8. **bundle.works.listAllForAdmin**：返回所有 status 含 moderated；按 `updated_at DESC NULLS LAST, id ASC`。
9. **bundle.works.listPublicWorks**：仅返回 published；moderated / draft 被过滤。
10. **withTransaction 成功**：fn 返回 → COMMIT；中间所有写动作生效。
11. **withTransaction 异常**：fn throw → ROLLBACK；事务内的写动作不生效。
12. **getPublicWorkRecords**：moderated 与 draft 同形屏蔽；published 通过。
13. **MetricsSnapshot.admin**：零状态 `{ curation:{added:0,removed:0,reordered:0}, work_moderation:{hidden:0,restored:0}, audit:{appended:0} }`；`incrementCounter("admin.curation.added", _, 2)` 后 `admin.curation.added === 2`；既有字段不被影响。
14. **admin metrics helpers**：`incrementCurationAdded(registry, 2)` ⇒ `admin.curation.added === 2`；`incrementAuditAppended(registry)` ⇒ `admin.audit.appended === 1`。
15. **in-memory bundle.audit**：record + listLatest 反映新条目；listLatest 排序按 `created_at desc, id desc`。
16. **in-memory bundle.curation 写能力**：upsert + remove + reorder 在 in-memory 上工作。

## 关键边界

- env 名单 trim + lower + dedup
- audit_log.note 可为 null
- in-memory `withTransaction(fn)` 是 noop（直接 await fn）
- 既有 `MetricsSnapshot.recommendations` 字段不被打穿

## 退出标准

- 上述测试文件 vitest 子集全绿
- `npm run typecheck/lint/build` baseline 不漂移
