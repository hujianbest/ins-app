# Bug Patterns — T61

## 已规避

1. **vite test bundling 限制 cascade 到所有 admin page tests**：runtime.ts 直接 import `getSessionContext` + `getDefaultCommunityRepositoryBundle` 让任何 import runtime.ts 的代码（admin server actions、admin pages、admin page tests）都拖入 `auth-store.ts` + `community/sqlite.ts` → vite test bundler 失败。修复：runtime.ts 的两个 default loader 改用 dynamic `await import(...)`，仅在生产路径（无 deps 注入）才触发 import；测试路径全部 deps 注入，永远不触发 dynamic import。**额外收益**：原本进 baseline-failed 的 T59/T60 page tests 也变成可跑。
2. **audit page 渲染 N=100 触发 N+1 SQL**：实现单次 `bundle.audit.listLatest(100)` 不 join 任何外表（`actor_email` / `target_id` 都已直存 audit_log 列）。
3. **空态被误当成 error**：`entries.length === 0` 显式渲染稳定空态文案，而非 redirect / 404。

## 候选下游

- T63 dashboard 同样使用 dynamic-import pattern（其实不需要，因为 dashboard 不调用 admin server action）。
