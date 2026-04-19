# Regression — T64

- Date: `2026-04-19`
- Result: pass

```sh
cd /workspace/web
npx vitest run src/features/messaging/ src/features/observability/metrics.test.ts src/features/admin/__messaging-isolation.test.ts src/features/community/test-support.test.ts
npx vitest run（全套）
npm run typecheck && npm run lint && npm run build
```

- ✅ vitest（messaging + isolation + test-support 子集）：6 files / 35 tests passed
- ⚠️ vitest（全套）：18 failed | 58 passed | 2 skipped (78) | 1 failed | 298 passed (303) — vs §3.2 V1 末 baseline 18 | 53 (72) | 278；新增 5 passed test files（identity + context-link + metrics + __messaging-isolation + test-support）；新增 20 passed tests；既有失败集合不变
- ✅ typecheck：与 baseline 一致 4 errors
- ✅ lint：0 errors（baseline 1 warning）
- ✅ build：success（含所有既有路由 build；尚无 messaging 路由，T67/T68 引入）

不引入 regression。
