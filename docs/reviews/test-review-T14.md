# T14 Test Review

- 时间: `2026-04-08 00:58`
- 结论: 通过

## 覆盖结论

- `web/src/features/home-discovery/adapters.test.ts` 已覆盖作品、主页、诉求三类 adapter 的核心映射。
- 对摄影师与模特主页路径差异、诉求详情直链都给出了明确断言。

## 观察

- 当前测试只锁适配层职责，没有提前把 resolver 行为揉进 adapter 测试。
