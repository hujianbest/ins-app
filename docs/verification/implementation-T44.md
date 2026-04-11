## T44 瀹炵幇璁板綍

- Task: `T44`
- Topic: `Lens Archive Discovery Quality`
- Status: `implemented`

## 瀹炵幇鑼冨洿

- 鍒涗綔鑰呬富椤靛鍔狅細
  - `shootingFocus`
  - `discoveryContext`
  - 涓诲閮ㄦ壙鎺ュ叆鍙?
- 浣滃搧璇︽儏椤靛鍔犲垱浣滆€呰澧冨潡锛屾槑纭€滆繘鍏ュ垱浣滆€呬富椤碘€濅笌鈥滄煡鐪嬩富澶栭儴鎵挎帴鈥濅袱鏉″彲淇′笅涓€姝ャ€?
- 鏂板 `/outbound/[role]/[slug]` route锛屼负鍚庣画缁熶竴绔欏 handoff 璁板綍棰勭暀绋冲畾鍏ュ彛銆?

## 涓昏瑙︾鏂囦欢

- `web/src/features/showcase/profile-showcase-page.tsx`
- `web/src/app/works/[workId]/page.tsx`
- `web/src/app/outbound/[role]/[slug]/route.ts`
- 鐩稿叧娴嬭瘯:
  - `web/src/app/photographers/[slug]/page.test.tsx`
  - `web/src/app/models/[slug]/page.test.tsx`
  - `web/src/app/works/[workId]/page.test.tsx`
  - `web/src/app/outbound/[role]/[slug]/route.test.ts`

## 楠岃瘉璇佹嵁

- 宸叉墽琛?
  - `npm test -- "src/app/photographers/[slug]/page.test.tsx" "src/app/models/[slug]/page.test.tsx" "src/app/works/[workId]/page.test.tsx" "src/app/outbound/[role]/[slug]/route.test.ts"`
- 缁撴灉:
  - `4` 涓祴璇曟枃浠堕€氳繃
  - `12` 鏉℃祴璇曢€氳繃

## 涓嬩竴姝?

- 鎸変换鍔¤鍒掑垏鎹㈠埌 `T45`

