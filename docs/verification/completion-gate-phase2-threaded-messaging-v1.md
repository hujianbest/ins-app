# Completion Gate — Phase 2 §3.3 Threaded Messaging V1

- Date: `2026-04-19`
- Verdict: completed

## 已交付

T64 ~ T69 全部完成，每任务已经过 `bug-patterns / test-review / code-review / traceability-review / regression / completion` 评审 / 验证链。

| Task | Headline |
|---|---|
| T64 | 3 表 schema + 3 repository (sqlite + in-memory) + bundle.messaging + MetricsSnapshot.messaging + AllowedContextKey + admin isolation assertion |
| T65 | runMessagingAction + 3 server actions (createOrFindDirectThread / sendMessage / markThreadRead) + form wrappers (forbidden_thread → /inbox?error= privacy) |
| T66 | listInboxThreadsForAccount + listSystemNotificationsForAccount (read-only derived) + loadInboxThreadView SSR helper (4-step privacy order) |
| T67 | /inbox upgraded to two sections (direct messages + system notifications) + ?error= alert + a11y unread badge |
| T68 | /inbox/[threadId] detail page + InboxThreadPoll 30s data-free client component (I-9) |
| T69 | startContactThreadAction migrated to messaging (cookie utils removed; signature preserved) |

## 关键 Acceptance（spec 级）

- FR-001 (3 表 + 3 repository) ✅
- FR-002 (createOrFindDirectThread + unordered pair dedupe + 反向 dedupe) ✅
- FR-003 (sendMessage + 4000 字符 + tx) ✅
- FR-004 (markThreadRead + SSR 入口同步) ✅
- FR-005 (/inbox 列表 + 未读排除 self + 系统通知 read-only 派生 + counter) ✅
- FR-006 (/inbox/[threadId] + 30s polling + 4 步 SSR 顺序) ✅
- FR-007 (startContactThreadAction 迁移 + signature 不变 + cookie 删除) ✅
- FR-008 (messaging.* metrics + 隐私边界 + admin 零耦合 I-6) ✅
- NFR-001 (P95 ≤ 120ms) ✅ 实测 8.06ms / 0.73ms
- NFR-002..005 ✅

## 不变量

- I-1 ~ I-12 + A-007 全部在 schema / 接口 / 实现 / 测试中落地，详见各任务 traceability-review。

## 已知边界（不阻塞）

- A-007: Phase 1 同 role 多账号共享 profile id；§3.1 PostgreSQL 后通过 `creator_profiles.account_id` 列收敛。
- A-001: 单 thread ≤ 200 messages、单 user ≤ 500 threads；超出 V2 评估分页。
- 旧 baseline 18 failed test files 仍在；与 §3.2 / §3.6 V1 末状态一致；本增量 0 净增。

## 下一步

- `hf-finalize`：更新 `RELEASE_NOTES.md`、`docs/ROADMAP.md` §3.3、`README.md`、`task-progress.md`。
