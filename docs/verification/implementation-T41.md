## T41 瀹炵幇璁板綍

- Task: `T41`
- Topic: `Lens Archive Discovery Quality`
- Status: `implemented`

## 瀹炵幇鑼冨洿

- 鎵╁睍 `CreatorProfileRecord` / `PublicProfile`锛屾柊澧烇細
  - `shootingFocus`
  - `discoveryContext`
  - `externalHandoffUrl`
- 鎵╁睍 SQLite schema銆佹洿鏂拌鍙ュ拰 seed 鍐欏叆閫昏緫锛屽苟涓哄凡瀛樺湪鏁版嵁搴撹ˉ鍏呮渶灏忓垪杩佺Щ銆?
- 鎵╁睍 `public-read-model`锛岃鍏紑璧勬枡鍙姇褰辨柊澧炲瓧娈点€?
- 鎵╁睍 `studio/profile` 缂栬緫妯″瀷銆佷繚瀛橀€昏緫鍜岄〉闈㈣〃鍗曘€?
- 涓?`externalHandoffUrl` 澧炲姞鏈€灏?URL 鍚堟硶鎬ф牎楠屻€?

## 涓昏瑙︾鏂囦欢

- `web/src/features/showcase/types.ts`
- `web/src/features/community/types.ts`
- `web/src/features/community/contracts.ts`
- `web/src/features/showcase/seed-data/profiles.ts`
- `web/src/features/community/profile-editor.ts`
- `web/src/features/community/profile-actions.ts`
- `web/src/features/community/public-read-model.ts`
- `web/src/features/community/sqlite.ts`
- `web/src/app/studio/profile/page.tsx`

## 楠岃瘉璇佹嵁

- 宸叉墽琛?
  - `npm test -- "src/features/community/profile-editor.test.ts" "src/features/community/public-read-model.test.ts" "src/app/studio/profile/page.test.tsx" "src/features/community/sqlite.test.ts"`
- 缁撴灉:
  - `4` 涓祴璇曟枃浠堕€氳繃
  - `12` 鏉℃祴璇曢€氳繃
- 琛ュ厖璇存槑:
  - `npm run typecheck` 涓粛瀛樺湪 `kaca` 鍩虹嚎閲屾湭鐢辨湰浠诲姟寮曞叆鐨勬棫鎶ラ敊锛岄泦涓湪 `src/features/community/work-actions.test.ts` 涓?`src/features/opportunities/opportunity-card.tsx`锛涙湰浠诲姟鏂板鐨?`PublicProfile` 鐩稿叧 type errors 宸叉竻鐞嗗畬姣曘€?

## 涓嬩竴姝?

- 鎸変换鍔¤鍒掑垏鎹㈠埌 `T42`

