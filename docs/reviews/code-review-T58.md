# Code Review — T58

| 维度 | 评估 |
|---|---|
| 单一职责 | ✅ admin-policy（pure）/ runtime（行为）/ test-support 三模块各司其职 |
| 命名 | ✅ `runAdminAction` / `createAdminCapabilityPolicy` / `createAdminGuard` 与设计一致 |
| 错误处理 | ✅ admin 校验失败抛 `AppError("forbidden_admin_only", 403)`；fn 抛错时不吞错，warn log + 重抛 |
| Tx 处理 | ✅ `bundleWithTransaction` 优先调用 `bundle.withTransaction`，否则 fallback 直接执行；二者类型签名一致 |
| 安全 (NFR-002) | ✅ admin email 不进入 logger ctx |
| Trace 锚点 | ✅ FR-001 / I-1 / I-3 / I-4 / I-7 在源码注释或测试可回读 |
| 兼容性 | ✅ access-control 公共导出未变；既有调用方零改 |

## 发现项

无 important / blocking。Minor:
- `runAdminAction` 内同时通过 `getObservability()` 与 `opts.bundle` / `opts.metrics` / `opts.logger` 解析 deps；当显式注入 logger 时不会触发 `getObservability` 初始化（节省启动）。
- `bundleWithTransaction` 用 `Function.prototype.bind` 保持 `this` 上下文，避免 sqlite bundle 内部依赖 `this`。

## 结论

通过。
