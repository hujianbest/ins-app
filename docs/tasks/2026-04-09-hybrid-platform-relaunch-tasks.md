# 综合摄影平台重发布任务计划

- 状态: 阶段 1 已完成
- 主题: Hybrid Platform Relaunch
- 输入规格: `docs/specs/2026-04-09-hybrid-platform-relaunch-srs.md`
- 输入设计: `docs/designs/2026-04-09-hybrid-platform-relaunch-design.md`
- 当前活跃任务: `None（阶段 1 任务已全部完成）`

## 1. 概述

本计划面向“综合摄影平台重发布”阶段 1，目标是在保留当前 Next.js 单体与社区主线可复用资产的前提下，把现有轻量 MVP 升级为可 Docker 云部署、具备真实账号体系和成熟视觉壳层的综合摄影平台。

本轮任务拆解遵循以下原则：

- 先收口运行时、账号与部署边界，再推进大规模视觉改版。
- 先建立统一壳层和设计令牌，再逐页重构首页、发现页、创作者页、作品详情和工作台。
- 初始引流内容和安全种子数据单独成任务，避免在 UI 任务里顺手堆数据。
- 阶段 2 backlog 只做明确记录，不混入阶段 1 的实现任务。

## 2. 里程碑

### M1 生产运行时与账号基线

- 目标: 让站点具备容器化启动、环境变量契约、健康检查和真实账号 / 会话能力。
- 包含任务: `T33` `T34`
- 退出标准: Docker 启动路径清晰，环境变量可校验，真实账号与安全会话已替换 demo 登录。

### M2 全站壳层与发现体验

- 目标: 建立暗色杂志风设计系统和统一壳层，并重做首页、发现页与基础搜索。
- 包含任务: `T35` `T36`
- 退出标准: 核心公共页面具备统一壳层与成熟浏览路径，搜索入口可用。

### M3 创作者与发布主线

- 目标: 重做创作者主页、作品详情和工作台发布体验，并把互动与合作线索收成统一产品体验。
- 包含任务: `T37` `T38`
- 退出标准: 创作者公开面、作品详情、工作台和合作入口形成连贯闭环。

### M4 初始内容与阶段 2 收口

- 目标: 用安全来源的高质量种子内容提升首发观感，并把阶段 2 backlog 固定成清晰边界。
- 包含任务: `T39` `T40`
- 退出标准: 首发内容基线可用，阶段 2 能力边界已被显式记录。

## 3. 文件 / 工件影响图

- 新增: `docs/specs/2026-04-09-hybrid-platform-relaunch-srs.md`
- 新增: `docs/designs/2026-04-09-hybrid-platform-relaunch-design.md`
- 新增: `docs/tasks/2026-04-09-hybrid-platform-relaunch-tasks.md`
- 新增: `docs/reviews/increment-hybrid-platform-relaunch.md`
- 修改: `task-progress.md`
- 修改: `docs/skill_record.md`
- 预计新增: `Dockerfile`
- 预计新增: `.dockerignore`
- 预计新增: `web/.env.example`
- 预计新增: `web/src/config/*`
- 预计新增: `web/src/features/shell/*`
- 预计新增: `web/src/features/search/*`
- 预计新增: `web/src/features/leads/*`
- 预计新增: `web/src/app/search/page.tsx`
- 预计新增: `web/src/app/api/health/route.ts`
- 预计修改: `web/package.json`
- 预计修改: `web/next.config.ts`
- 预计修改: `web/src/features/community/sqlite.ts`
- 预计修改: `web/src/features/auth/*`
- 预计修改: `web/src/app/layout.tsx`
- 预计修改: `web/src/app/globals.css`
- 预计修改: `web/src/app/page.tsx`
- 预计修改: `web/src/app/discover/page.tsx`
- 预计修改: `web/src/features/home-discovery/*`
- 预计修改: `web/src/features/showcase/profile-showcase-page.tsx`
- 预计修改: `web/src/app/works/[workId]/page.tsx`
- 预计修改: `web/src/app/studio/*`
- 预计修改: `web/src/features/showcase/sample-data.ts`

## 4. 需求与设计追溯

| 需求 / 设计锚点 | 落地任务 |
|---|---|
| `FR-001` 账号与安全会话 | `T34` |
| `FR-002` Docker 部署与运行时基线 | `T33` |
| `FR-003` 全站壳层与视觉系统 | `T35` `T36` `T37` `T38` |
| `FR-004` 首页与发现页 | `T35` `T36` |
| `FR-005` 创作者主页与作品详情 | `T37` |
| `FR-006` 作品发布与资料维护 | `T34` `T38` |
| `FR-007` 社交互动 | `T37` `T38` |
| `FR-008` 基础搜索 | `T36` |
| `FR-009` 合作线索入口 | `T37` `T38` |
| `FR-010` 初始引流内容与精选维护 | `T39` |
| 设计 §4.2 运行时与部署策略 | `T33` |
| 设计 §4.4 身份与会话策略 | `T34` |
| 设计 §6.7 `features/leads` | `T37` `T38` |
| 设计 §8.1 环境变量契约 | `T33` |

## 5. 任务拆解

### T33. 建立生产运行时基线与 Docker 入口

- 目标: 为当前 Next.js 单体补齐 Dockerfile、`.dockerignore`、环境变量契约、健康检查和显式数据路径，让项目具备最小可部署形态。
- 依赖: 已确认规格与设计
- 触碰工件:
  - `Dockerfile`
  - `.dockerignore`
  - `web/.env.example`
  - `web/package.json`
  - `web/next.config.ts`
  - `web/src/config/*`
  - `web/src/app/api/health/route.ts`
  - 必要时 `web/src/features/community/sqlite.ts`
- 测试设计种子:
  - 主要行为: 缺失关键环境变量时启动前失败；健康检查可返回稳定状态；Docker 镜像可构建。
  - 关键边界或负向场景: SQLite 数据目录不存在时能显式创建或报出可理解错误；容器启动不应依赖开发命令。
  - fail-first 优先点: 先补环境变量校验与健康检查测试，再补实现。
- 验证方式:
  - 在 `web` 目录执行 `npm run test -- "src/config" "src/app/api/health"`
  - 在仓库根目录执行 Docker 构建冒烟
- 完成条件: 项目具备可读的生产运行时入口，不再只有 `next dev` 和本地默认路径假设。

### T34. 替换 demo 登录为真实账号 / 会话模型

- 目标: 用持久化账号与会话模型替换当前 demo 角色 cookie，并保持 `AccessControl` 作为统一权限边界。
- 依赖: `T33`
- 触碰工件:
  - `web/src/features/auth/*`
  - `web/src/features/community/sqlite.ts`
  - `web/src/app/login/page.tsx`
  - `web/src/app/register/page.tsx`
  - `web/src/app/studio/*.tsx`
  - 相关 `auth` 与页面测试
- 测试设计种子:
  - 主要行为: 注册、登录、登出、读取受保护页面的会话守卫全部可用。
  - 关键边界或负向场景: 错误密码、无效会话、非法 cookie、未登录访问 `studio` 必须失败或跳转。
  - fail-first 优先点: 先补登录 / 会话失败用例，再补持久化账号实现。
- 验证方式:
  - 在 `web` 目录执行 `npm run test -- "src/features/auth" "src/app/login/page.test.tsx" "src/app/register/page.test.tsx" "src/app/studio"`
- 完成条件: 账号体系已摆脱 demo 角色 cookie，受保护页面只消费真实会话。

### T35. 建立全站壳层、设计令牌与共享页面模块

- 目标: 把当前零散的公共页面重构为统一的暗色杂志风壳层，包括导航、页脚、页面容器、按钮层级和共享 section / card 模块。
- 依赖: `T33`
- 触碰工件:
  - `web/src/app/layout.tsx`
  - `web/src/app/globals.css`
  - `web/src/features/shell/*`
  - `web/src/app/layout.test.ts`
  - 必要时 `web/src/app/page.test.tsx`
- 测试设计种子:
  - 主要行为: 关键页面能渲染统一导航和页脚；主题令牌与主要入口在移动 / 桌面端都可用。
  - 关键边界或负向场景: 登录态与未登录态入口切换不应破坏导航；壳层引入后不能让已有页面首屏空白。
  - fail-first 优先点: 先补 layout 与全局导航断言，再补壳层实现。
- 验证方式:
  - 在 `web` 目录执行 `npm run test -- "src/app/layout.test.ts" "src/features/shell"`
- 完成条件: 首页、发现页、创作者页、作品详情和工作台都能在同一设计系统内稳定表达。

### T36. 重做首页、发现页并新增基础搜索

- 目标: 在统一壳层上重做首页和发现页的信息架构，并新增基础搜索页，让内容浏览路径从“单次跳转”升级为“持续发现”。
- 依赖: `T35`
- 触碰工件:
  - `web/src/app/page.tsx`
  - `web/src/app/discover/page.tsx`
  - `web/src/app/search/page.tsx`
  - `web/src/features/home-discovery/*`
  - `web/src/features/search/*`
  - `web/src/app/page.test.tsx`
  - `web/src/app/discover/page.test.tsx`
  - `web/src/app/search/page.test.tsx`
- 测试设计种子:
  - 主要行为: 首页具备成熟 hero 与浏览入口；发现页持续渲染精选 / 最新 / 关注中；搜索页返回作品 / 创作者 / 合作结果。
  - 关键边界或负向场景: 搜索无结果时稳定输出空态；未登录用户访问发现 / 搜索不得被阻断。
  - fail-first 优先点: 先补首页、发现页和搜索结果断言，再补重构实现。
- 验证方式:
  - 在 `web` 目录执行 `npm run test -- "src/app/page.test.tsx" "src/app/discover/page.test.tsx" "src/app/search/page.test.tsx" "src/features/home-discovery" "src/features/search"`
- 完成条件: 浏览路径已经从首页扩展为“首页 -> 发现 / 搜索 -> 创作者 / 作品”的成熟结构。

### T37. 重做创作者主页、作品详情与合作入口

- 目标: 把创作者主页和作品详情升级为成熟的公开内容页，并在两条路径中植入统一的合作入口和更完整的公开信息层级。
- 依赖: `T35` `T36`
- 触碰工件:
  - `web/src/features/showcase/profile-showcase-page.tsx`
  - `web/src/app/photographers/[slug]/page.tsx`
  - `web/src/app/models/[slug]/page.tsx`
  - `web/src/app/works/[workId]/page.tsx`
  - `web/src/features/leads/*`
  - 相关页面测试
- 测试设计种子:
  - 主要行为: 创作者主页和作品详情都能展示更完整摘要、互动和合作入口。
  - 关键边界或负向场景: 草稿作品仍不得通过公开页泄漏；合作入口提交非法数据时必须失败。
  - fail-first 优先点: 先补合作入口和新版公开层级断言，再补实现。
- 验证方式:
  - 在 `web` 目录执行 `npm run test -- "src/app/photographers/[slug]/page.test.tsx" "src/app/models/[slug]/page.test.tsx" "src/app/works/[workId]/page.test.tsx" "src/features/leads"`
- 完成条件: 公开创作者面和作品面具备统一品牌表达、互动区和合作线索入口。

### T38. 升级工作台发布体验并收口互动闭环

- 目标: 在真实账号体系和新版壳层上升级 `studio/profile`、`studio/works`、收藏 / 评论 / 关注等互动体验，形成可用的创作者工作流。
- 依赖: `T34` `T35` `T37`
- 触碰工件:
  - `web/src/app/studio/page.tsx`
  - `web/src/app/studio/profile/page.tsx`
  - `web/src/app/studio/works/page.tsx`
  - `web/src/features/community/*`
  - `web/src/features/social/*`
  - `web/src/features/engagement/*`
  - `web/src/app/studio/*.test.tsx`
  - 相关 social / engagement 测试
- 测试设计种子:
  - 主要行为: 创作者可维护资料、发布作品；成员可关注、评论、收藏；工作台在登录态下稳定可用。
  - 关键边界或负向场景: 未登录用户不得进入工作台；公开互动与发布状态不能互相污染。
  - fail-first 优先点: 先补工作台和互动闭环测试，再补页面和 action 重构。
- 验证方式:
  - 在 `web` 目录执行 `npm run test -- "src/app/studio" "src/features/social" "src/features/engagement"`
- 完成条件: 创作者主线和成员互动主线在同一产品体验下收口。

### T39. 导入安全高质量种子内容并重写样本数据基线

- 目标: 用授权图片 + 虚构资料重写首发样本和种子内容，提升首页、发现页、公开页面和搜索的首屏质量。
- 依赖: `T36` `T37`
- 触碰工件:
  - `web/src/features/showcase/sample-data.ts`
  - `web/src/features/home-discovery/config.ts`
  - 必要时 `web/src/features/community/sqlite.ts`
  - 相关展示与搜索测试
- 测试设计种子:
  - 主要行为: 种子数据拥有更高质量的图片、资料和精选关系；首页 / 发现 / 搜索能够稳定消费这些内容。
  - 关键边界或负向场景: 无效精选目标必须回退；种子内容应保留安全来源说明。
  - fail-first 优先点: 先补内容导入与精选解析断言，再补种子更新。
- 验证方式:
  - 在 `web` 目录执行 `npm run test -- "src/features/home-discovery" "src/features/community" "src/features/search"`
- 完成条件: 首发内容不再呈现为工程样本集合，而是具备真实浏览吸引力的引流基线。

### T40. 固定阶段 2 backlog 与首发交付边界

- 目标: 在阶段 1 实现完成后，把运营后台、消息中心、支付 / 订单、会员等能力明确收敛到阶段 2 backlog，并同步首发交付说明。
- 依赖: `T33` `T34` `T35` `T36` `T37` `T38` `T39`
- 触碰工件:
  - `docs/tasks/2026-04-09-hybrid-platform-relaunch-tasks.md`
  - `docs/designs/2026-04-09-hybrid-platform-relaunch-design.md`
  - `task-progress.md`
  - `RELEASE_NOTES.md`
- 测试设计种子:
  - 主要行为: 无直接代码行为；重点是收口边界和发布说明。
  - 关键边界或负向场景: 不得把阶段 2 能力误写成阶段 1 已交付。
  - fail-first 优先点: 无
- 验证方式:
  - 通过文档一致性检查与全量回归确认
- 完成条件: 阶段 1 的上线范围和阶段 2 的后续边界都有清晰书面定义。

## 6. 依赖与关键路径

- `T33 -> T34`
- `T33 -> T35`
- `T35 -> T36`
- `T35 + T36 -> T37`
- `T34 + T35 + T37 -> T38`
- `T36 + T37 -> T39`
- `T33 + T34 + T35 + T36 + T37 + T38 + T39 -> T40`

关键路径为“运行时基线 -> 真实账号 -> 设计系统 -> 首页 / 发现 / 搜索 -> 创作者与作品公开面 -> 工作台与互动 -> 安全种子内容 -> 阶段 2 边界收口”。

## 7. 完成定义与验证策略

- 每个任务都必须给出可运行的验证命令或可回指的运行时证据。
- 所有界面重构任务都优先采用 fail-first：先补页面或模块断言，再补实现。
- Docker 构建与启动冒烟是阶段 1 的硬性最低门槛之一。
- 真实账号 / 会话模型落地后，旧 demo 登录路径必须停止充当默认生产路径。
- 初始引流内容必须保留安全来源说明，避免把未知版权数据混入种子。

## 8. 当前活跃任务选择规则

- 当前默认从依赖已满足且编号最小的未完成任务开始。
- 当前计划的首个活跃任务为 `T33`，现已完成 `T33` 到 `T40`。
- 若某任务被测试、回归或实现问题打回，则保持该任务为唯一活跃任务直至修复完成。
- 阶段 2 backlog 不进入本轮活跃任务集合。

## 9. 阶段 2 backlog（非当前实现任务）

- 完整运营后台：精选维护、内容审核、账号与作品管理
- 线程式消息中心
- 支付 / 订单 / 会员
- 更完整的商业合作流程
- 更强搜索排序与独立检索能力

## 10. 首发交付边界（T40 收口）

### 阶段 1 已交付

- Docker 构建入口、运行时环境变量契约与 `/api/health` 健康检查
- 真实账号注册 / 登录 / 登出、安全会话 cookie 与 `studio` 守卫
- 暗色杂志风壳层、全站导航 / 页脚与统一页面模块
- 首页、发现页、搜索页、创作者主页、作品详情、工作台主线
- 关注、评论、合作私信入口与安全种子内容说明
- 基于授权图片 + 虚构资料的首发演示内容基线

### 明确不在阶段 1

- 精选维护 / 审核 / 账号治理等完整运营后台
- 线程式消息中心与更完整的站内通知系统
- 支付、订单、会员与商业结算链路
- 完整商业合作编排、报价、排期审批与合同流
- 更强排序、召回、搜索运营和独立检索服务
