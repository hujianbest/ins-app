## 变更摘要

- 变更摘要：用户确认现有“摄影社区轻量 MVP”无法满足上线目标，要求将当前站点重定为“可云端部署的综合摄影平台”，并按阶段 1 / 阶段 2 拆分交付。
- 当前 workflow profile / 当前阶段：`full` / `增量重定并进入阶段 1 实现`
- 当前判断：真实 increment

## 变更包

- New
  - 新增“Docker 云部署、环境变量契约、健康检查、真实账号 / 会话、安全种子内容”作为当前主线的硬性要求。
  - 新增“成熟的暗色杂志风界面、统一壳层、基础搜索、合作线索入口”作为阶段 1 首发范围。
  - 新增“运营后台、消息中心、支付 / 订单 / 会员”为明确阶段 2 backlog。
- Modified
  - 现有产品定位从“摄影社区轻量 MVP”升级为“综合摄影平台重发布”。
  - 现有运行时从“可本地演示”升级为“可 Docker 云端部署”。
  - 现有页面目标从“完成社区主线功能”升级为“完成成熟产品化表达与上线基线”。
- Deprecated
  - 以 demo 角色 cookie、隐式本地 SQLite 和 MVP 级页面表达作为当前主线交付基线的假设。
  - 原 `docs/specs/2026-04-08-photography-community-platform-srs.md`、`docs/designs/2026-04-08-photography-community-platform-design.md`、`docs/tasks/2026-04-08-photography-community-platform-tasks.md` 继续代表当前最高优先级主线的假设。

## 影响矩阵

- 受影响工件
  - `docs/specs/2026-04-08-photography-community-platform-srs.md`
  - `docs/designs/2026-04-08-photography-community-platform-design.md`
  - `docs/tasks/2026-04-08-photography-community-platform-tasks.md`
  - `task-progress.md`
  - `docs/skill_record.md`
  - `web/src/app/**`
  - `web/src/features/**`
- 失效的批准状态
  - 已批准的“摄影社区轻量 MVP”规格 / 设计 / 任务计划不再足以定义当前发布目标。
  - 旧完成证据只能作为代码基础和回归资产，不再代表“综合平台首发版”已完成。
- 失效的任务 / Active Task
  - 原主线已无合法 `Current Active Task`，需切换到新计划的 `T33`。
  - 旧 `T22` ~ `T32` 视为可复用历史实现，不再构成当前发布链的直接任务集合。
- 失效的测试设计 / 验证证据 / review 结论
  - 围绕轻量 MVP 的完成、回归与 finalize 证据不再足以宣告当前主线完成。
  - 旧页面测试和验证证据仍可复用，但需要服务于新版阶段 1 目标重新组织。
- 需重新派发的 reviewer / review 节点（如有）
  - 无硬性阻塞；用户已直接确认新版计划并要求立即实现。
- Profile 升级信号（如有）
  - 无新增升级；当前保持 `full` profile 仍合理。

## 同步更新项

- 新建综合平台重发布的规格、设计和任务计划。
- 更新 `task-progress.md`，把当前主线切换为新文档，并将唯一活跃任务锁定为 `T33`。
- 在 `docs/skill_record.md` 中记录本次 increment 与文档重定。
- 明确不做的内容
  - 当前不再沿用旧轻量 MVP 文档作为当前主线。
  - 当前不把阶段 2 backlog 混入阶段 1 的直接实现任务。

## 状态回流

- `Current Stage`: `阶段 1 实现中`
- `Workflow Profile`: `full`
- `Current Active Task`: `T33`
- `Pending Reviews And Gates`: `None`
- `Next Action Or Recommended Skill`: `ahe-test-driven-dev`
