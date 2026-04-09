## 结论

通过

## 上游已消费证据

- Task ID: `T22`
- 实现交接块 / 等价证据: `docs/verification/implementation-T22.md`
- 触碰工件:
  - `web/src/features/community/contracts.ts`
  - `web/src/features/community/types.ts`
  - `web/src/features/community/contracts.test.ts`
  - `web/src/features/showcase/types.ts`
  - `web/src/features/home-discovery/types.ts`

## 命中的缺陷模式（结构化）

- Pattern ID / 名称: `BP-T22-001` / 双路径 section kind 口径漂移
- 机制: 新 `community` 契约引入 `CuratedSlotRecord` 时，如果 `sectionKind` 沿用单数实体名，而现有 canonical curation artifact `home-discovery/config.ts` / `types.ts` 使用复数 section kind，后续 `T24` / `T26` 的桥接很容易出现新旧命名并存、映射遗漏或分支判断不一致。
- 证据锚点:
  - `web/src/features/home-discovery/types.ts`
  - `web/src/features/community/types.ts`
  - `web/src/features/community/contracts.ts`
  - `web/src/features/community/contracts.test.ts`
- 严重级别: `important`
- 重复性: `新风险`
- 置信度: `demonstrated`

- Pattern ID / 名称: `BP-T22-002` / 默认值过宽导致发布态泄漏
- 机制: 社区作品契约刚建立时，如果把“缺失状态”默认放行为 `published`，后续 richer data 或写路径一旦漏传 `status`，草稿内容就可能被默认暴露到公开面；这是典型的默认值 / 状态传播缺陷族。
- 证据锚点:
  - `web/src/features/community/contracts.ts`
  - `web/src/features/community/contracts.test.ts`
  - `docs/verification/implementation-T22.md`
- 严重级别: `important`
- 重复性: `近似缺陷`
- 置信度: `probable`

## 缺失的防护

- 无阻塞下游 `ahe-test-review` 的高风险缺口。
- 上述两类风险已在当前轮被吸收：
  - `sectionKind` 已对齐为复数 `CommunitySectionKind`，并新增 `isCommunitySectionKind()` / `isCommunityTargetType()` 测试，避免 section 与 entity 口径混用。
  - “默认发布态”已收窄为 `showcase` 种子专用映射 `toSeedCommunityWorkRecord()`，不再把 permissive default 暴露为通用契约行为。

## 回归假设与扩散面

- 假设: 当前 `T22` 建立的契约基线不会在 `T24` 接入 SQLite seed bridge 时再次出现 section kind 单复数漂移。
- 建议证伪方式:
  - 在下游 `ahe-test-review` 中确认 `contracts.test.ts` 是否足以覆盖 `sectionKind` / `targetType` 的双口径保护。
  - 在 `T24` 实现 seed bridge 时，优先复用 `CommunitySectionKind`，不要再引入第三套 section kind 常量。

- 假设: 当前 `showcase` 种子路径中的 `published` 固定值只服务“现有样本数据全部为公开作品”的事实，不会被误复用到真实写路径或 SQLite adapter。
- 建议证伪方式:
  - 在 `T24` / `T28` 的测试评审中，重点检查 richer work data 是否仍显式传递 `status`，并补一条“缺失状态不得被默认公开”的测试。

## 下一步

- `通过`：`ahe-test-review`

## 记录位置

- `docs/reviews/bug-patterns-T22.md`
