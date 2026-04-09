## 变更摘要

- 变更摘要：用户决定将产品方向从“摄影作品展与约拍平台”增量切换为“摄影社区 / 作品平台”，首期按轻量 MVP 推进；现有“模特 + 约拍诉求”能力保留，但降级为次级模块。
- 当前 workflow profile / 当前阶段：`full` / `主链实现中（ahe-test-driven-dev）`
- 当前判断：真实 increment

## 变更包

- New
  - 新增“摄影社区”作为当前产品主线，核心闭环从“展示 + 约拍 + 联系”调整为“发布作品 -> 被发现 -> 关注 / 评论 -> 持续创作”。
  - 新增首期轻量 MVP 范围：首页、发现、作品详情、创作者主页、发布、关注 / 评论。
  - 新增“模特 + 约拍诉求”作为次级模块继续保留，而不再作为首页和主导航核心。
- Modified
  - 现有首页定位需从“作品展与约拍入口”调整为“社区首页与发现入口”。
  - 现有创作者主页、作品详情与登录后发布路径，需围绕社区内容沉淀与发现效率重新定义需求边界。
  - 现有互动能力需从“点赞 / 收藏 / 联系优先”调整为“关注 / 评论优先，点赞 / 收藏 / 联系兼容保留”。
- Deprecated
  - “摄影师 / 模特主页 + 约拍诉求”并列为产品主线的范围假设。
  - 当前以 `T19` 为起点继续推进旧“全站中文化实现链”的直接执行路径。

## 影响矩阵

- 受影响工件
  - `docs/specs/2026-04-05-photo-showcase-platform-srs.md`
  - `docs/designs/2026-04-05-photo-showcase-platform-design.md`
  - `docs/tasks/2026-04-05-photo-showcase-platform-tasks.md`
  - `docs/specs/2026-04-08-site-chinese-localization-srs.md`
  - `docs/designs/2026-04-08-site-chinese-localization-design.md`
  - `docs/tasks/2026-04-08-site-chinese-localization-tasks.md`
  - `docs/designs/2026-04-08-photography-community-platform-design.md`
  - `task-progress.md`
  - `web/src/app/**`
  - `web/src/features/**`
- 失效的批准状态
  - 已批准的“摄影作品展与约拍平台”规格 / 设计 / 任务计划不再足以定义当前产品主线。
  - 已批准的“全站中文化”规格 / 设计 / 任务计划仍可作为文案与本地化参考，但不再代表当前最高优先级主线。
- 失效的任务 / Active Task
  - 当前 `Current Active Task = T19` 失效，应清空为 `pending reselection`。
  - 旧中文化计划中的 `T19` ~ `T21` 不再作为当前直接执行集合，后续仅在新社区主线需要时择机吸收。
- 失效的测试设计 / 验证证据 / review 结论
  - 围绕旧产品主线建立的任务级验证证据、待执行 review / gate 链，不再构成当前社区主线的直接推进依据。
  - 已完成的 `T1` ~ `T18` 仍是可复用的代码与验证基线，但不等于社区版 MVP 已被规格化或可直接宣告完成。
- 需重新派发的 reviewer / review 节点（如有）
  - 后续至少需要重新走 `ahe-spec-review`。
  - 若社区版设计与任务计划写回完成，则还需重新走 `ahe-design-review`、`ahe-tasks-review`。
- Profile 升级信号（如有）
  - 无新增升级；当前保持 `full` profile 仍合理。

## 同步更新项

- 新建社区版增量记录，固定本轮变化边界与失效项。
- 新建社区版规格草稿，作为新主线的唯一规格入口。
- 更新 `task-progress.md`，回退旧活跃任务并把下一步切到 `ahe-specify`。
- 明确不做的内容
  - 当前不继续执行旧中文化链路中的 `T19`。
  - 当前不直接进入社区版设计、任务拆解或实现。
  - 当前不假设旧“作品展与约拍平台”批准链可直接继承为社区版批准链。

## 状态回流

- `Current Stage`: `增量变更分析`
- `Workflow Profile`: `full`
- `Current Active Task`: `pending reselection`
- `Pending Reviews And Gates`: `ahe-spec-review`、`ahe-design-review`、`ahe-tasks-review`
- `Next Action Or Recommended Skill`: `ahe-specify`

## 说明

- 本记录反映的是 increment 完成时的 canonical 回流建议；其后若已进入规格回修、复审或其它 runtime 阶段，以最新的 `task-progress.md` 为准。
