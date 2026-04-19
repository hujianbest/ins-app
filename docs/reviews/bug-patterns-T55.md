# Bug Patterns — T55

- Task: T55
- Date: `2026-04-19`

## 已规避的潜在 bug 模式

1. **N×repository 读放大**：`Promise.all([listPublicWorks, listPublicProfiles])` 一次拿到两个集合，构建 `ownerProfileById: Map<id, profile>`；scoring 只查 Map，不再回 repository。spy 断言锁住调用次数=1 each（FR-008 #3）。
2. **Draft 候选漏掉过滤**：依赖 `listPublicWorks` 的现有契约（既有 sqlite + in-memory 实现都过滤 draft）；T55 单测显式写 `status: "draft"` 候选并断言被排除。这把"上层依赖 repository 已过滤"的隐式假设变成显式不变量。
3. **Seed 不存在时编排崩溃**：当 `find(work.id === seed.workId)` 返回 undefined 时，编排走 fallback `seedSignals`（全空字段），`scoreWork` 在缺省字段时贡献 0；`rankCandidates` 仍能稳定输出 — 不抛错。单测显式覆盖。
4. **`coverAsset` 为空字符串当成有效图片**：section 写 `assetRef={card.coverAsset || undefined}`，让 `EditorialVisual` 走默认占位，避免空字符串触发 broken-image 占位图。
5. **`/works/seed` 自身链接出现在推荐列表**：测试显式 `expect(links).not.toContain("/works/seed")`，避免 isSelf 过滤被误改后悄悄回归。

## 候选下游 bug 模式

- T56 在 view-beacon 测试覆盖 `eventType="related_card_view"` 时，注意 `surface` 必须是 `related_creators_section` / `related_works_section` 二选一，与 T54/T55 section 中硬编码字符串一一对应（I-9）。
