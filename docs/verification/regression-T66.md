# Regression — T66

- Date: `2026-04-19`
- Result: pass

```sh
cd /workspace/web
npx vitest run src/features/messaging/
npx vitest run（全套）
npm run typecheck && npm run lint && npm run build
```

- ✅ vitest（messaging 全子集）：8 files / 39 tests passed
- ⚠️ vitest（全套）：18 failed | 63 passed | 2 skipped (83) | 1 failed | 325 passed (330) — vs T65 baseline 18 | 60 (80) | 315；新增 3 passed test files (inbox-model + system-notifications + inbox-thread-view)；新增 10 passed tests；既有失败集合不变
- ✅ typecheck/lint/build baseline 不漂移

不引入 regression。
