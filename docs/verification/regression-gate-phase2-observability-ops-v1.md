# Regression Gate — Phase 2 Observability & Ops V1

- Date: `2026-04-19`
- Topic: `Phase 2 — Observability & Ops V1`
- Result: `pass`

## 覆盖范围

- T46 Walking Skeleton（trace + logger + boundary + proxy + `/api/health` 接入）
- T47 Errors + ErrorReporter
- T48 Metrics + `/api/metrics`
- T49 Server boundary 接入 10 个 server actions + 1 个 route handler
- T50 env 契约扩展 + `/api/health` observability/backup 命名空间
- T51 SQLite Backup / Restore CLI

## 已执行回归命令

```sh
cd /workspace/web && npx vitest run
cd /workspace/web && npx vitest run \
  src/scripts/ src/features/observability/ \
  src/app/api/health/ src/app/api/metrics/ \
  src/config/env.test.ts \
  src/features/auth/actions.test.ts \
  src/features/community/work-actions.test.ts \
  src/features/community/profile-actions.test.ts \
  src/features/contact/actions.test.ts \
  src/features/engagement/actions.test.ts \
  src/features/social/actions.test.ts \
  src/features/social/comment-actions.test.ts
cd /workspace/web && npm run lint
cd /workspace/web && npm run typecheck
cd /workspace/web && npm run build
```

## vitest 结果

- **全套**：54 个文件 - 18 失败 / 36 通过；144 用例 - 1 失败 / 143 通过
  - 18 失败文件全部是 baseline 已知的「vitest 4 + jsdom env 不能 bundle `node:sqlite`」问题（详见 `docs/verification/regression-gate-lens-archive-discovery-quality.md` 同一现象）
  - 1 失败用例同样是 baseline 问题（`src/features/home-discovery/resolver.order.test.ts`）
  - **本增量未引入任何新失败，并修复了 1 个原本失败的 health route 文件（通过 `// @vitest-environment node` pragma）**
- **目标 subset**（observability + scripts + actions + 路由）：78 ＋ 27 ＝ 100+ 用例全绿

## NFR-001 性能基线（设计 §13.3）

按设计验收第 2 条「基线采集协议」执行：
- 生产构建（`npm run build` + `npm run start`），`OBSERVABILITY_LOG_LEVEL=warn`
- 10 次预热 + 1000 次顺序 `/api/health` 请求

结果（post-increment build）：
```json
{"samples":1000,"avg_ms":2.454,"p50_ms":2.367,"p90_ms":2.809,"p95_ms":3.099,"p99_ms":4.476,"max_ms":6.554}
```

**判定**：绝对 P95 = 3.099ms、P99 = 4.476ms，整条请求链路（含 proxy / ALS run / wrap / 业务 / SQLite open）都在 NFR-001 给出的 5ms P95 净增预算之下。本增量净增上限被绝对值压在 5ms 以内，NFR-001 满足。

证据：`/opt/cursor/artifacts/increment-regression-perf-evidence.md`

## NFR-002 无新 runtime 依赖

```sh
$ git diff master HEAD -- web/package.json | grep -E '^\+.*":"' | grep -v devDep
（无输出 — 与 master 相比 dependencies 字段无任何新增）
```

## CON-001 / CON-002 / CON-003 / CON-004 / CON-005

- CON-001：无新 npm 依赖（NFR-002 同时确认）✅
- CON-002：`/api/metrics` disabled 时 404 + body `{ error: "not_found" }`，绝不返回 401（T48 测试覆盖）✅
- CON-003：现有 schema 未变更（仅扩展 env loader，未改 `community.sqlite` schema）✅
- CON-004：现有 UI 与 server action 对外行为契约未变（27 个 action / route handler 测试全绿）✅
- CON-005：所有结构化日志可被 `JSON.parse` 解析（logger.test 显式断言）✅

## Lint / Typecheck / Build

- `npm run lint`：0 errors（保留 1 条 baseline warning：`sqlite.test.ts` `opportunityPosts` unused）
- `npm run typecheck`：仅 4 条 baseline 错（`work-actions.test.ts` 的 `canManageStudio / reason / redirectTo`，自 Lens Archive Discovery Quality 收口前已知）
- `npm run build`：成功；构建输出包含 `/api/metrics`、`/api/health`、`Proxy (Middleware)`

## 端到端手工验证

- `/api/health` trace id 头部继承 + 自动生成 + 结构化日志（`/opt/cursor/artifacts/t46-walking-skeleton-curl-evidence.md`、`t46-walking-skeleton-server-log.txt`）
- SQLite backup / restore CLI 4 场景全部按预期（`/opt/cursor/artifacts/t51-cli-e2e-evidence.md`、`t51-backup-dir-snapshot/`）
- `/api/metrics` disabled→404 / unauth→401 / ok→200 契约（T48 vitest 覆盖）

## 结论

`Phase 2 — Observability & Ops V1` 增量进入 `hf-completion-gate`。
