# Regression — T57

- Date: `2026-04-19`
- Result: pass

```sh
cd /workspace/web
npx vitest run src/config/env.test.ts src/features/observability/metrics.test.ts src/features/admin/ src/features/community/contracts.test.ts
npx vitest run（全套）
npm run typecheck
npm run lint
npm run build
```

- ✅ vitest（T57 子集，可单独跑的部分）：4 files / 46 tests passed
- ⚠️ vitest（全套）：18 failed | 44 passed | 1 skipped (63 files) | 1 failed | 224 passed | 2 skipped (227 tests) — vs T56 baseline `18 failed | 43 passed (61) | 208 tests`，新增 1 个 passed test file = `admin/metrics.test.ts`，新增 16 passed tests；既有失败集合不变（pre-existing vite/node:sqlite bundling issue 影响 sqlite + auth-store + access-control + 多个 page 集成测试，与本任务无关）。
- ✅ lint：0 errors（baseline 1 warning）
- ✅ typecheck：与 T56 末状态一致 baseline 4 errors（`work-actions.test.ts` 既有 canManageStudio / reason；T57 不引入新错）
- ✅ build：success（含所有 admin 后续路由的 build 前置）

不引入 regression。
