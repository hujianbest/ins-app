## 结论

通过

## 已验证结论

- `T4` 已为首页建立共享样本数据与类型定义。
- 首页已改为消费共享样本数据模块，而不再内联维护 `featuredPaths`。
- 当前最新代码状态下，测试、lint 与生产构建均通过。

## 证据

- `cd web && npm run test` -> 通过，首页渲染测试与共享样本数据断言全部通过。
- `cd web && npm run lint` -> 通过，无错误、无警告。
- `cd web && npm run build` -> 通过，Next.js 生产构建成功。
- fail-first 证据：在抽离前，`page.test.tsx` 因无法导入 `@/features/showcase/sample-data` 而失败。

## 下一步

`ahe-finalize`

## 记录位置

- `docs/verification/completion-T4.md`
