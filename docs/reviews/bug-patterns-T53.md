# Bug Patterns — T53

- Task: T53
- Date: `2026-04-19`

## 已规避的潜在 bug 模式

1. **缺省字段被当成有效信号**：`fieldsMatch` 显式要求两侧都非空才算"命中"；防止 `seed.city = ""` 与 `candidate.city = ""` 被错认为"同城"。`scoring.test.ts > missing fields contribute 0` 覆盖。
2. **NaN 传染**：所有信号贡献只走整数 0/1 × weight，绝不出现 `undefined * weight`；测试显式断言 `Number.isNaN(score) === false`。
3. **updatedAt 缺省时 tie-breaker 把"空字符串"误置首位**：在比较器内显式把 `updatedAt === ""` 沉底（`return 1` / `return -1`），避免字典序意义下空字符串被排到所有日期之前。
4. **score float 累加误差让"严格大于"断言偶发失败**：测试用 `toBeGreaterThan` 配合明确的非负权重（0.55/0.3/0.15、0.6/0.4），不会触发 IEEE-754 边界；当前权重表与测试组合在 v8 / Node 22 上稳定。
5. **rankCandidates 内部修改输入数组**：实现使用 `scored.push` 累积新数组，再 `sort` + `slice`，从不在原 `candidates` 上 mutate，保留 caller 数据完整性。
6. **测试 helper 同名字段被 spread 覆盖（TS2783）**：本任务实现期间命中过该 typecheck 错误；通过 destructuring `{ slug, ...rest }` 后再 `...rest` 解决，避免 `slug` / `workId` 被 overrides 覆盖。

## 候选下游 bug 模式

- T54 / T55：编排层把 `record.updatedAt` 直接传入 signals 时如果不做 `?? record.publishedAt ?? ""` 回退，会让候选项被 tie-breaker 排到末尾或顶部出现意外。设计 I-12 已固化，T54 / T55 实现时必须遵守。

## 处置

- 无新条目入 bug pattern 目录。
- 测试 helper 的 destructuring 模式可作为团队约定（在 spread 形态的 fixture 中始终先 destructure 强制必填字段）。
