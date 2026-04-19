# Bug Patterns — T63

## 已规避

1. **非 admin 看到 admin 入口卡**：条件渲染 + 测试 `queryByRole(... /进入运营后台/) === null` 显式断言不存在。
2. **dashboard 入口卡链向不存在路由**：T59/T60/T61 路由全部已实现（task plan dependency），dashboard 入口卡在 T63 实现时这些路由都已编译通过。
3. **admin 邮箱泄漏到 metadata / sitemap**：page metadata 用静态字符串「运营后台 | Lens Archive」+ noindex，不含 admin 邮箱。

## 候选下游

- 未来添加更多 admin 模块时（举报队列、账号管理），dashboard 入口卡列表需扩展；保持「全部 admin 路由都先实现，dashboard 最后扩展」的拓扑顺序。
