# Regression — T65

- Date: `2026-04-19`
- Result: pass

```sh
cd /workspace/web
npx vitest run src/features/messaging/
npx vitest run（全套）
npm run typecheck && npm run lint && npm run build
```

- ✅ vitest（messaging 全子集）：5 files / 29 tests passed
- ⚠️ vitest（全套）：18 failed | 60 passed | 2 skipped (80) | 1 failed | 315 passed (320) — vs T64 baseline 18 | 58 (78) | 298；新增 2 passed test files (runtime + thread-actions)；新增 17 passed tests；既有失败集合不变
- ✅ typecheck：与 baseline 一致 4 errors
- ✅ lint：0 errors（baseline 1 warning）
- ✅ build：success

不引入 regression。
