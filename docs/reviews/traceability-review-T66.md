# Traceability Review — T66

| 上游 | 工件 | 测试 |
|---|---|---|
| FR-005 inbox 列表（直接消息段）| inbox-model.ts | inbox-model.test ✅ |
| FR-005 inbox 系统通知段（read-only 派生）| system-notifications.ts | system-notifications.test 5 cases ✅ |
| FR-005 自评论排除 | system-notif filter | system-notifications.test ✅ |
| FR-005 counter `messaging.system_notifications_listed` | metrics 注入 + helper | system-notifications.test 双向 ✅ |
| FR-006 SSR 4 步入口顺序 | inbox-thread-view.ts | inbox-thread-view.test 3 cases (guest / non-participant / participant) ✅ |
| NFR-002 隐私边界 | guard 前置 + thread 不存在统一 notFound | inbox-thread-view spy ✅ |
| NFR-003 SSR markRead 写 log 不递增 counter | inbox-thread-view + design §9.10 区分 | inbox-thread-view.test ✅ |
| 设计 ADR-2 (read-only 派生 system notif) | system-notifications.ts 不持久化 | code review ✅ |
| 设计 §10.4 错误码字典 | 4 步 redirect/notFound 与字典对齐 | code review |
| 设计 I-3 / I-5 / A-007 | inbox-thread-view + system-notif | tests ✅ |

无 orphan。

## 结论

通过。
