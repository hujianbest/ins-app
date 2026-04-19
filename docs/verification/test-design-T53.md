# Test Design — T53 Pure Scoring Core

- Task: T53
- Date: `2026-04-19`

## 测试单元

- `web/src/features/recommendations/scoring.test.ts`：覆盖 `scoreCreator` / `scoreWork` / `rankCandidates`。

## fail-first 主行为

1. `scoreCreator` / `scoreWork` 输出 `score ∈ [0, 1]`。
2. `scoreCreator` 严格序：同城 + 同方向 > 同城 > 同方向 > 都不同。
3. `scoreWork` 严格序：同 owner > 同 owner 城市 > 同 category > 都不同。
4. `breakdown` 和等于 `score`。
5. 缺省字段贡献为 0（不为 NaN）。
6. 显式权重 0 → 该信号贡献为 0。
7. `rankCandidates` 限 `limit` 张；少于 `limit` 时全部返回。
8. 排序：score desc → updatedAt desc → targetKey asc 三层。
9. `isSelf` 过滤生效；scoring 函数本身对 seed === candidate 不抛错。
10. 同输入幂等。
11. 默认 `RELATED_*_WEIGHTS` 满足 SRS §8.3 不变量（与 T52 重合断言，作为 scoring 层的 sanity 守护）。

## 退出标准

- `scoring.test.ts` 全绿
- `npm run typecheck/lint/build` 全绿（baseline 之外无新错）
