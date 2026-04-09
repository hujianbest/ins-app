## 结论

通过

## 上游已消费证据

- Task ID: `T22`
- 实现交接块 / 等价证据: `docs/verification/implementation-T22.md`
- `ahe-bug-patterns` 记录: `docs/reviews/bug-patterns-T22.md`

## 发现项

- [important] 当前 repository / bundle smoke test 仍是选择性覆盖，不是对 `CommunityRepositoryBundle` 全部方法的穷尽验证；`profiles.getById`、`profiles.listPublicProfiles`、`works.getById`、`follows.listFollowedProfileIds` 仍主要依赖类型约束和 `test-support.ts` 的实现自洽。
- [important] 本轮 RED 证明的是“repository contract 的测试支撑层缺失”，而不是最理想的“行为断言先失败”；虽然证据链仍然可信，但行为型 fail-first 强度略弱。
- [minor] 当前 curated slot 的 bundle smoke test 只直接覆盖了 `discover` surface；`home` 仍主要由 `isCommunitySurface` 的字面量守卫承接。
- [minor] `sectionKind` 与 `home-discovery` 的对齐目前是设计口径一致，而不是跨模块共享单一常量真源。
- [minor] `createShowcaseSeedSnapshot` 虽已改为按 `slug / id` 取值断言，但仍保留了部分长文本字段比对，后续样本文案微调时仍可能出现低价值失败。

## 测试 ↔ 行为映射

- 行为 / 验收点: 从 `showcase` 样本生成稳定 creator id 和最小 work 契约
- 对应测试: `createShowcaseSeedSnapshot derives stable creator ids and a minimal work contract from showcase data`

- 行为 / 验收点: 公开读取不得暴露草稿作品
- 对应测试:
  - `getPublicWorkRecords excludes draft works from public reads`
  - `community repository bundle contract supports profile, work, follow, comment, and curation queries`

- 行为 / 验收点: curation surface 只允许 `home` / `discover`
- 对应测试: `isCommunitySurface only accepts home and discover`

- 行为 / 验收点: `sectionKind` 与 `targetType` 口径拆分
- 对应测试:
  - `isCommunitySectionKind keeps discovery section names aligned with existing home-discovery config`
  - `isCommunityTargetType uses singular entity names instead of section names`

- 行为 / 验收点: repository bundle 能表达 profile/work/follow/comment/curation 查询契约
- 对应测试: `community repository bundle contract supports profile, work, follow, comment, and curation queries`

## 测试质量缺口

- 若希望把 `CommunityRepositoryBundle` 视为完整运行时契约，还需要补 `getById` / `listPublicProfiles` / `listFollowedProfileIds` 等未直接断言的方法 smoke test；当前结论是“足够进入代码评审”，不是“测试面已完全封口”。
- 如果后续 `T24` / `T26` 继续沿用 `sectionKind`，建议把 `community` 与 `home-discovery` 收敛到共享常量真源，避免 guard 测试与 canonical 配置漂移。
- 未来若继续强化 fail-first 纪律，优先写行为失败断言，再补测试支撑层。

## 给 `ahe-code-review` 的提示

- 已可信的测试结论: 当前测试已直接承接稳定 creator id、最小作品契约、公开读草稿过滤、`home / discover` surface，以及 `sectionKind` / `targetType` 双口径防护，并新增了 repository / bundle 契约 smoke test。
- 仍需重点怀疑的实现风险: `test-support.ts` 只是测试专用 in-memory bundle；真实 SQLite adapter、访问控制边界与公开页切换仍未实现，代码评审需继续确认 `toSeedCommunityWorkRecord()` 和 repository 类型边界不会被误复用。

## 下一步

- `通过`：`ahe-code-review`

## 记录位置

- `docs/reviews/test-review-T22.md`
