# Test Review — T66

| 维度 | 评估 |
|---|---|
| fail-first 实证 | ✅ 实现前 import fail；实现后 39 passed |
| Acceptance ↔ test | ✅ |
| 4 步顺序硬约束 | ✅ inbox-thread-view spy 断言 markRead 在 guard 失败时不调用 |
| counter on/off | ✅ system-notif test 双向断言 |
| 既有测试不漂移 | ✅ 18 failed | 63 passed (vs T65 18 | 60)；新增 3 passed test files；既有失败集合不变 |

## 结论

通过。
