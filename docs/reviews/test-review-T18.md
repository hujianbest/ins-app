## 结论

通过

## 上游已消费证据

- Task ID: `T18`
- 实现交接块 / 等价证据: `docs/verification/implementation-T18.md`
- `ahe-bug-patterns` 记录: `docs/reviews/bug-patterns-T18.md`
- 规格 / 设计 / 任务锚点: `docs/specs/2026-04-08-site-chinese-localization-srs.md`（`FR-001`、`FR-005`、`NFR-001` 等与首页/metadata 相关条款）、`docs/designs/2026-04-08-site-chinese-localization-design.md`（§7.1 ~ §7.3、§9.2）、`docs/tasks/2026-04-08-site-chinese-localization-tasks.md`（`T18` 测试设计种子与验证命令）
- `task-progress.md`: `Workflow Profile: full`，`Current Active Task: T18`，上游阶段为缺陷模式排查已通过
- `web/AGENTS.md`: Next.js 本地文档约定；未声明与本任务冲突的 fail-first 例外
- 本评审复验命令（fresh GREEN）: `npm run test -- src/app/page.test.tsx src/app/page.discovery-regression.test.tsx src/features/home-discovery/home-discovery-section.test.tsx` → `3` 个测试文件、`8` 个测试全部通过（Vitest v4.1.2）

## 发现项

- [minor] `page.test.tsx` 中第二个用例通过 `readFileSync` 断言 `page.tsx` 未内联 `featuredPaths`、`layout.tsx` 含 `lang="zh-CN"` 与中文字符串，对「用户可见行为」与「源码结构」有一定耦合；若未来重构数据注入方式，可能需要同步调整该用例，但不削弱当前对根布局与数据源边界的防护价值。
- [minor] `page.discovery-regression.test.tsx` 对 `resolveHomeDiscoverySections` 使用 mock，属于为可控空态回归而做的有意识的隔离；与真实 resolver + `sample-data` 的集成路径由首页主测试与实现交接块中的 GREEN 说明承接，`ahe-code-review` 仍可抽查 resolver 与页面接线是否与中文化一致。

## 测试 ↔ 行为映射

- 首页主标题保留品牌 `Lens Archive`、精选入口与三大发现分区标题为中文、精选卡片链接 `href` 正确、去除默认 Next.js 占位文案 → `web/src/app/page.test.tsx`（首个用例）
- 根布局 `lang="zh-CN"`、metadata 中文描述（及与页面数据源边界相关的静态断言）→ `web/src/app/page.test.tsx`（第二个用例）
- 某一分区为空时 Hero 仍在、对应中文空态可见、非空分区卡片与链接仍正确 → `web/src/app/page.discovery-regression.test.tsx`（参数化 3 场景）
- 发现分区壳层：分区标题、说明、空态中文 copy → `web/src/features/home-discovery/home-discovery-section.test.tsx`（参数化 3 `kind`）

## 测试质量缺口

- 全量 `npm run test && npm run lint && npm run build` 与浏览器三类路径验证属任务计划 `T21` 范围，不构成 `T18` 测试评审阻塞。
- 公开页 / 登录后页样本字段仍可能含英文，实现交接块已标明由 `T19` / `T20` 收口，当前测试套件不声称覆盖全站。

## 给 `ahe-code-review` 的提示

- 已可信的测试结论: 首页中文基线（Hero、精选入口、发现分区标题/空态、卡片层中文 badge/meta 与链接）与根布局 `lang` / 中文 `description` 已有可复现的渲染级与（局部）源码级断言；`bug-patterns` 中多来源 copy 漂移、metadata/lang 漏改、adapter 标签残留等风险在现有用例中有对应承接或已由交接块说明闭合。
- 仍需重点怀疑的实现风险: `readFile` 类断言与真实 DOM 断言的边界；mock 回归与生产路径一致性；`sample-data` 中非首页路径英文字段是否会在后续任务前被误用为「已中文化」依据。

## 内部维度评分（0–10，评审用）

- fail-first 有效性: 9（交接块 RED/GREEN 叙述与当前复跑 GREEN 一致）
- 行为覆盖与验收映射: 9（`T18` 种子与 `FR-001` / 设计 §7.1~7.3 对齐；`FR-005` 的描述层已由中文 description 断言覆盖，title 保留品牌名符合规格允许范围）
- 风险覆盖与边界覆盖: 9（`bug-patterns` 中 important 级模式有测试锚点）
- 测试设计质量: 8（存在 minor 级别的源码耦合与 mock 边界说明即可）
- 下游代码评审准备度: 9

## 下一步

- `通过`：`ahe-code-review`

## 记录位置

- `docs/reviews/test-review-T18.md`
