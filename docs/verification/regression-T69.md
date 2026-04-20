# Regression — T69

- Date: `2026-04-19`
- Result: pass

```sh
cd /workspace/web
npx vitest run src/features/contact/
npx vitest run（全套）
npm run typecheck && npm run lint && npm run build
rg "contactThreadsCookieName|parseContactThreads|serializeContactThreads|buildContactThread|upsertContactThread|getInboxThreadsForRole" web/src
```

- ✅ vitest（contact）：1 file / 4 tests passed
- ⚠️ vitest（全套）：18 failed | 65 passed | 2 skipped (85) | 1 failed | 338 passed (343) — vs T68 baseline 18 | 65 (85) | 336；passed test files 不变；+2 passed tests；既有失败集合不变
- ✅ build / typecheck baseline 不漂移
- ✅ rg 0 命中（旧 cookie 工具完全删除）

不引入 regression。
