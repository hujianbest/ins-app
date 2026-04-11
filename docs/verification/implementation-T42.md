## T42 瀹炵幇璁板綍

- Task: `T42`
- Topic: `Lens Archive Discovery Quality`
- Status: `implemented`

## 瀹炵幇鑼冨洿

- 涓哄彂鐜板崱鐗囪ˉ鍏?`city + shootingFocus` 璇鎽樿銆?
- 涓哄垱浣滆€呭崱灏?`discoveryContext` 浣滀负浼樺厛鎻忚堪鏂囨銆?
- 涓烘悳绱㈣ˉ鍏?`shootingFocus`銆乣discoveryContext` 涓庝綔鍝佹墍灞炲垱浣滆€呰澧冪殑鍖归厤鑳藉姏銆?
- 璁╀綔鍝佹悳绱㈢粨鏋滃拰棣栭〉 / 鍙戠幇椤典綔鍝佸崱鐗囧甫涓婂垱浣滆€呰澧冪嚎绱紝鑰屼笉鍐嶅彧鏄剧ず浣滆€呭悕涓庤鑹层€?

## 涓昏瑙︾鏂囦欢

- `web/src/features/home-discovery/adapters.ts`
- `web/src/features/home-discovery/resolver.ts`
- `web/src/features/search/search.ts`
- 鐩稿叧娴嬭瘯:
  - `web/src/features/home-discovery/adapters.test.ts`
  - `web/src/features/home-discovery/resolver.test.ts`
  - `web/src/features/search/search.test.ts`

## 楠岃瘉璇佹嵁

- 宸叉墽琛?
  - `npm test -- "src/features/home-discovery/adapters.test.ts" "src/features/home-discovery/resolver.test.ts" "src/features/search/search.test.ts"`
- 缁撴灉:
  - `3` 涓祴璇曟枃浠堕€氳繃
  - `10` 鏉℃祴璇曢€氳繃

## 涓嬩竴姝?

- 鎸変换鍔¤鍒掑垏鎹㈠埌 `T43`

