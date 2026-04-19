# Code Review — T56

- Task: T56

## 评审范围

修改：
- `web/src/app/api/discovery-events/route.ts`（type-only 放宽）
- `web/src/app/api/discovery-events/route.test.ts`（+2 case）
- `web/src/features/discovery/view-beacon.test.tsx`（+3 case）

## 检查点

| 维度 | 评估 |
|---|---|
| 最小变更 | ✅ route.ts 只改 1 处类型 + 1 行 import；运行时无变化 |
| 类型安全 | ✅ 直接 import `DiscoveryEventType`；联合扩展自动同步 |
| 测试覆盖 | ✅ sendBeacon / fallback / dedupe-by-surface / 双 actor 路径 |
| 既有 work_view / profile_view 路径 | ✅ baseline test 仍绿 |
| 注释 | ✅ FR-005 trace 锚点写在 route.ts 注释 |

## 发现项

无。

## 结论

通过。
