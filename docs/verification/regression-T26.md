## 结论

通过

## 回归范围

- 首页社区化 hero、次级合作 teaser 与 `featured/latest` 主分区
- `/discover` 页面与 `featured/latest/following` 浏览面
- `web/src/features/home-discovery` resolver / config / section 相关行为
- Next.js 16 生产构建与默认 SQLite 页面数据收集路径

## Fresh Evidence

- 命令: `npm run test -- "src/app/page.test.tsx" "src/app/page.discovery-regression.test.tsx" "src/app/discover/page.test.tsx" "src/features/home-discovery"`
  - 结果: `8` 个测试文件、`19` 个测试全部通过。
  - 说明: 首页主线切换、discover 浏览面、following 空态与 home/discover 分区顺序相关断言全部保持稳定。
- 命令: `npm run build`
  - 结果: 构建通过，`/discover` 路由正常生成，全部 app routes 正常完成页面数据收集与静态生成 / 动态标记。
  - 说明: 默认 SQLite 读取、首页与 discover 的服务端装配没有破坏现有公开页或构建链。

## 结论说明

- 当前未观察到首页社区化和 discover 浏览面切换对现有公开页、构建或服务端读模型造成回归。
- `node:sqlite` 仍输出 experimental warning，但不影响当前回归门禁结论。

## 下一步

- `ahe-completion-gate`
