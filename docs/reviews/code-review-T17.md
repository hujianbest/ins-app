## 结论

通过

## 上游已消费证据

- Task ID: `T17`（full profile；第二轮首页发现增强回流后的代码评审）
- 实现交接块 / 等价证据: `docs/verification/implementation-T17.md`（含顺序与空态 rework 的 RED/GREEN 叙述与触碰文件列表）
- `ahe-test-review` 记录: `docs/reviews/test-review-T17.md`（结论：通过）
- `ahe-bug-patterns` 记录: `docs/reviews/bug-patterns-T17.md`（`AI-BLINDSPOT-001`、`STATE-EMPTY-001`；顺序与空态风险已由实现与测试闭合）
- 任务 / 设计锚点: `docs/tasks/2026-04-06-homepage-discovery-enhancement-tasks.md`（`T17`）、`docs/designs/2026-04-06-homepage-discovery-enhancement-design.md`（§7.x、§9.4、§11）
- `task-progress.md`: `Workflow Profile: full`，`Current Active Task: T17`，`Next Action Or Recommended Skill: ahe-code-review`
- `web/AGENTS.md`: Next.js 本地文档约束；无与本模块冲突的额外分层规则
- 已审阅实现: `web/src/features/home-discovery/types.ts`、`config.ts`、`adapters.ts`、`resolver.ts`、`home-discovery-section.tsx`、`web/src/app/page.tsx`
- 已抽样测试: `resolver.order.test.ts`、`resolver.test.ts`、`home-discovery-section.test.tsx`、`page.discovery-regression.test.tsx`

## 内部评分（0–10，供结论辅助）

| 维度 | 评分 | 说明 |
|---|---|---|
| 实现级正确性 | 8 | 精选优先、去重、按时间键兜底、空分区、三分区顺序均与设计与单测一致；时间排序依赖 `Date.parse`，在非法日期下行为未显式守卫，当前由受控样本数据吸收 |
| 局部设计一致性 | 9 | 编排集中在 `resolver`，页面只消费视图模型，分区 UI 无业务规则；分区顺序由 `homeDiscoverySectionOrder` 驱动，消除原先「配置有序、拼装手写序」的漂移 |
| 状态 / 错误 / 安全处理 | 8 | 服务端组件、无客户端状态与信任边界问题；无效精选位跳过、空数组早退为空态 section，路径合理 |
| 可读性与可维护性 | 8 | `sectionResolvers` + `map` 顺序清晰；`resolveSectionItems` 复用三分区逻辑，职责集中 |
| 下游追溯性评审准备度 | 8 | 实现可信度足以让追溯评审聚焦规格/设计/任务/证据链；交接块文末 `Next Action` 与最新测试评审结论略不同步，宜在追溯阶段校正文档而非阻塞本节点 |

## 发现项

- [minor] **`implementation-T17.md` 文末仍写 `Next Action Or Recommended Skill: ahe-test-review`**，而 `test-review-T17` 已通过；属工件同步问题，建议在 `ahe-traceability-review` 中核对并更新交接块，避免主链误读。
- [minor] **`getNewestTimestamp` 对不可解析日期返回 `NaN`**，可能影响排序稳定性；当前公开样本数据为受控 ISO 风格字符串，风险低，若未来接入脏数据可考虑回退键或显式校验。
- [minor] **`homeDiscoveryFeaturedSlots` 与 `homeDiscoverySectionOrder` 并存**：前者为配置聚合、后者为渲染序，语义不同但命名上可能被误读为「改数组即改顺序」；可在追溯或后续小改中加一行注释或收敛命名（非本轮阻塞）。

## 代码风险

- 首页发现回归用例 mock `resolveHomeDiscoverySections`，不覆盖「真实 resolver + 全样本下三区同时为空」的整页联调路径；与 `test-review-T17` 一致，列为可接受残余盲区，由 `resolver` 单测与组件测试间接支撑。
- Mock 分区 `title`/`description` 与生产 `sectionCopy` 文案不必逐字一致；空态可见文案由 `HomeDiscoverySection` 的 `emptyStateCopyByKind` 决定，与测试评审结论一致。

## 给 `ahe-traceability-review` 的提示

- 建议核对：`FR-001`～`FR-005`、设计 §9.4 空态与 §11 测试策略与当前实现及 `T17` 证据索引是否一致；并修正 `implementation-T17.md` 与 `task-progress.md` 中可能滞后的「下一阶段 skill」叙述（若父会话尚未同步）。
- 已可信边界：三分区卡片 `href` 由 adapters 统一；分区渲染顺序服从 `homeDiscoverySectionOrder`；Hero 与发现区分属两段布局，符合 `FR-005`。

## 下一步

- `ahe-traceability-review`

## 记录位置

- `docs/reviews/code-review-T17.md`
