## 结论

通过

## 上游已消费证据

- Task ID: `T17`（full profile；质量链补跑后的第二轮测试评审）
- 实现交接块 / 等价证据: `docs/verification/implementation-T17.md`（含与本次 rework 对齐的 RED 摘要与 `test + lint + build` 的 GREEN 说明）
- `ahe-bug-patterns` 记录: `docs/reviews/bug-patterns-T17.md`（`AI-BLINDSPOT-001`、`STATE-EMPTY-001`）
- 任务锚点: `docs/tasks/2026-04-06-homepage-discovery-enhancement-tasks.md`（`T17` 回归收口、空态与 Hero）
- `task-progress.md`: `Workflow Profile: full`，`Current Active Task: T17`
- `web/AGENTS.md`: 无 fail-first 例外授权；本轮依赖交接块中的可审计 RED 叙述 + 本地测试执行结果
- 已审阅测试资产（本轮 rework 核心）:
  - `web/src/features/home-discovery/resolver.order.test.ts`
  - `web/src/features/home-discovery/resolver.ts`
  - `web/src/features/home-discovery/home-discovery-section.test.tsx`
  - `web/src/app/page.discovery-regression.test.tsx`
- 抽样置信: `web/src/features/home-discovery/resolver.test.ts`、`web/src/app/page.test.tsx`（与上轮评审一致的规则层与真实 resolver  happy path 仍有效）

## 内部评分（0–10，供结论辅助）

| 维度 | 评分 | 说明 |
|---|---|---|
| fail-first 有效性 | 8 | `implementation-T17` 将 RED 锚定在「未遵循 `homeDiscoverySectionOrder`」与首页回归多用例下的清理问题，与上轮 `需修改` 原因一一对应；非「口头绿」 |
| 行为覆盖与验收映射 | 9 | 分区顺序与配置单一来源、三类 `kind` 的壳 + 空态文案在组件级与首页级（mock 分区数据）均有参数化覆盖 |
| 风险覆盖与边界覆盖 | 8 | `AI-BLINDSPOT-001` 由 `resolver.order.test.ts` + `resolveHomeDiscoverySections` 对 `homeDiscoverySectionOrder` 的遍历闭合；`STATE-EMPTY-001` 由 `test.each` 对 `works` / `profiles` / `opportunities` 闭合 |
| 测试设计质量 | 8 | 断言以可见文案、标题、链接为主；首页回归仍 mock resolver，与专门顺序单测分工明确 |
| 下游代码评审准备度 | 8 | 测试链可支撑代码评审聚焦实现细节，而不再承担「无 RED、无顺序锚点、空态路径不全」的主要怀疑 |

## 发现项

- [minor] **首页发现回归仍依赖 resolver mock**：`page.discovery-regression.test.tsx` 不执行真实 `resolveHomeDiscoverySections()`；「真实样本数据下三区全空」的页面联调路径仍未单测覆盖，风险由 `resolver.test.ts` 与各分区空 section 构造间接吸收，属可接受的残余盲区。
- [minor] **顺序用例仅覆盖一种自定义排列**：`resolver.order.test.ts` 使用 `["profiles","works","opportunities"]` 证明配置驱动顺序；未枚举其他排列或异常配置，对当前静态单一顺序源需求足够。

## 测试 ↔ 行为映射

- **`resolveHomeDiscoverySections()` 输出顺序与 `homeDiscoverySectionOrder` 一致** → `resolver.order.test.ts`（`vi.doMock("./config")` 下断言 `kind` 序列）
- **实现层按配置顺序编排** → `resolver.ts` 中 `homeDiscoverySectionOrder.map((kind) => sectionResolvers[kind]())`
- **三类分区空壳 + 按 `kind` 的空态文案** → `home-discovery-section.test.tsx`（`test.each` 覆盖 `works` / `profiles` / `opportunities`）
- **首页 Hero 不退化 + 某区空时仍可见对应空态 + 非空区链接仍可用** → `page.discovery-regression.test.tsx`（`test.each` 参数化 `emptyKind`）
- **分区 resolver 规则（精选/兜底/去重/空分区）** → `resolver.test.ts`（延续）
- **真实数据路径下首页链接与 Hero** → `page.test.tsx`（延续）

## 测试质量缺口

- 可选增强：在不做大范围改造的前提下，增加「缩小版样本或临时注入」驱动的首页测试，覆盖真实 resolver 下三区同时为空时的页面输出（非本轮阻塞）。
- 运营后台、个性化推荐等非本轮范围能力仍无测试覆盖（与 `implementation-T17` 声明一致）。

## 给 `ahe-code-review` 的提示

- **已可信的测试结论**：配置驱动的分区顺序已有直接单测锚点；`STATE-EMPTY-001` 在组件与首页两条路径上均已参数化关闭；全量 `vitest` 在本评审执行时为 22 文件 / 43 测试通过（与交接块一致的可复制验证方式）。
- **仍可重点扫一眼的实现点**：`sectionCopy`（resolver）与页面传入的 `title`/`description` 在 mock 回归中与生产是否长期一致（当前空态文案由 `HomeDiscoverySection` 的 `emptyStateCopyByKind` 决定，与 mock 标题解耦）。

## 下一步

- `通过`：`ahe-code-review`

## 记录位置

- `docs/reviews/test-review-T17.md`
