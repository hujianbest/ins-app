## 结论

通过

## 命中的缺陷模式

- 测试入口缺失：`web/package.json` 原先没有 `test` 脚本，导致测试体系无法启动。
- 前端测试环境缺口：Next.js 页面组件依赖 `next/image`，若无测试适配会导致 smoke test 环境不稳定。
- 配置漂移风险：初始 Vitest 配置使用了会产生提示的 `vite-tsconfig-paths` 插件写法，已收敛到当前内置 `resolve.tsconfigPaths` 写法。

## 缺失的防护

- 当前 smoke test 只覆盖首页最小渲染能力，后续页面替换为品牌化首页后需要同步更新断言，避免测试失真。

## 下一步

`进入 ahe-test-review`

## 记录位置

- `docs/reviews/bug-patterns-T1.md`
