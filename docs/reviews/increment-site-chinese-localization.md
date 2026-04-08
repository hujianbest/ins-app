## 变更摘要

- 变更摘要：用户要求当前网站面向最终使用者展示为中文，并在修改完成后进行浏览器验证。
- 当前 workflow profile / 当前阶段：`full` / `工作流完成`
- 当前判断：真实 increment

## 变更包

- New
  - 新增“全站用户可见内容默认使用中文”的产品约束。
  - 新增“浏览器验证中文页面与关键路径”的交付要求。
- Modified
  - 现有首页、公开详情页、认证页、控制台页、站内联系页、首页发现分区等用户可见英文文案，需改为中文。
  - 现有验收标准中关于首页发现、公开入口、首屏视觉与浏览流的语言表现要求，需增加“中文可读、术语一致”的约束。
- Deprecated
  - 现有已交付状态中默认接受的英文文案基线。
  - 与英文界面表现绑定的完成证据、浏览器观感与发布说明表述。

## 影响矩阵

- 受影响工件
  - `docs/specs/2026-04-06-homepage-discovery-enhancement-srs.md`
  - `docs/designs/2026-04-06-homepage-discovery-enhancement-design.md`
  - `docs/tasks/2026-04-06-homepage-discovery-enhancement-tasks.md`
  - `RELEASE_NOTES.md`
  - `task-progress.md`
  - `web/src/app/**`
  - `web/src/features/**`
- 失效的批准状态
  - 第二轮首页发现增强规格中的用户可见表现约束不再完整，需重新规格化中文化范围。
  - 第二轮首页发现增强设计中的文案、标题、空态与导航展示假设不再完整，后续需基于更新后的规格再确认设计是否重审。
- 失效的任务 / Active Task
  - 现有 `T13` ~ `T17` 已完成，但其完成定义建立在英文站点基线上；对“中文网站”这一新目标不再可直接视为最终可执行任务集合。
  - `Current Active Task` 失效，应清空为 `pending reselection`。
- 失效的测试设计 / 验证证据 / review 结论
  - 依赖英文文案断言或英文用户可见表现的页面测试与浏览器观感证据将失效。
  - 第二轮首页发现增强的完成、回归与 finalize 证据对“当前网站需要是中文的”这一新要求不再构成完整完成声明。
- 需重新派发的 reviewer / review 节点（如有）
  - 后续至少需要重新走 `ahe-spec-review`。
  - 若设计与任务计划随规格变化更新，则还需重新走 `ahe-design-review`、`ahe-tasks-review`。
- Profile 升级信号（如有）
  - 无新增升级；当前保持 `full` profile 仍合理。

## 同步更新项

- 更新 `task-progress.md`，将当前阶段回退到增量变更分析，并把 `Next Action Or Recommended Skill` 写为 `ahe-specify`。
- 在 `docs/skill_record.md` 中记录本次 increment 分析。
- 明确不做的内容
  - 当前不直接开始中文化实现。
  - 当前不绕过规格 / 设计 / 任务重收敛直接改代码。

## 状态回流

- `Current Stage`: `增量变更分析`
- `Workflow Profile`: `full`
- `Current Active Task`: `pending reselection`
- `Pending Reviews And Gates`: `ahe-spec-review`、`ahe-design-review`、`ahe-tasks-review`
- `Next Action Or Recommended Skill`: `ahe-specify`
