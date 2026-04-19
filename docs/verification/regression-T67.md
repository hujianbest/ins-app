# Regression — T67

- Date: `2026-04-19`
- Result: pass

```sh
cd /workspace/web
npx vitest run src/app/inbox/
npx vitest run（全套）
npm run typecheck && npm run lint && npm run build
```

- ✅ vitest（inbox）：1 file / 5 tests passed
- ⚠️ vitest（全套）：18 failed | 63 passed | 2 skipped (83) | 1 failed | 328 passed (333) — vs T66 baseline 18 | 63 (83) | 325；passed test files 不变；新增 3 passed tests；既有失败集合不变
- ✅ build：success（含 /inbox 升级路由）

不引入 regression。
