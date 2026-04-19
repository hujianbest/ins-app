# Test Design — T46 Walking Skeleton

- Date: `2026-04-19`
- Task: `T46` — Trace + Logger + Server Boundary + Proxy + `/api/health` walking skeleton
- Spec / Design / Tasks anchors: `docs/specs/2026-04-19-observability-ops-v1-srs.md` FR-001/FR-002/NFR-003/NFR-005、`docs/designs/2026-04-19-observability-ops-v1-design.md` §6.1/§7 D-1/§8.2/§11/§13.1、`docs/tasks/2026-04-19-observability-ops-v1-tasks.md` §5 T46

## 范围

- 仅覆盖 walking skeleton 所需 primitives：`trace`、`logger`、`server-boundary.wrapRouteHandler`、proxy 协议、`/api/health` 接入。
- 不覆盖 errors / reporter / metrics（后续任务）。
- 不修改 `/api/health` 现有响应字段（仅在 boundary 处包一层）；任何字段扩展留给 T50。

## 测试用例

### TC-T46-1（trace primitive）
- `runWithTrace('trace-id-A', () => getCurrentTraceId())` 返回 `'trace-id-A'`。
- 在 `runWithTrace` 外调用 `getCurrentTraceId()` 返回 `undefined`。
- 嵌套 `runWithTrace('A', () => runWithTrace('B', () => getCurrentTraceId()))` 返回 `'B'`，并且外层结束后 `getCurrentTraceId()` 返回 `undefined`。

### TC-T46-2（trace id 字符集）
- `isValidTraceId('abc-123_DEF')` → true。
- `isValidTraceId('  ')` → false。
- `isValidTraceId('a'.repeat(129))` → false。
- `isValidTraceId('a'.repeat(8))` → true（边界值）。

### TC-T46-3（logger 基本输出）
- 在 production 模式下，`logger.info('http.request.completed', { module: 'health', status: 200, durationMs: 12 })` 通过 in-memory transport 收集到一条记录，包含字段：`timestamp`、`level=info`、`event=http.request.completed`、`module=health`、`status=200`、`durationMs=12`、`traceId` 字段（无活跃 trace 时为 `'unknown'`）。
- 序列化后单行可被 `JSON.parse` 成功。

### TC-T46-4（logger level filtering）
- 当 level 设为 `warn`，`logger.info(...)` 被丢弃；`logger.warn(...)` 被记录。

### TC-T46-5（受控键集合白名单）
- `logger.info('e', { module: 'm', forbiddenKey: 'x' as never })`：被收集的记录中 `forbiddenKey` 不存在。
- 受控键里允许的 `workId / creatorId / postId` 等正常出现。

### TC-T46-6（log 体积截断 8 KiB + truncated 标记）
- 构造一个 `error.stack` 长度 > 16 KiB 的事件，断言序列化后总长度 ≤ 8 KiB 且包含 `truncated=true`。

### TC-T46-7（trace id 自动注入）
- 在 `runWithTrace('test-trace-1', () => logger.info('e', { module: 'm' }))` 内调用，断言收集的记录 `traceId === 'test-trace-1'`。

### TC-T46-8（wrapRouteHandler 主行为：trace id inheritance）
- 构造 Request `Request('http://x/y', { headers: { 'x-trace-id': 'walking-skeleton-001' } })`，调用 `wrapRouteHandler('health', innerHandler)(req)`：
  - innerHandler 内部 `getCurrentTraceId()` 返回 `'walking-skeleton-001'`
  - 响应头 `x-trace-id` 等于 `'walking-skeleton-001'`
  - in-memory logger 收到一条 `event=http.request.completed`、`module='health'`、`status=200`、`traceId='walking-skeleton-001'` 的事件

### TC-T46-9（wrapRouteHandler 边界：缺失 / 非法 x-trace-id）
- 缺失 header → wrapper 自动 `crypto.randomUUID()` 生成；响应头 `x-trace-id` 形如 `<uuid v4>`；logger 事件 `traceId` 与响应头同值；额外 ctx 字段 `traceIdSource='generated'`。
- 非法 header（例如 `x-trace-id: '   '` 或 `'a'`，长度 < 8）→ regenerate；ctx `traceIdSource='regenerated'`。

### TC-T46-10（wrapRouteHandler 失败路径）
- innerHandler throw → wrapper 重新抛出（保留行为）；logger 收到一条 `event=http.request.error` warn 级别事件，含 `traceId / status / errorClass`。

### TC-T46-11（health route 行为不变）
- 已有的两条 health route 测试（`returns runtime status when enabled` / `returns 503 when disabled`）继续通过；扩展断言响应头存在 `x-trace-id`（自动生成）。

## fail-first 顺序

1. 先写 trace.test.ts → 跑 → 红
2. 实现 trace.ts → 跑 → 绿
3. 写 logger.test.ts → 跑 → 红
4. 实现 logger.ts → 跑 → 绿
5. 写 server-boundary.test.ts → 跑 → 红
6. 实现 server-boundary.ts + init.ts + test-support.ts → 跑 → 绿
7. 修改 health route.ts 接入 wrapRouteHandler；扩展现有 health route.test.ts → 跑 → 绿
8. 新建 web/src/proxy.ts；编写最小集成测试覆盖 inbound trace id 行为（仅在 vitest 内导入 `proxy` 函数并构造 `NextRequest` mock；不启动 next dev）→ 绿
9. 跑 `npm run test`、`npm run typecheck`、`npm run lint`、`npm run build` 全绿

## 可测试性 (NFR-005)

- 全部断言通过 `createInMemoryLogger()` 收集事件；不使用真实 stdout 写入。
- 每个测试在 `beforeEach` 调用 `resetObservabilityForTesting()`，避免跨用例污染。

## 不在本任务测试范围

- `/api/metrics`（T48）
- AppError / reporter（T47）
- 现有 server action 接入（T49）
- env 字段扩展 + `/api/health` 字段扩展（T50）
- backup CLI（T51）
