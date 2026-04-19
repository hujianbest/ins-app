# Regression — T46 (任务级 sanity)

- Date: `2026-04-19`
- Task: T46
- Result: pass

## 执行的回归命令

按设计 §13.2 / 任务计划 §5 的可执行 gate（不含 NFR-001 性能基线，那项绑定 increment 级回归 gate）：

```sh
cd /workspace/web && npx vitest run src/features/observability/ src/proxy.test.ts src/app/api/health/
cd /workspace/web && npm run lint
cd /workspace/web && npm run typecheck
cd /workspace/web && npm run build
```

## 结果

- **vitest（任务相关 5 个测试文件）**：✅ 27 passed (27)
- **vitest（全套 49 文件）**：⚠️ baseline 18 failed | 31 passed (49)（baseline 19 failed → 18 failed；T46 净改善 1 个文件转绿，未引入任何新失败用例）
- **npm run lint**：✅ 0 errors（保留 1 条 baseline warning：`sqlite.test.ts` 未使用变量）
- **npm run typecheck**：✅ 仅保留 4 条 baseline 错误（`work-actions.test.ts` `canManageStudio / reason / redirectTo` 字段，自 Lens Archive Discovery Quality 收口前已知）
- **npm run build**：✅ 成功；构建输出包含 `Proxy (Middleware)` 行，确认 `web/src/proxy.ts` 被 Next 16 识别
- **手工 E2E**：✅ `curl -i -H 'x-trace-id: walking-skeleton-curl-001' /api/health` 响应 200 + `x-trace-id` 头一致 + 服务端结构化日志含同 traceId；`curl -i /api/health`（无入站）响应 200 + 自动生成 UUID v4 + 日志同步

## 与 baseline 对比

| 指标 | baseline (master) | 本任务结束 |
| --- | --- | --- |
| vitest 通过文件数 | 30 | 31 |
| vitest 失败文件数 | 19 | 18 |
| vitest 通过用例数 | 89 | 93（新增 27 个，原本失败的 1 条仍保持） |
| vitest 失败用例数 | 1 (baseline) | 1 (baseline) |
| lint errors | 0 | 0 |
| typecheck errors | 4 (baseline) | 4 (baseline) |
| build | success | success |

## 结论

T46 不引入任何 regression；并修复了原本因 jsdom env 失败的 health route 测试（通过 `// @vitest-environment node` pragma）。可进入 `hf-completion-gate`。
