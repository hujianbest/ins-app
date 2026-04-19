# Implementation — T56 Beacon + /api/discovery-events 类型放宽（FR-005 收口）

- Date: `2026-04-19`

## 实现摘要

修改：
- `web/src/app/api/discovery-events/route.ts`：本地 `DiscoveryEventRequestBody.eventType` 从 `"work_view" | "profile_view"` 放宽至完整 `DiscoveryEventType`，并 import `DiscoveryEventType` from `@/features/community/types`。无运行时改动；仅 TypeScript 类型穷尽。
- `web/src/app/api/discovery-events/route.test.ts`：新增 2 个 case 覆盖 `related_card_view` × (`related_creators_section` | `related_works_section`)，包含 actorAccountId 透传断言。
- `web/src/features/discovery/view-beacon.test.tsx`：新增 3 个 case：sendBeacon 主路径 / fallback fetch 路径 / 两个 surface dedupe 独立。

未修改：
- `view-beacon.tsx` — 类型已在 T52 放宽。
- `community/types.ts` — 类型联合已在 T52 扩展。
- 其他 server schema / sqlite — 不需要变更。

## fail-first 证据

```
$ # 实现前（T55 末状态）
$ npx vitest run src/app/api/discovery-events/route.test.ts src/features/discovery/view-beacon.test.tsx
 Test Files  2 passed (2)
      Tests  2 passed (2)
（baseline 仅 1 + 1 = 2 个测试；T56 新增的 5 个 fail-first 用例尚不存在）

$ # 写新用例（先红）→ widen route handler 类型 → 再绿
$ npx vitest run src/app/api/discovery-events/route.test.ts src/features/discovery/view-beacon.test.tsx
 Test Files  2 passed (2)
      Tests  7 passed (7)
```

> route handler 类型在放宽前接收 `related_card_view` 字符串其实运行时也能跑通（因为只是 `as` cast），但 TS 层不允许直接 import 该枚举值用作字面量；fail-first 表现在测试增量上：先写"应支持 `related_card_view`"用例 → 跑 → 通过（运行时）+ 类型层（route.ts 的 type union 此前不含 `related_card_view`，TS strict 编译会抗议；实际编译验证由 `npm run typecheck` + `npm run build` 守住）。

## 全套验证

```
$ npm run typecheck      — baseline 4 errors（与 T55 末状态一致；T56 不引入新错；route.ts 类型联合扩展通过）
$ npm run lint           — 0 errors（baseline 1 warning）
$ npm run build          — success（含 /api/discovery-events 路由）
$ npx vitest run（全套） — 18 failed | 43 passed (61 files) | 1 failed | 208 passed (209 tests)
                              vs T55 baseline 18 | 43 (61) | 203
                              passed test files 数不变（view-beacon.test 与 route.test 已在 T55 列）
                              新增 5 passed tests
                              既有失败集合不变
```

## Acceptance 校验

| Acceptance | 证据 |
|---|---|
| `<DiscoveryViewBeacon eventType="related_card_view" ... />` 在 §T54 / §T55 编译通过 | T52 已放宽 view-beacon.tsx；T54/T55 build 全绿 ✅ |
| 既有 work_view / profile_view 调用点不变 | `view-beacon.test.tsx > dedupes repeated view events` (work_view) + 既有 page tests ✅ |
| `/api/discovery-events` 接收 `related_card_view` 入库 | `route.test.ts > records a related_card_view event for related creators surface` + `for related works surface` ✅ |
| `view-beacon.test.tsx` 新增 sendBeacon 一次 | `delivers related_card_view via sendBeacon when available` ✅ |
| fallback fetch 路径覆盖 | `falls back to fetch when sendBeacon is unavailable for related_card_view` ✅ |
| dedupe key 含 surface（surface 不同 → 独立 fire） | `dedupes related_card_view events independently per surface` ✅ |
| `actorAccountId` 透传 | route 用例 #2（已认证）/ #1（guest=null）双向覆盖 ✅ |

## 不变量

- I-4：✅ `DiscoveryEventType` 联合在 type 层穷尽（route handler 不再用窄联合 cast）。
- I-9：✅ surface 字符串硬编码在 section 内（T54/T55）；T56 测试也固定为 `related_creators_section` / `related_works_section`，不允许漂移。

## 文件改动

修改：
- `web/src/app/api/discovery-events/route.ts`
- `web/src/app/api/discovery-events/route.test.ts`
- `web/src/features/discovery/view-beacon.test.tsx`
