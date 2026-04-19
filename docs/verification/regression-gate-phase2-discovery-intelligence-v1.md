# Regression Gate — Phase 2 Discovery Intelligence V1

- Date: `2026-04-19`
- Increment: Phase 2 — Discovery Intelligence V1
- Tasks 全部完成: T52 / T53 / T54 / T55 / T56
- Result: **PASS**

## 1. 任务级 sanity 汇总

| Task | regression report | 结论 |
|---|---|---|
| T52 | `docs/verification/regression-T52.md` | pass |
| T53 | `docs/verification/regression-T53.md` | pass |
| T54 | `docs/verification/regression-T54.md` | pass |
| T55 | `docs/verification/regression-T55.md` | pass |
| T56 | `docs/verification/regression-T56.md` | pass |

每个任务都已通过 `cd web && npm run typecheck && npm run lint && npm run build` 与各自 vitest 子集；全套 vitest baseline 不漂移（pre-existing 18 failed test files 均为 vite/node:sqlite bundling 限制，与本增量无关）。

## 2. Increment 级业务零回归

```sh
$ cd /workspace/web
$ npx vitest run（全套）
 Test Files  18 failed | 43 passed (61)
      Tests  1 failed | 208 passed (209)
```

- vs T51 末状态 baseline 18 failed | 36 passed (54) | 144 tests：本增量新增 7 个 passed test files (signals + config + scoring + related-creators + related-creators-section + related-works + related-works-section + perf.bench skip-by-default 不计入)，新增 65 个 passed tests（含 T56 的 view-beacon + route handler 用例增量），全部用例独立、可重复。
- 既有 18 个 failed test files 与单一 failed test 集合**完全不变**。
- 本增量未修改任何已交付 server action / route handler 的业务行为；新增模块均独立于既有业务流。

## 3. NFR-001 性能基线（FR-008 / NFR-001 P95 ≤ 30ms）

```sh
$ RUN_PERF=1 npx vitest run --reporter=verbose src/features/recommendations/perf.bench.test.ts

stdout | getRelatedCreators stays under 30ms P95 with 100 same-role candidates
  getRelatedCreators  n=1000  p50=0.03ms  p95=0.05ms  p99=0.06ms

stdout | getRelatedWorks stays under 30ms P95 with 200 works + 50 owner profiles
  getRelatedWorks  n=1000  p50=0.04ms  p95=0.04ms  p99=0.11ms

 ✓ getRelatedCreators stays under 30ms P95 with 100 same-role candidates 42ms
 ✓ getRelatedWorks stays under 30ms P95 with 200 works + 50 owner profiles 50ms
```

| 模块 | P50 | P95 | P99 | 预算 | 余量 |
|---|---|---|---|---|---|
| getRelatedCreators (100 candidates) | 0.03ms | **0.05ms** | 0.06ms | 30ms | ≈600× |
| getRelatedWorks (200 works + 50 profiles) | 0.04ms | **0.04ms** | 0.11ms | 30ms | ≈750× |

性能预算远未触顶。`perf.bench.test.ts` 默认 skip，由 `RUN_PERF=1` 显式触发，避免 CI 抖动。

## 4. CON / NFR 闭合

| 锚点 | 状态 | 证据 |
|---|---|---|
| CON-001 仅用现有 repository | ✅ | 未新增 SQL 表 / schema 迁移；仅消费 `listPublicProfiles` / `listPublicWorks` |
| CON-002 无运行时 ML 依赖 | ✅ | `package.json` 与 lockfile 未变 |
| CON-003 UI 仅 2 处注入位 | ✅ | `profile-showcase-page.tsx` 末段 + `app/works/[workId]/page.tsx` 评论上方；不动 shell 组件契约 |
| CON-004 复用 `/api/discovery-events` | ✅ | T56 仅放宽本地类型；不新建 API 路由 |
| CON-005 复用既有 MetricsRegistry | ✅ | `MetricsSnapshot.recommendations` 加性扩展，不破坏既有消费者 |
| NFR-001 性能 ≤ 30ms P95 | ✅ | 见 §3 |
| NFR-002 不消费 `discovery_events` 个性化 | ✅ | scoring 仅读 `CreatorProfileRecord` / `CommunityWorkRecord` 公开字段 |
| NFR-003 logger 字段 (`event=recommendations.section.{rendered,failed}`) | ✅ | T54 / T55 实现 + 单测覆盖 |
| NFR-004 deps 注入 | ✅ | `getRelatedCreators` / `getRelatedWorks` 接受 `bundle` / `metrics` / `logger` / `flagEnabled` |
| NFR-005 不修改既有 server action / route handler 业务行为 | ✅ | T56 仅 type-only widening + test 扩展；其他任务为新增模块 + 2 处页面 SSR 挂载 |

## 5. 设计不变量 I-1 ~ I-12 闭合

| 不变量 | 闭合证据 |
|---|---|
| I-1 scoring 纯函数 | `scoring.test.ts > is deterministic` |
| I-2 权重不变量 | `signals.test.ts` SRS §8.3 三条断言 |
| I-3 flag disabled → orchestrator null | `related-creators.test`/`related-works.test` 各自 `returns null when the feature flag is disabled` |
| I-4 DiscoveryEventType 穷尽 | T56 route.ts 直接绑定联合，typecheck pass |
| I-5 单次 repository 读 | T54/T55 spy 断言 |
| I-6 metrics key 唯一定义 | `recommendations/metrics.ts` + `observability/metrics.ts` 预注册表 |
| I-7 自身过滤是上层职责 | `rankCandidates(options.isSelf)` |
| I-8 catch → warn + counter empty | T54/T55 soft-fail 用例覆盖 |
| I-9 surface 字符串硬编码 | section 内字面量 + T56 测试断言 |
| I-10 section 不透传 bundle 到 client | section async server component；deps server-only |
| I-11 disabled DOM 无 panel + 无 beacon | `related-*-section.test.tsx > renders no DOM` |
| I-12 updatedAt → publishedAt → "" 回退 | `related-creators.test > uses publishedAt as updatedAt fallback` + `related-works.ts` 实现 |

## 6. 结论

**PASS** — 进入 `hf-completion-gate`。
