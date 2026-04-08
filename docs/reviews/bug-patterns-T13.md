# T13 Bug Patterns Review

- 时间: `2026-04-08 00:54`
- 结论: 通过

## 检查范围

- `web/src/features/home-discovery/types.ts`
- `web/src/features/home-discovery/config.ts`
- `web/src/features/home-discovery/config.test.ts`
- `web/src/features/showcase/types.ts`
- `web/src/features/showcase/sample-data.ts`

## 重点检查

- `profiles` 精选位是否避免只用单一 `slug` 导致跨角色歧义
- 三类发现分区契约是否齐备，避免后续 resolver 临时补结构
- 首页发现“最新内容”所需时间键是否已在样本数据中统一准备

## 结果

- `profiles` 精选配置已显式要求 `role + slug` 联合定位，规避跨角色 slug 冲突模式。
- `works / profiles / opportunities` 三类分区契约已显式存在，未发现遗漏分区或混用字段。
- 公开样本数据已补齐 `publishedAt`，部分对象补充 `updatedAt`，满足后续最新排序输入基线。

## 遗留风险

- 无 resolver 行为验证；精选命中失效对象后的跳过与兜底逻辑将在 `T15` 继续覆盖。
