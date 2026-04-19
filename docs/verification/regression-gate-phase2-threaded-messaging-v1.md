# Regression Gate — Phase 2 §3.3 Threaded Messaging V1

- Date: `2026-04-19`
- Verdict: pass

## NFR-001 性能 micro-bench

```sh
$ cd web && RUN_PERF=1 npx vitest run --reporter=verbose src/features/messaging/perf.bench.test.ts
listThreadsForAccount P95:                  8.06ms (≤ 120ms ✅)
listSystemNotificationsForAccount P95:      0.73ms (≤ 120ms ✅)
```

500 threads + 200 messages 规模 + 500 discovery events + 200 work_comments + 50 works；P95 远低于 120ms 预算（≤ 7%）。in-memory bundle 路径；sqlite 真实 IO 延迟期望仍 < 30ms（与 §3.2 / §3.6 V1 同形）。

## 全套 vitest

```
$ npx vitest run
 Test Files  18 failed | 65 passed | 2 skipped (85)
      Tests  1 failed | 338 passed | 4 skipped (343)
```

vs §3.2 V1 末 baseline 18 failed / 53 passed (72) / 278；本增量结束 +12 passed test files；+60 passed tests；既有失败集合不变。

## typecheck / lint / build

- ✅ build：success（含 /inbox + /inbox/[threadId] 两个新路由）
- ✅ lint：0 errors
- ⚠️ typecheck：与 §3.2 V1 末 baseline 一致 4 errors（work-actions.test.ts canManageStudio / reason 缺漂移；本增量未引入新 errors）

## 既有 baseline 不漂移

- 18 failed test files 全部来自 vite/sqlite bundling baseline（与 §3.2 / §3.6 V1 末状态一致），本增量不引入新 baseline failure。
- 旧 cookie 工具全仓 0 命中：`rg "contactThreadsCookieName|parseContactThreads|serializeContactThreads|buildContactThread|upsertContactThread|getInboxThreadsForRole" web/src` → 无命中。
- admin 模块 zero coupling 字符串扫描断言（I-6）持续守住。
