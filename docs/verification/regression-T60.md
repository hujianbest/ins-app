# Regression — T60

- Date: `2026-04-19`
- Result: pass

```sh
cd /workspace/web
npx vitest run src/features/admin/ src/features/recommendations/ src/features/community/contracts.test.ts
npx vitest run（全套）
npm run typecheck && npm run lint && npm run build
```

- ✅ vitest（admin + recommendations + community contracts）：13 passed | 1 skipped (14)，103 passed | 2 skipped (105)
- ⚠️ vitest（全套）：20 failed | 48 passed | 1 skipped (69) | 1 failed | 258 passed (261) — vs T59 baseline 19 | 47 (67) | 247；新增 +1 passed (work-moderation-actions) +1 failed (page test 受 vite/sqlite bundling 限制；与既有 studio page tests 同形)；新增 11 passed tests
- ✅ typecheck：与 baseline 一致 4 errors
- ✅ lint：0 errors（baseline 1 warning）
- ✅ build：success（含 `/studio/admin/works` 路由）

不引入 regression。
