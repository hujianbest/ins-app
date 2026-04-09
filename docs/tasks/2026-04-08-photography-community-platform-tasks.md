# 摄影社区平台任务计划

- 状态: 已批准
- 主题: 摄影社区平台（轻量 MVP）
- 输入规格: `docs/specs/2026-04-08-photography-community-platform-srs.md`
- 输入设计: `docs/designs/2026-04-08-photography-community-platform-design.md`
- 关联评审: `docs/reviews/tasks-review-photography-community-platform.md`
- 当前活跃任务: `None`

## 1. 概述

本计划面向“摄影社区平台（轻量 MVP）”主线，目标是在不重做既有公开路由的前提下，把当前 `web` 应用从“作品展与约拍平台”推进到“社区首页 + 发现页 + 创作者主页 + 作品发布 + 关注 / 评论”的可实现任务序列。

本轮任务拆解遵循以下原则：

- 优先把高风险的持久化、会话与读写边界收口，再推进页面层改造，避免继续把样本数据和 cookie 逻辑扩散为社区真源。
- 先打通 repository 与公开读取面，再推进 `studio` 写路径，最后补齐关注、评论和次级模块回归。
- 任何时刻只允许一个权威 `Current Active Task`，但该值只能在本计划通过评审并完成人类确认后写回 `task-progress.md`。
- 为避免与已暂停的中文化链 `T19` ~ `T21` 冲突，本计划从 `T22` 开始继续编号。

## 2. 里程碑

### M1 社区领域与运行时基线

- 目标: 建立社区领域模型、repository 契约、会话 / 权限边界与首期 SQLite 持久化基线。
- 包含任务: `T22` `T23` `T24`
- 退出标准: 社区核心实体、repository 接口、`AccessControl` 与 `SQLite` 适配器已存在，且样本数据可作为迁移种子而不是社区动态状态真源。
- 依据: `FR-001`、`FR-005`、`FR-007`、`NFR-002`、设计 §5.3 ~ §5.4、§7.1、§9.1 ~ §9.4

### M2 公共浏览与社区发现面

- 目标: 将公开主页、作品详情、首页与新发现页切到社区主线的读模型与编排逻辑。
- 包含任务: `T25` `T26`
- 退出标准: 访客可从首页进入社区化内容面，并通过 `/discover` 持续浏览 `精选`、`最新` 以及稳定渲染的 `关注中 / 空态` 分区；创作者主页与作品详情仅消费已发布内容。
- 依据: `FR-002`、`FR-003`、`FR-004`、`FR-005`、`NFR-001`、`NFR-004`、设计 §7.2 ~ §7.4、§8.1、§9.3

### M3 创作者写路径与社区互动

- 目标: 打通 `studio` 内的资料 / 作品写路径，并补齐关注与评论两条社区互动链路。
- 包含任务: `T27` `T28` `T29` `T30`
- 退出标准: 创作者可在 `studio` 中维护公开资料和作品草稿 / 发布状态；登录成员可关注创作者，并在作品详情页发表评论。
- 依据: `FR-001`、`FR-004`、`FR-005`、`FR-006`、设计 §7.1、§7.2、§7.3、§7.5、§8.2、§8.3、§9.4

### M4 次级合作模块保留与回归收口

- 目标: 确保模特主页、约拍诉求和站内联系继续可用，同时用回归验证确认社区主线切换没有破坏既有公开路径。
- 包含任务: `T31` `T32`
- 退出标准: 次级合作模块仍可访问和联系，但不再占据社区首页主叙事；自动化验证与关键路径回归证据齐备。
- 依据: `FR-002`、`FR-007`、`FR-008`、`NFR-003`、`NFR-004`、`NFR-005`、设计 §7.6、§10.5、§11、§12.1

## 3. 文件 / 工件影响图

- 新增: `docs/tasks/2026-04-08-photography-community-platform-tasks.md`
- 修改: `task-progress.md`
- 修改: `docs/skill_record.md`
- 后续评审新增: `docs/reviews/tasks-review-photography-community-platform.md`
- 可能修改: `web/package.json`（首期 SQLite 或等价嵌入式 SQL 依赖）
- 可能新增: `web/src/app/discover/page.tsx`
- 可能新增: `web/src/app/discover/page.test.tsx`
- 可能新增: `web/src/features/community/*`
- 可能新增: `web/src/features/social/*`
- 可能新增: `web/src/features/auth/access-control.ts`
- 修改: `web/src/features/auth/session.ts`
- 修改: `web/src/features/auth/actions.ts`
- 修改: `web/src/features/showcase/types.ts`
- 修改: `web/src/features/showcase/sample-data.ts`
- 修改: `web/src/features/showcase/profile-showcase-page.tsx`
- 修改: `web/src/features/home-discovery/config.ts`
- 修改: `web/src/features/home-discovery/types.ts`
- 修改: `web/src/features/home-discovery/resolver.ts`
- 修改: `web/src/features/home-discovery/home-discovery-section.tsx`
- 修改: `web/src/app/page.tsx`
- 修改: `web/src/app/photographers/[slug]/page.tsx`
- 修改: `web/src/app/models/[slug]/page.tsx`
- 修改: `web/src/app/works/[workId]/page.tsx`
- 修改: `web/src/app/studio/profile/page.tsx`
- 修改: `web/src/app/studio/works/page.tsx`
- 修改: `web/src/app/opportunities/page.tsx`
- 修改: `web/src/app/opportunities/[postId]/page.tsx`
- 修改: `web/src/features/contact/actions.ts`
- 修改: 相关测试文件，例如 `web/src/app/*.test.tsx`、`web/src/features/home-discovery/*.test.ts`、新增 `web/src/features/community/*.test.ts` 与 `web/src/features/social/*.test.ts`
- 后续完成时修改: `RELEASE_NOTES.md`

## 4. 需求与设计追溯

| 需求 / 设计锚点 | 落地任务 |
|---|---|
| `FR-001` 账号与访问控制 | `T22` `T23` `T27` `T28` `T29` `T30` `T32` |
| `FR-002` 首页社区化 | `T25` `T26` `T31` `T32` |
| `FR-003` 发现页与公共浏览 | `T25` `T26` `T29` `T32` |
| `FR-004` 创作者主页 | `T25` `T27` `T29` `T32` |
| `FR-005` 作品发布与作品详情 | `T22` `T24` `T25` `T28` `T32` |
| `FR-006` 关注与评论 | `T29` `T30` `T32` |
| `FR-007` 人工精选维护 | `T24` `T26` `T31` `T32` |
| `FR-008` 次级合作模块保留 | `T31` `T32` |
| `NFR-001` 图片优先体验 | `T25` `T26` `T31` `T32` |
| `NFR-002` 公开浏览低门槛 | `T25` `T26` `T29` `T30` `T32` |
| `NFR-003` MVP 范围收敛 | `T22` `T24` `T26` `T31` `T32` |
| `NFR-005` 桌面端 / 移动端基本可用 | `T25` `T26` `T27` `T28` `T30` `T31` `T32` |
| 设计 §5.3 运行时与持久化策略 | `T22` `T23` `T24` |
| 设计 §5.4 实现排序约束 | `T22` `T23` `T24` `T25` `T26` `T27` `T28` `T29` `T30` `T31` `T32` |
| 设计 §7.1 `AccessControl` | `T23` `T27` `T28` `T29` `T30` |
| 设计 §7.2 `CreatorProfile` | `T25` `T27` `T29` |
| 设计 §7.3 `WorkPublishing` | `T25` `T28` `T30` |
| 设计 §7.4 `HomeDiscover` | `T25` `T26` `T29` |
| 设计 §7.5 `SocialGraph` | `T29` `T30` |
| 设计 §11 测试策略 | `T22` `T24` `T25` `T26` `T27` `T28` `T29` `T30` `T31` `T32` |

## 5. 任务拆解

### T22. 建立社区领域模型与 repository 契约

- 目标: 提炼社区主线的核心实体、公开 / 登录态读写契约与 repository 接口，为后续 SQLite 适配、公开读模型和 `studio` 写路径提供稳定边界。
- 依赖: 已批准规格与设计
- 触碰工件:
  - `web/src/features/community/*`
  - `web/src/features/showcase/types.ts`
  - `web/src/features/showcase/sample-data.ts`
  - `web/src/features/community/*.test.ts`
- 测试设计种子:
  - 主要行为: repository 契约能表达 `CreatorProfile`、`Work(draft|published)`、`FollowRelation`、`WorkComment`、`CuratedSlot` 等核心实体与查询。
  - 关键边界或负向场景: 公开读取接口不能泄漏草稿作品；`CuratedSlot` 需能表达 `home | discover` 两个 surface。
  - 字段定版规则: 若未出现新的批准输入，本轮最小作品字段集默认沿用当前 `showcase` 基线，只保留 `title`、`category`、`description`、`detailNote`、`coverAsset` 以及 `status / owner / timestamps` 所需字段，不在 `T22` 引入 EXIF、系列或额外元数据扩展。
  - fail-first 优先点: 先写 repository / entity 契约测试，证明当前直接读取 `sample-data` 的接口无法表达草稿隔离与人工精选 surface。
- 验证方式: 在 `web` 目录执行 `npm run test -- "src/features/community"`
- 预期证据: 新增社区领域 / 契约测试通过，且类型检查保持通过。
- 完成条件: 后续任务可通过稳定契约消费社区数据，不再把样本数据结构当成长期领域模型，且最小作品字段集在本轮已明确为“沿用现有 `showcase` 基线，不额外扩张”。

### T23. 建立 `SessionContext` 与 `AccessControl` 权限边界

- 目标: 在现有认证 cookie 之上形成统一的 `SessionContext`、`AccessControl`、`StudioGuard` 与 `CreatorCapabilityPolicy`，明确摄影师 / 模特两类主身份都具备社区创作者资格。
- 依赖: `T22`
- 触碰工件:
  - `web/src/features/auth/session.ts`
  - `web/src/features/auth/actions.ts`
  - `web/src/features/auth/types.ts`
  - `web/src/features/auth/access-control.ts`
  - `web/src/app/studio/page.tsx`
  - `web/src/app/studio/*.test.tsx`
  - 相关 `auth` 测试文件
- 测试设计种子:
  - 主要行为: 已登录 `摄影师` 与 `模特` 都能通过 `CreatorCapabilityPolicy` 获得主页维护与作品发布资格；未登录用户继续被 `StudioGuard` 拦截。
  - 关键边界或负向场景: 非法 cookie 值或缺失会话必须回落为未登录；权限判断不能把模特角色错误排除在创作者能力之外。
  - fail-first 优先点: 先补一条“模特主身份也可进入创作者发布路径”的权限测试，再补实现。
- 验证方式: 在 `web` 目录执行 `npm run test -- "src/features/auth" "src/app/studio/page.test.tsx"`
- 预期证据: 权限与会话相关测试通过，`studio` 守卫口径统一。
- 完成条件: 社区主线的发布、关注、评论与 `studio` 写路径可共享同一套权限判断，不再散落在页面级条件分支里。

### T24. 实现 SQLite repository 与样本种子桥接

- 目标: 为社区主线提供首个 concrete repository 实现，使用 SQLite 或等价嵌入式 SQL 存储承接动态状态，并把 `sample-data.ts` / `home-discovery/config.ts` 变为初始化种子而非运行时真源。
- 依赖: `T22` `T23`
- 触碰工件:
  - `web/package.json`
  - `web/src/features/community/*`
  - `web/src/features/home-discovery/config.ts`
  - `web/src/features/showcase/sample-data.ts`
  - `web/src/features/community/*.test.ts`
- 测试设计种子:
  - 主要行为: seed 过程能导入已发布作品、创作者资料与人工精选配置，并让 repository 返回稳定读结果。
  - 关键边界或负向场景: 无效精选目标应被跳过；草稿作品不得进入公开读取集合；SQLite 假设应被限制在单实例 / 本地开发的首期实现边界。
  - fail-first 优先点: 先补 repository adapter 测试，验证 seed 后公开读取只包含已发布作品且精选目标必须存在。
- 验证方式: 在 `web` 目录执行 `npm run test -- "src/features/community" && npm run build`
- 预期证据: repository adapter 与 seed 桥接测试通过，构建仍成功。
- 完成条件: 社区动态状态已有 repository-backed 真源，且 SQLite 首期部署假设已在实现注释或任务记录中明确。

### T25. 切换创作者主页与作品详情到 repository 读模型

- 目标: 将 `photographers` / `models` 主页与作品详情页改为消费 repository 读模型，并显式遵守“只有已发布作品公开可见”的规则。
- 依赖: `T24`
- 触碰工件:
  - `web/src/app/photographers/[slug]/page.tsx`
  - `web/src/app/models/[slug]/page.tsx`
  - `web/src/app/works/[workId]/page.tsx`
  - `web/src/features/showcase/profile-showcase-page.tsx`
  - `web/src/features/community/*`
  - `web/src/app/photographers/[slug]/page.test.tsx`
  - `web/src/app/models/[slug]/page.test.tsx`
  - `web/src/app/works/[workId]/page.test.tsx`
- 测试设计种子:
  - 主要行为: 访客可继续访问摄影师 / 模特主页与作品详情，但只会看到已发布作品；作品详情展示作者摘要与社区互动入口。
  - 关键边界或负向场景: 草稿作品不能通过公开主页、详情页或静态参数泄漏；作品不存在时仍返回 `notFound`。
  - fail-first 优先点: 先补一条“草稿作品不得公开访问”的页面测试，再迁移公开页数据来源。
- 验证方式: 在 `web` 目录执行 `npm run test -- "src/app/photographers/[slug]/page.test.tsx" "src/app/models/[slug]/page.test.tsx" "src/app/works/[workId]/page.test.tsx"`
- 预期证据: 公开主页与作品详情相关测试在 repository 读模型下通过。
- 完成条件: 社区公开读取面已经脱离对原始 `sample-data` 的直接依赖，只保留次级模块兼容用种子数据。

### T26. 实现社区首页与 `/discover` 浏览面

- 目标: 把首页切换为社区主线编排，并新增 `/discover` 页面，稳定承接 `精选`、`最新` 与可渲染的 `关注中 / 空态` 分区，同时把次级合作入口降级为 teaser。
- 依赖: `T24` `T25`
- 触碰工件:
  - `web/src/app/page.tsx`
  - `web/src/app/discover/page.tsx`
  - `web/src/features/home-discovery/config.ts`
  - `web/src/features/home-discovery/types.ts`
  - `web/src/features/home-discovery/resolver.ts`
  - `web/src/features/home-discovery/home-discovery-section.tsx`
  - `web/src/app/page.test.tsx`
  - `web/src/app/page.discovery-regression.test.tsx`
  - `web/src/app/discover/page.test.tsx`
  - `web/src/features/home-discovery/*.test.ts`
- 测试设计种子:
  - 主要行为: 首页首屏与主内容区优先展示作品 / 创作者 / 发现入口；`/discover` 可浏览 `精选` 与 `最新`，并为登录态的 `关注中` 保留稳定区域。
  - 关键边界或负向场景: 未登录用户访问 `/discover` 时不应被阻断；当尚无 follow 数据时，`关注中` 应输出稳定空态而不是报错；约拍入口不得回到首页主视觉。
  - fail-first 优先点: 先补首页和 `/discover` 渲染断言，证明当前首页文案与入口仍偏向展示 / 约拍，再补社区化编排。
- 验证方式: 在 `web` 目录执行 `npm run test -- "src/app/page.test.tsx" "src/app/page.discovery-regression.test.tsx" "src/app/discover/page.test.tsx" "src/features/home-discovery"`
- 预期证据: 首页 / 发现页相关渲染与 resolver 测试通过。
- 完成条件: 访客已可通过首页和 `/discover` 持续浏览社区主线内容，且次级模块在编排中被明确降级。

### T27. 切换 `studio/profile` 到 repository 写路径

- 目标: 将 `studio/profile` 切换到 Server Actions + repository 写入，形成创作者公开资料维护的独立闭环，而不把资料维护与作品发布混成一个大任务。
- 依赖: `T23` `T24` `T25`
- 触碰工件:
  - `web/src/app/studio/profile/page.tsx`
  - `web/src/features/community/*`
  - `web/src/features/auth/access-control.ts`
  - `web/src/app/studio/profile/page.test.tsx`
- 测试设计种子:
  - 主要行为: 创作者可保存公开资料，公开主页在后续读取中能看到最新资料。
  - 关键边界或负向场景: 未登录用户仍被 `StudioGuard` 拦截；资料更新不应破坏摄影师 / 模特两类主页路由。
  - fail-first 优先点: 先补 `studio/profile` 写路径测试，锁定资料保存后公开主页读取结果的契约。
- 验证方式: 在 `web` 目录执行 `npm run test -- "src/app/studio/profile/page.test.tsx" "src/app/photographers/[slug]/page.test.tsx" "src/app/models/[slug]/page.test.tsx"`
- 预期证据: `studio/profile` 与公开主页资料读取相关测试通过。
- 完成条件: 创作者公开资料维护已有独立、可验证的 repository 写路径。

### T28. 切换 `studio/works` 到草稿 / 发布写路径

- 目标: 将 `studio/works` 切换到 Server Actions + repository 写入，形成作品草稿、发布、已发布再编辑与显式回退草稿的闭环。
- 依赖: `T23` `T24` `T25` `T27`
- 触碰工件:
  - `web/src/app/studio/works/page.tsx`
  - `web/src/features/community/*`
  - `web/src/features/auth/access-control.ts`
  - `web/src/app/studio/works/page.test.tsx`
  - `web/src/app/works/[workId]/page.test.tsx`
- 测试设计种子:
  - 主要行为: 创作者可创建作品草稿、发布作品，并继续编辑已发布作品。
  - 关键边界或负向场景: 草稿作品不得进入公开面；已发布作品编辑后默认保持公开可见，只有显式切回草稿才退出公开面；若图片上传能力尚未到位，本轮只要求 `coverAsset` 引用与公开展示链路稳定，不扩展上传系统本身。
  - fail-first 优先点: 先补 `studio/works` 写路径测试，锁定草稿不可见、已发布作品编辑后仍公开可见，以及显式回退草稿时退出公开面的契约。
- 验证方式: 在 `web` 目录执行 `npm run test -- "src/app/studio/works/page.test.tsx" "src/app/works/[workId]/page.test.tsx"`
- 预期证据: `studio/works` 与作品公开可见性测试通过。
- 完成条件: 创作者主线中的“管理作品 -> 发布到公开面 -> 回退到草稿”链路形成独立、可验证闭环。

### T29. 实现关注关系与 `关注中` feed 接入

- 目标: 为创作者主页补齐关注 / 取消关注能力，并将 follow graph 接入 `/discover` 的 `关注中` 分区。
- 依赖: `T25` `T26` `T28`
- 触碰工件:
  - `web/src/features/social/*`
  - `web/src/app/photographers/[slug]/page.tsx`
  - `web/src/app/models/[slug]/page.tsx`
  - `web/src/app/discover/page.tsx`
  - 必要时 `web/src/features/home-discovery/resolver.ts`
  - `web/src/app/photographers/[slug]/page.test.tsx`
  - `web/src/app/models/[slug]/page.test.tsx`
  - `web/src/app/discover/page.test.tsx`
  - `web/src/features/social/*.test.ts`
- 测试设计种子:
  - 主要行为: 已登录成员可关注 / 取消关注创作者，`/discover` 中的 `关注中` 分区可消费 follow graph。
  - 关键边界或负向场景: 未登录用户触发关注应被引导登录；未关注任何创作者时，`关注中` 分区应稳定显示空态。
  - fail-first 优先点: 先补关注动作与 `关注中` 分区的状态测试，再补 follow graph 实现。
- 验证方式: 在 `web` 目录执行 `npm run test -- "src/features/social" "src/app/photographers/[slug]/page.test.tsx" "src/app/models/[slug]/page.test.tsx" "src/app/discover/page.test.tsx"`
- 预期证据: 关注动作与 discover follow feed 相关测试通过。
- 完成条件: 社区关系链中的“浏览创作者 -> 关注 -> 在发现页看见已关注内容”最小闭环成立。

### T30. 实现作品评论与详情页评论区

- 目标: 在作品详情页补齐纯文本评论能力，使用 `CommentService` 统一承接校验、写入与最新优先读取，避免把验证逻辑拆成平行任务。
- 依赖: `T25` `T28`
- 触碰工件:
  - `web/src/features/social/*`
  - `web/src/app/works/[workId]/page.tsx`
  - `web/src/app/works/[workId]/page.test.tsx`
  - `web/src/features/social/*.test.ts`
- 测试设计种子:
  - 主要行为: 已登录成员可提交 `1..500` 字纯文本评论，详情页按最新优先展示评论列表。
  - 关键边界或负向场景: 空评论、超长评论与未登录评论都必须失败并给出明确用户可见反馈；首期不提供编辑 / 删除 / 举报 UI。
  - fail-first 优先点: 先补空值、超长和最新优先排序测试，再补评论区 UI 与 `CommentService`。
- 验证方式: 在 `web` 目录执行 `npm run test -- "src/features/social" "src/app/works/[workId]/page.test.tsx"`
- 预期证据: 评论验证、写入和作品详情页评论区测试通过。
- 完成条件: 作品详情页具备最小可用评论闭环，且评论校验边界已被自动化验证锁定。

### T31. 保留次级合作模块并完成社区降级编排

- 目标: 确保模特主页、约拍诉求与站内联系仍通过既有路径可用，同时把它们从首页与主导航核心叙事中稳定降级为次级模块。
- 依赖: `T26` `T28` `T29` `T30`
- 触碰工件:
  - `web/src/app/page.tsx`
  - `web/src/app/opportunities/page.tsx`
  - `web/src/app/opportunities/[postId]/page.tsx`
  - `web/src/features/contact/actions.ts`
  - 必要时 `web/src/app/models/[slug]/page.tsx`
  - `web/src/app/opportunities/page.test.tsx`
  - `web/src/app/opportunities/[postId]/page.test.tsx`
  - `web/src/features/contact/actions.test.ts`
  - 首页 / 发现页相关回归测试
- 测试设计种子:
  - 主要行为: `/models/[slug]`、`/opportunities`、`/opportunities/[postId]` 与站内联系保持可用；首页仅以次级入口承接合作模块。
  - 关键边界或负向场景: 次级模块不能重新占据首页首屏或主导航核心；直接访问旧路径仍必须成功。
  - fail-first 优先点: 先补首页回归断言与诉求 / 联系链路测试，证明社区化后旧合作路径没有被误删或抬升。
- 验证方式: 在 `web` 目录执行 `npm run test -- "src/app/page.discovery-regression.test.tsx" "src/app/opportunities/page.test.tsx" "src/app/opportunities/[postId]/page.test.tsx" "src/features/contact/actions.test.ts"`
- 预期证据: 次级模块回归测试与联系动作测试通过。
- 完成条件: 合作模块完成“保留但降级”的产品目标，不再与社区主线并列竞争首页位置。

### T32. 完成社区 MVP 回归与实现证据收口

- 目标: 用全量自动化验证和关键路径回归确认社区主线切换未破坏既有功能，并为后续质量链提供 fresh evidence。
- 依赖: `T31`
- 触碰工件:
  - 相关测试文件
  - `task-progress.md`
  - `RELEASE_NOTES.md`
  - 后续验证 / review 工件
- 测试设计种子:
  - 主要行为: 首页、`/discover`、创作者主页、作品详情、`studio/works`、模特主页和诉求页都在最新实现上保持可访问和行为稳定。
  - 关键边界或负向场景: 草稿作品不可公开访问；未登录关注 / 评论被正确拦截；次级合作路径未失效；构建不因新持久化层和 Server Actions 失败。
  - fail-first 优先点: 若前序任务遗漏了关键路径断言，应在本任务先补一条最小回归测试，再修实现。
- 验证方式: 在 `web` 目录执行 `npm run test && npm run lint && npm run build`
- 预期证据: 当前最新代码状态下，全量测试、lint 与构建全部通过，并有可回指到社区主线路径的最新验证记录。
- 完成条件: 本轮实现具备进入质量链与完成门禁的基础验证证据。

## 6. 依赖与关键路径

- `T22 -> T23 -> T24 -> T25`
- `T25 -> T26`
- `T25 -> T27 -> T28`
- `T26 + T28 -> T29`
- `T25 + T28 -> T30`
- `T26 + T28 + T29 + T30 -> T31`
- `T31 -> T32`
- `T26` 与 `T27 -> T28` 构成两条主要并行边界：前者负责社区浏览面，后者负责创作者写路径；`T29` 之后再汇合到社区互动与次级模块回归。
- 关键路径为“领域契约 -> 权限边界 -> SQLite 真源 -> 公开读模型 -> 首页 / 发现 + 创作者写路径 -> 关注 / 评论 -> 次级模块回归 -> 全量验证”
- `T24` 是首个高风险持久化任务，因为它决定社区状态是否真正脱离 `sample-data + cookie`

## 7. 完成定义与验证策略

- 每个任务都必须给出可运行的验证方式，而不是只用页面描述代替证据。
- 公开读取与写路径任务优先采用 fail-first：先补契约 / 页面测试，再补实现。
- `T24` 之后，新的社区动态状态不得继续以 cookie 作为最终真源；cookie 只允许保留在兼容互动或旧模块过渡路径中。
- `T30` 中的评论校验应视为 `CommentService` 内部策略，不应在任务拆解时再平行拆出一个独立实现任务。
- `T32` 只负责回归与 fresh evidence，不替代后续 `ahe-bug-patterns`、`ahe-test-review`、`ahe-code-review`、`ahe-traceability-review`、`ahe-regression-gate`、`ahe-completion-gate` 的正式质量链。
- 本计划中的验证命令默认都在 `web` 目录执行；在当前 Windows / PowerShell 环境下，Vitest 路径参数优先使用带引号的文件或目录参数，避免 shell 对 glob 的展开差异。
- 编码前仍需遵守 `web/AGENTS.md` 的约束，先查阅 `node_modules/next/dist/docs/` 中与 `Server Components`、`Server Actions`、路由和数据读取相关的 Next.js 16 文档。

## 8. 当前活跃任务选择规则

- 只有在本计划通过 `ahe-tasks-review` 并完成任务真人确认后，才从本计划中选定唯一 `Current Active Task`。
- 默认从依赖已满足且编号最小的未完成任务开始。
- 若某任务被评审、测试或后续质量门禁打回，则保持该任务为唯一活跃任务，直至修复完成。
- 若出现上游工件变更导致任务边界失效，先回到 `ahe-workflow-router` 或相应上游节点，而不是强行切换到下一个任务。
- 当前计划建议的首个活跃任务为 `T22`。

## 9. 风险与顺序说明

- 当前代码对 `sample-data`、cookie 互动和静态页面耦合较深，因此 `T22` ~ `T24` 必须先做；否则后续页面层任务会把技术债再次放大。
- `/discover` 的 `关注中` 入口在 `T26` 可先以稳定分区 / 空态落位，真正接入 follow graph 则依赖 `T29`，任务顺序不能反过来。
- `T27` 与 `T28` 将创作者资料维护和作品发布拆成两条连续写路径，避免在一个任务里同时处理资料保存、草稿 / 发布与公开可见性三类变化。
- `T31` 必须显式验证旧 `/models`、`/opportunities` 和站内联系路径，因为这组能力被降级后最容易在社区化改版中被意外破坏。
- `T24` 中的 SQLite 方案默认只服务于首期单体 / 单实例落地；若实际部署前提不同，应在实现阶段尽早通过 repository 边界切换到托管数据库，而不是等到页面完成后再返工。

任务计划草稿已起草完成，下一步应派发独立 reviewer subagent 执行 `ahe-tasks-review`。

推荐下一步 skill: `ahe-tasks-review`
