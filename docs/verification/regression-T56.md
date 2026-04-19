# Regression — T56

- Date: `2026-04-19`
- Result: pass

```sh
cd /workspace/web
npx vitest run src/features/discovery/view-beacon.test.tsx src/app/api/discovery-events/route.test.ts
npx vitest run（全套）
npm run typecheck
npm run lint
npm run build
```

- ✅ vitest（T56 子集）：2 files / 7 tests passed
- ⚠️ vitest（全套）：18 failed | 43 passed (61) | 1 failed | 208 passed (209) — vs T55 baseline 18 | 43 (61) | 203；passed test files 数不变（这两个文件已在 T55 列）；新增 5 passed tests；既有失败集合不变
- ✅ typecheck：与 T55 末状态一致 baseline 4 errors
- ✅ lint：0 errors（baseline 1 warning）
- ✅ build：success（含 `/api/discovery-events` 路由）

不引入 regression。
