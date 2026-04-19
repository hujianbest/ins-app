# Test Design — T56 Beacon + /api/discovery-events 类型放宽（FR-005 收口）

- Task: T56
- Date: `2026-04-19`

## 测试单元

| 文件 | 覆盖目标 |
|---|---|
| `view-beacon.test.tsx`（扩展） | `eventType="related_card_view"` 路径触发 sendBeacon 一次；fallback fetch 路径；surface 不同时 dedupe 仍各自独立 |
| `app/api/discovery-events/route.test.ts`（扩展） | POST `{ eventType: "related_card_view", surface: "related_creators_section" }` 入库；POST `{ eventType: "related_card_view", surface: "related_works_section" }` 入库（含 actorAccountId 透传） |

## fail-first 主行为

1. beacon `related_card_view` 走 sendBeacon 路径 → call 1 次
2. beacon fallback fetch（sendBeacon 不可用）→ POST 一次
3. 两个 surface 的 dedupe 独立（`buildDedupeKey` 包含 surface）
4. route handler 接收 `related_card_view` + `related_creators_section` → `recordDiscoveryEvent` 被以期望参数调用
5. route handler 接收 `related_card_view` + `related_works_section` + 已认证用户 → `actorAccountId` 透传

## 退出标准

- 上述 vitest 子集全绿
- typecheck / lint / build 不引入新错
- 既有 `work_view` / `profile_view` 测试不漂移
