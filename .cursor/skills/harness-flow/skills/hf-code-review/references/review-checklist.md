# Code Review Checklist

评审实现代码时，至少对以下 6 个维度逐项审查。每个维度内部评分 `0-10`，评分帮助区分轻微缺口与阻塞问题。

## 评分辅助规则

- 任一关键维度低于 `6/10` → 不得返回 `通过`
- 任一维度低于 `8/10` → 通常至少对应一条具体 finding

## 评审维度

| ID | 维度 | Pass Condition |
|---|---|---|
| `CR1` | 正确性 | 实现真正完成任务目标，没有明显逻辑缺口 |
| `CR2` | 设计一致性 | 实现遵循已批准设计，偏离可解释且可追溯 |
| `CR3` | 状态 / 错误 / 安全 | 错误处理、状态转换和安全性不过度依赖“测试全绿” |
| `CR4` | 可读性与可维护性 | 命名、结构、抽象层次合理，无明显魔法数字或死代码 |
| `CR5` | 范围守卫 | 不引入未记录的新能力或 undocumented behavior |
| `CR6` | 下游追溯就绪度 | 代码与交接块足以支持 `hf-traceability-review` |

### `CR1` 正确性

- 实现是否真正完成任务目标？
- 是否存在 off-by-one、边界遗漏、遗漏分支？

### `CR2` 设计一致性

- 实现是否遵循已批准设计？
- 若偏离，是否有清晰理由和 trace anchor？
- 是否把本应在 service / domain 层的逻辑塞回了 adapter / handler 层？

### `CR3` 状态 / 错误 / 安全

- 是否有静默失败？
- 状态转换是否安全？
- 是否有明显安全隐患、权限绕过、错误吞掉不报？

### `CR4` 可读性与可维护性

- 命名是否清晰？
- 是否存在魔法数字、死代码、过早优化或过度嵌套？
- 结构是否便于后续维护？

### `CR5` 范围守卫

- 是否顺手加了规格 / 设计中不存在的能力？
- 是否出现 undocumented behavior 或超范围实现？

### `CR6` 下游追溯就绪度

- 当前实现与交接块是否足以支持 traceability review？
- 触碰工件、关键行为和风险是否可回读？

## Anti-Pattern 检测

| ID | Anti-Pattern | 检测信号 | 正确做法 |
|---|---|---|---|
| `CA1` | silent failure | 失败后直接 return / swallow error | 记录并按设计传播 / 重试 |
| `CA2` | magic numbers | 状态或阈值直接写裸数字 | 提取常量或枚举 |
| `CA3` | undocumented behavior | 顺手加入未批准的新能力 | 先走 `hf-increment` 或回修 |
| `CA4` | design boundary leak | 业务逻辑塞进错误层次 | 回到已批准边界 |
| `CA5` | dead code / premature optimization | 现在用不到的抽象或路径已提前引入 | 收回到当前范围 |
