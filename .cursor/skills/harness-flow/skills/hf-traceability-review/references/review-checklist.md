# Traceability Review Checklist

评审追溯链时，至少对以下 6 个维度逐项审查。每个维度内部评分 `0-10`，评分帮助区分轻微缺口与阻塞问题。

## 评分辅助规则

- 任一关键维度低于 `6/10` → 不得返回 `通过`
- 任一维度低于 `8/10` → 通常至少对应一条具体 finding

## 评审维度

| ID | 维度 | Pass Condition |
|---|---|---|
| `TZ1` | 规格 → 设计追溯 | 关键需求可回指到设计决策或关键接口 |
| `TZ2` | 设计 → 任务追溯 | 关键设计决策已落到任务，不存在设计空洞 |
| `TZ3` | 任务 → 实现追溯 | 实现与任务计划、触碰工件、完成条件一致 |
| `TZ4` | 实现 → 验证追溯 | 测试 / 验证证据支撑当前实现结论 |
| `TZ5` | 漂移与回写义务 | 未记录漂移、未回写工件、undocumented behavior 被显式识别 |
| `TZ6` | 整体链路闭合 | 当前批准工件与代码状态整体一致，可进入 regression gate |

### `TZ1` 规格 → 设计追溯

- 关键需求是否被设计承接？
- 是否有规格更新但设计未同步？

### `TZ2` 设计 → 任务追溯

- 关键设计决策是否落到任务？
- 是否有任务计划遗漏关键设计约束？

### `TZ3` 任务 → 实现追溯

- 实现是否完成任务的完成条件？
- 触碰工件是否与任务计划一致？
- 是否存在超出任务范围的额外行为？

### `TZ4` 实现 → 验证追溯

- 测试 / 验证证据是否支撑当前实现？
- RED/GREEN、review、verification 是否可回读到当前实现？

### `TZ5` 漂移与回写义务

- 是否出现 undocumented behavior、orphan code、未回写设计 / 任务 / 状态工件？
- 是否明确列出需要同步的工件？

### `TZ6` 整体链路闭合

- 整条 spec→design→tasks→impl→test/verification→status 链路是否闭合？
- 当前状态是否足以安全进入 regression gate？

## Anti-Pattern 检测

| ID | Anti-Pattern | 检测信号 | 正确做法 |
|---|---|---|---|
| `ZA1` | spec drift | 规格已变更，设计 / 任务仍基于旧版本 | 回 router 或回写上游工件 |
| `ZA2` | orphan task | 任务无法追溯到规格或设计 | 回补 trace anchor 或删除伪任务 |
| `ZA3` | undocumented behavior | 代码引入未记录的新行为 | 回写工件或走 increment |
| `ZA4` | unsupported completion claim | 验证不足却声称完成 | 回补验证或回实现 |
