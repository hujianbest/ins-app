## Regression Gate

- Topic: `Lens Archive Discovery Quality`
- Result: `pass`

## 瑕嗙洊鑼冨洿

- `T41` 璧勬枡妯″瀷銆丼QLite 鍒楄縼绉汇€佸叕寮€璇绘ā鍨嬩笌宸ヤ綔鍙拌〃鍗?
- `T42` 棣栭〉 / 鍙戠幇鍗＄墖涓庢悳绱㈣澧冪嚎绱?
- `T43` 棣栭〉 / 鍙戠幇 / 鎼滅储鍙欎簨涓?metadata
- `T44` 鍒涗綔鑰呬富椤点€佷綔鍝佽鎯呬笌 outbound handoff
- `T45` discovery event repository銆乿iew beacon銆乫ollow/contact/outbound 浜嬩欢璁板綍

## 宸叉墽琛屽洖褰掑懡浠?

```sh
npm test -- "src/features/community/contracts.test.ts" "src/features/community/profile-editor.test.ts" "src/features/community/public-read-model.test.ts" "src/features/community/sqlite.test.ts" "src/app/studio/profile/page.test.tsx" "src/features/home-discovery/adapters.test.ts" "src/features/home-discovery/resolver.test.ts" "src/features/search/search.test.ts" "src/app/page.test.tsx" "src/app/page.discovery-regression.test.tsx" "src/app/discover/page.test.tsx" "src/app/layout.test.ts" "src/app/search/page.test.tsx" "src/app/photographers/[slug]/page.test.tsx" "src/app/models/[slug]/page.test.tsx" "src/app/works/[workId]/page.test.tsx" "src/features/social/follows.test.ts" "src/features/social/actions.test.ts" "src/features/contact/actions.test.ts" "src/app/outbound/[role]/[slug]/route.test.ts" "src/app/api/discovery-events/route.test.ts" "src/features/discovery/events.test.ts" "src/features/discovery/view-beacon.test.tsx"
```

## 鍥炲綊缁撴灉

- `23` 涓祴璇曟枃浠堕€氳繃
- `59` 鏉℃祴璇曢€氳繃

## 琛ュ厖璇存槑

- `ReadLints` 鍦ㄦ湰杞敼鍔ㄨ寖鍥村唴鏈彂鐜版柊澧?lint 闂銆?
- `npm run typecheck` 浠嶅瓨鍦?`kaca` 鍩虹嚎鐨勬棫鎶ラ敊锛岄泦涓湪 `src/features/community/work-actions.test.ts` 涓?`src/features/opportunities/opportunity-card.tsx`锛涙湰杞敼鍔ㄦ湭鏂板鏂扮殑 typecheck 闃诲銆?

## 缁撹

- 褰撳墠澧為噺鍙繘鍏?completion gate銆?

