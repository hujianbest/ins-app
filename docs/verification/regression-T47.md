# Regression — T47 (任务级 sanity)

- Date: `2026-04-19`
- Result: pass

## 命令

```sh
cd /workspace/web
npx vitest run src/features/observability/
npm run lint
npm run typecheck
npm run build
```

## 结果

- ✅ vitest（observability）：33 passed (5 files)
- ⚠️ vitest（全套）：与 T46 末状态一致 baseline 18 failed | 32 passed (50)；T47 新增 1 个 vitest 文件均通过；无新失败
- ✅ lint: 0 errors（baseline 1 warning）
- ✅ typecheck: 仅 baseline 4 错
- ✅ build: success

## 结论
不引入 regression，可进入 completion gate。
