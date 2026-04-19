# Implementation — T53 Pure Scoring Core

- Date: `2026-04-19`
- Task: T53
- Test design: `docs/verification/test-design-T53.md`

## 实现摘要

- 新增 `web/src/features/recommendations/scoring.ts`：
  - `scoreCreator(seed, candidate, weights?)` — 纯函数，命中 city / shootingFocus 信号后按权重累加；缺省字段返回 0 贡献；输出 `{ score, breakdown }`。
  - `scoreWork(seed, candidate, weights?)` — 纯函数，命中 sameOwner / ownerCity / category 信号后按权重累加；同上语义。
  - `rankCandidates(seed, candidates, scoreFn, options?)` — 通用稳定排序：score desc → updatedAt desc（empty 沉底）→ targetKey asc；可选 `isSelf` 过滤；可选 `limit`（默认 `CARDS_LIMIT = 4`）。
- `index.ts` 增加 `scoring` 与 `RankOptions` / `ScoreOutput` 类型 barrel export。

## fail-first 证据

```
$ npx vitest run src/features/recommendations/scoring.test.ts
（红：导入 scoring.ts 失败）

$ # 实现后
$ npx vitest run src/features/recommendations/
 Test Files  3 passed (3)
      Tests  29 passed (29)
```

## 全套验证

```
$ npm run typecheck
（baseline 4 errors；T53 不引入新错；中途出现的 2 个 TS2783 在测试 helper 中通过 destructuring 移除）

$ npm run lint        — 0 errors（baseline 1 warning）
$ npm run build       — success
```

## Acceptance 校验

| Acceptance | 证据 |
|---|---|
| `score ∈ [0, 1]` | `scoring.test.ts > scores in [0, 1]` (creator + work) ✅ |
| 同输入确定性 | `is deterministic / idempotent` ✅ |
| 缺省字段贡献 0 | `missing fields contribute 0 (not NaN)` ✅ |
| 显式权重 0 → 贡献 0 | `explicit zero weight contributes 0` ✅ |
| seed === candidate 不抛错 | `does not throw on seed === candidate` ✅ |
| 创作者严格序 | `strict ordering: same city + focus > same city only > same focus only > nothing` ✅ |
| 作品严格序 | `strict ordering: same owner > same owner-city only > same category only > nothing` ✅ |
| `rankCandidates` 上限 4 | `returns at most limit items` + `returns all when fewer than limit` ✅ |
| score / updatedAt / targetKey 三层 tie-breaker | `sorts by score desc` / `uses updatedAt desc` / `uses targetKey asc` ✅ |
| `isSelf` 过滤 | `filters out self via isSelf` ✅ |
| `RELATED_*_WEIGHTS` 默认满足 SRS §8.3 | scoring 层 sanity 守护 ✅（与 T52 重合，留作 defense in depth） |

## 不变量

- I-1 纯函数 / 确定性：✅（scoring 函数无 IO，无 Date.now / Math.random）。
- I-2 权重不变量：✅（T52 已覆盖；T53 在 scoring 默认权重通路上再次断言）。
- I-7 自身候选过滤是上层职责，scoring 不感知：✅（FR-003 验收 #4 覆盖）。

## 文件改动

新增：
- `web/src/features/recommendations/scoring.ts`
- `web/src/features/recommendations/scoring.test.ts`

修改：
- `web/src/features/recommendations/index.ts`（barrel export）
