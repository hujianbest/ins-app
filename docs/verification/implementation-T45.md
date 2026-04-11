## T45 瀹炵幇璁板綍

- Task: `T45`
- Topic: `Lens Archive Discovery Quality`
- Status: `implemented`

## 瀹炵幇鑼冨洿

- 涓?SQLite 澧炲姞 `discovery_events` 琛ㄤ笌 repository銆?
- 鏂板 `features/discovery/events.ts` 缁熶竴璁板綍鍏ュ彛銆?
- 鏂板 `DiscoveryViewBeacon` 涓?`/api/discovery-events` route锛屾敮鎸?`work_view` / `profile_view` 鐨勫鎴风 view 璁板綍涓庡悓浼氳瘽鍘婚噸銆?
- 涓?`follow`銆乣contact_start` 涓?`external_handoff_click` 鎺ュ叆 server-side 璁板綍銆?
- 涓烘湭鐧诲綍 contact銆佹湭鐧诲綍 follow銆佺己澶卞閾?handoff 澧炲姞澶辫触杈圭晫璁板綍銆?

## 涓昏瑙︾鏂囦欢

- `web/src/features/community/types.ts`
- `web/src/features/community/sqlite.ts`
- `web/src/features/discovery/events.ts`
- `web/src/features/discovery/view-beacon.tsx`
- `web/src/app/api/discovery-events/route.ts`
- `web/src/features/social/actions.ts`
- `web/src/features/contact/actions.ts`
- `web/src/app/outbound/[role]/[slug]/route.ts`
- `web/src/features/showcase/profile-showcase-page.tsx`
- `web/src/app/works/[workId]/page.tsx`

## 楠岃瘉璇佹嵁

- 宸叉墽琛?
  - `npm test -- "src/features/discovery/events.test.ts" "src/features/discovery/view-beacon.test.tsx" "src/features/social/actions.test.ts" "src/features/contact/actions.test.ts" "src/app/outbound/[role]/[slug]/route.test.ts" "src/app/api/discovery-events/route.test.ts" "src/app/photographers/[slug]/page.test.tsx" "src/app/models/[slug]/page.test.tsx" "src/app/works/[workId]/page.test.tsx"`
- 缁撴灉:
  - `9` 涓祴璇曟枃浠堕€氳繃
  - `20` 鏉℃祴璇曢€氳繃

## 涓嬩竴姝?

- 杩涘叆鏁磋疆鍥炲綊涓庡畬鎴愰棬绂?

