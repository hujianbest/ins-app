# Regression — T68

- Date: `2026-04-19`
- Result: pass

```sh
cd /workspace/web
npx vitest run src/app/inbox/
npx vitest run（全套）
npm run build
```

- ✅ vitest（inbox 全子集）：3 files / 13 tests passed
- ⚠️ vitest（全套）：18 failed | 65 passed | 2 skipped (85) | 1 failed | 336 passed (341) — vs T67 baseline 18 | 63 (83) | 328；新增 2 passed test files (poll-client + threadId page)；+8 passed tests；既有失败集合不变
- ✅ build：success（含 /inbox + /inbox/[threadId] 两路由）

不引入 regression。
