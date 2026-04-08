# 网站全站中文化任务计划

- 状态: 已批准
- 主题: 网站全站中文化
- 输入规格: `docs/specs/2026-04-08-site-chinese-localization-srs.md`
- 输入设计: `docs/designs/2026-04-08-site-chinese-localization-design.md`
- 当前活跃任务: `T18`

## 1. 概述

本计划面向“网站全站中文化”增量，目标是在不改变现有路由结构和主要交互逻辑的前提下，完成首页、公开浏览链路、认证与登录后页面的中文化，并用测试与浏览器验证收口。

本轮任务拆解遵循以下原则：

- 优先按用户路径和文案来源边界拆分，而不是按“翻译所有文件”这种不可验证的大任务
- 先落根布局、首页与共享样本数据，再覆盖公开页和登录后页，最后统一做回归与浏览器验证
- 任务内需要同步修改测试断言，确保中文化有可运行证据
- 术语本轮固定为：`studio -> 工作台`、`profile -> 主页`

## 2. 里程碑

### M1 中文基线与首页入口

- 目标: 建立中文站点的根布局、首页与首页发现中文基线。
- 包含任务: `T18`
- 退出标准: `lang`、metadata、首页 Hero、精选入口、首页发现标题/空态及其测试已切换为中文。
- 依据: `FR-001`、`FR-005`、`NFR-001`、设计 §7.1 ~ §7.3、§9.2

### M2 公开浏览链路中文化

- 目标: 完成摄影师/模特主页、作品详情、诉求列表与诉求详情等公开路径中文化。
- 包含任务: `T19`
- 退出标准: 公开页主要标题、说明、按钮、联系入口和辅助提示为中文，且公开访问路径不变。
- 依据: `FR-002`、`FR-004`、`NFR-002`、设计 §7.2 ~ §7.4

### M3 认证与登录后页面中文化

- 目标: 完成登录/注册、工作台、作品管理、诉求管理、收件箱等登录后路径中文化。
- 包含任务: `T20`
- 退出标准: 登录入口、工作台和收件箱等关键登录后页面的标题、说明、表单字段、按钮和空态为中文。
- 依据: `FR-003`、`FR-004`、`NFR-001`、设计 §7.5 ~ §7.6

### M4 回归与浏览器验证收口

- 目标: 通过自动化验证与浏览器实际访问确认中文化结果可交付。
- 包含任务: `T21`
- 退出标准: `npm run test && npm run lint && npm run build` 通过，且首页、一个公开页、一个登录后页的浏览器验证完成。
- 依据: `FR-001` ~ `FR-005`、`NFR-003`、设计 §8.3、§11

## 3. 文件 / 工件影响图

- 修改: `docs/specs/2026-04-08-site-chinese-localization-srs.md`（仅用于批准状态与术语定版同步，非实现代码范围）
- 修改: `docs/designs/2026-04-08-site-chinese-localization-design.md`（仅用于批准状态与术语定版同步，非实现代码范围）
- 新增: `docs/tasks/2026-04-08-site-chinese-localization-tasks.md`
- 修改: `task-progress.md`
- 修改: `docs/skill_record.md`
- 修改: `RELEASE_NOTES.md`
- 修改: `web/src/app/layout.tsx`
- 修改: `web/src/app/page.tsx`
- 修改: `web/src/app/photographers/[slug]/page.tsx`
- 修改: `web/src/app/models/[slug]/page.tsx`
- 修改: `web/src/app/works/[workId]/page.tsx`
- 修改: `web/src/app/opportunities/page.tsx`
- 修改: `web/src/app/opportunities/[postId]/page.tsx`
- 修改: `web/src/app/login/page.tsx`
- 修改: `web/src/app/register/page.tsx`
- 修改: `web/src/app/studio/page.tsx`
- 修改: `web/src/app/studio/profile/page.tsx`
- 修改: `web/src/app/studio/works/page.tsx`
- 修改: `web/src/app/studio/opportunities/page.tsx`
- 修改: `web/src/app/inbox/page.tsx`
- 修改: `web/src/features/showcase/sample-data.ts`
- 修改: `web/src/features/showcase/profile-showcase-page.tsx`
- 修改: `web/src/features/home-discovery/resolver.ts`
- 修改: `web/src/features/home-discovery/home-discovery-section.tsx`
- 修改: `web/src/features/home-discovery/adapters.ts`
- 修改: `web/src/features/auth/auth-copy.ts`
- 修改: `web/src/features/auth/auth-entry-grid.tsx`
- 修改: 相关测试文件，例如 `web/src/app/*.test.tsx`、`web/src/features/home-discovery/*.test.tsx`

## 4. 需求与设计追溯

| 需求 / 设计锚点 | 落地任务 |
|---|---|
| `FR-001` 首页中文化 | `T18` `T21` |
| `FR-002` 公开浏览链路中文化 | `T19` `T21` |
| `FR-003` 认证与工作台中文化 | `T20` `T21` |
| `FR-004` 交互反馈与状态文案一致性 | `T19` `T20` `T21` |
| `FR-005` metadata 与品牌表达中文化 | `T18` `T21` |
| `NFR-001` 术语一致性与设计 §9.2 | `T18` `T19` `T20` |
| 设计 §7.1 根布局 / metadata / lang | `T18` |
| 设计 §7.2 ~ §7.4 首页、首页发现、公开主页 | `T18` `T19` |
| 设计 §7.5 ~ §7.6 认证与登录后页 | `T20` |
| 设计 §8.3 / §11 浏览器验证与回归 | `T21` |

## 5. 任务拆解

### T18. 建立中文根布局与首页文案基线

- 目标: 将根布局、首页 Hero、精选入口、首页发现标题/空态以及共享样本数据中的首页相关文案切换为中文，并同步对应测试。
- 依赖: 已批准规格与设计
- 触碰工件:
  - `web/src/app/layout.tsx`
  - `web/src/app/page.tsx`
  - `web/src/features/showcase/sample-data.ts`
  - `web/src/features/home-discovery/resolver.ts`
  - `web/src/features/home-discovery/home-discovery-section.tsx`
  - `web/src/features/home-discovery/adapters.ts`（若 badge 或卡片元信息需跟随首页中文术语一并调整）
  - 首页与首页发现相关测试
- 测试设计种子:
  - 主要行为: 首页渲染后，主标题、精选入口、发现分区标题与空态提示显示为中文；根布局使用中文 `lang` 与中文 metadata。
  - 关键边界或负向场景: 保留品牌名 `Lens Archive`，但页面主导语言不能仍是英文；空态分区文案应与中文分区标题保持一致。
  - fail-first 优先点: 先把首页与首页发现测试改为中文断言，确认当前实现失败，再补中文化实现。
- 验证方式: `npm run test -- src/app/page.test.tsx src/app/page.discovery-regression.test.tsx src/features/home-discovery/home-discovery-section.test.tsx`
- 预期证据: 首页相关测试在中文断言下通过。
- 完成条件: 根布局与首页的中文基线已建立，后续公开页和登录后页可以沿着同一术语继续推进。

### T19. 完成公开浏览链路中文化

- 目标: 将摄影师/模特主页、作品详情、诉求列表与诉求详情页中的主要标题、说明、按钮、空态和联系入口改为中文。
- 依赖: `T18`
- 触碰工件:
  - `web/src/features/showcase/sample-data.ts`
  - `web/src/features/showcase/profile-showcase-page.tsx`
  - `web/src/app/photographers/[slug]/page.tsx`
  - `web/src/app/models/[slug]/page.tsx`
  - `web/src/app/works/[workId]/page.tsx`
  - `web/src/app/opportunities/page.tsx`
  - `web/src/app/opportunities/[postId]/page.tsx`
  - 相关页面测试
- 测试设计种子:
  - 主要行为: 公开主页、作品详情与诉求详情中的关键标题、返回入口、联系入口与交互提示显示为中文。
  - 关键边界或负向场景: 游客仍可正常访问公开页；需要登录的点赞/联系动作只改提示文案，不改变跳转到 `/login` 的行为。
  - fail-first 优先点: 先更新公开页测试中的关键按钮/链接文案断言，再补中文实现。
- 验证方式: `npm run test -- src/app/photographers/[slug]/page.test.tsx src/app/models/[slug]/page.test.tsx src/app/works/[workId]/page.test.tsx src/app/opportunities/page.test.tsx src/app/opportunities/[postId]/page.test.tsx`
- 预期证据: 公开浏览路径测试在中文断言下通过。
- 完成条件: 公开浏览链路的主要可见文案已经中文化，且原有公开访问与跳转关系不变。

### T20. 完成认证、工作台与收件箱中文化

- 目标: 将登录/注册、工作台落点与子页面、收件箱中的主要标题、说明、按钮、表单字段、空态和操作提示改为中文，并固定术语“工作台”“主页”。
- 依赖: `T18`
- 触碰工件:
  - `web/src/features/auth/auth-copy.ts`
  - `web/src/features/auth/auth-entry-grid.tsx`
  - `web/src/app/login/page.tsx`
  - `web/src/app/register/page.tsx`
  - `web/src/app/studio/page.tsx`
  - `web/src/app/studio/profile/page.tsx`
  - `web/src/app/studio/works/page.tsx`
  - `web/src/app/studio/opportunities/page.tsx`
  - `web/src/app/inbox/page.tsx`
  - 相关页面测试
- 测试设计种子:
  - 主要行为: 登录/注册入口、工作台卡片导航、资料/作品/诉求管理页和收件箱主文案为中文。
  - 关键边界或负向场景: 未登录用户仍会被重定向到 `/login`；角色相关工作台标题仍随身份变化，只是文案变成中文。
  - fail-first 优先点: 先改 `studio`、登录/注册相关测试断言为中文，再补页面与 copy 实现。
- 验证方式: `npm run test -- src/app/login/page.test.tsx src/app/register/page.test.tsx src/app/studio/page.test.tsx src/app/studio/profile/page.test.tsx src/app/studio/works/page.test.tsx src/app/studio/opportunities/page.test.tsx src/app/inbox/page.test.tsx`
- 预期证据: 认证与登录后路径测试在中文断言下通过。
- 完成条件: 登录前后关键路径已统一使用“工作台”“主页”等固定中文术语。

### T21. 完成中文化回归与浏览器验证收口

- 目标: 用全量验证与浏览器实际访问确认中文化结果稳定可交付，并补齐发布与验证工件。
- 依赖: `T19` `T20`
- 触碰工件:
  - 相关测试文件
  - `docs/specs/2026-04-08-site-chinese-localization-srs.md`（如需在完成时补同步状态或引用）
  - `docs/designs/2026-04-08-site-chinese-localization-design.md`（如需在完成时补同步状态或引用）
  - `RELEASE_NOTES.md`
  - `task-progress.md`
  - 验证记录工件
- 测试设计种子:
  - 主要行为: 全站测试、lint、build 通过；首页、一个公开页、一个登录后页在浏览器中呈现中文主文案。
  - 关键边界或负向场景: 浏览器验证应覆盖未登录与已登录两类路径；若发现英文残留，应回流到对应实现任务修复。
  - fail-first 优先点: 若前序任务没有覆盖浏览器可见的关键中文标题，可补一条页面级回归断言后再修实现。
- 验证方式: `npm run test && npm run lint && npm run build`，随后启动本地应用并做浏览器验证。
- 预期证据: 自动化验证通过，且浏览器验证记录可回指首页、公开页与登录后页。
- 完成条件: 本轮中文化具备进入质量链与最终完成门禁的最新证据。

## 6. 依赖与关键路径

- `T18 -> T19 -> T21`
- `T18 -> T20 -> T21`
- 关键路径为“中文基线 -> 公开链路 / 登录后链路 -> 自动化与浏览器验证”
- `T18` 是首个活跃任务，因为它同时固化根布局、首页文案和全局术语基线

## 7. 完成定义与验证策略

- 每个任务都必须在对应页面或模块的关键中文断言下提供可运行证据，而不是只进行肉眼翻译
- 对于共享样本数据与页面内联 copy，需要同步更新测试断言，避免旧英文测试继续伪通过
- 进入 `T21` 前，首页、公开页和登录后页三类路径都应至少有一个测试入口承接中文化结果
- `T21` 必须补做浏览器验证，不允许只以单元测试代替

## 8. 当前活跃任务选择规则

- 只有在本计划通过评审并完成任务真人确认后，才从本计划中选定唯一 `Current Active Task`
- 默认从依赖已满足且编号最小的未完成任务开始
- 若某任务被评审、测试或浏览器验证打回，则保持该任务为唯一活跃任务，直至修复完成
- 当前计划建议的首个活跃任务为 `T18`

## 9. 风险与顺序说明

- 如果不先做 `T18`，公开页和登录后页会因共享样本数据与术语未收口而出现重复返工
- `T19` 与 `T20` 都会触碰测试文案，若不先按路径切分，容易在一次提交中混入过多页面变化
- 浏览器验证属于本轮显式验收要求，因此 `T21` 不能被自动化测试替代
- 根布局和 metadata 的中文化覆盖较隐蔽，需要在 `T18` 与 `T21` 都显式检查

任务计划已通过评审并获人类确认，当前应从 `T18` 进入 `ahe-test-driven-dev`。

推荐下一步 skill: `ahe-test-driven-dev`
