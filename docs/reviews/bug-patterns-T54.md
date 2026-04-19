# Bug Patterns — T54

- Task: T54
- Date: `2026-04-19`

## 已规避的潜在 bug 模式

1. **Flag disabled 时 section 仍然挂载 → 仍然 fire beacon**：编排层返回 `null` 而非空对象，section 第一行 `if (!result) return null` 一处闭合（I-3 / I-11）；测试通过断言 `node === null` 锁住该不变量，避免"DOM 无 panel 但 useEffect 仍调用 sendBeacon"的隐性漂移。
2. **Repository 异常拖垮整页**：编排层 `try/catch` 包住 IO 与排序；catch 分支返回 `{ kind: "empty", reason: "soft-fail" }`，section 走稳定空态文案，整页 SSR 不抛 500。
3. **N×repository 读放大**：`listPublicProfiles` 一次读后构造 `sameRoleCandidates`，cards 映射时使用同一份数组的 `find` 而非再次读 repository；测试用 spy 断言调用次数 = 1。
4. **`updatedAt` 缺省让 tie-breaker 不稳定**：`profileToSignals` 显式 `record.updatedAt ?? record.publishedAt ?? ""`，I-12 单测显式覆盖。
5. **同角色过滤遗漏 → 摄影师主页推出现模特**：`profile.role === seed.role` 在编排层硬过滤，单测显式断言。
6. **自身候选未过滤 → 主页底部出现自己**：`isSelf: (signals) => signals.targetKey === seedKey` 在 `rankCandidates` 入口注入；单测断言 `cards.find(c => c.slug === "seed") === undefined`。
7. **section 把 server-side bundle 透传到客户端 hydrate**：section 是 async server component，其 `deps` props 仅在 server 调用，不通过 hydration 序列化；EditorialCard / DiscoveryViewBeacon 是 client 组件接收的是 plain props（card 字段、surface 字面量字符串）。

## 候选下游 bug 模式

- T55 编排层把 works + profiles 都各读一次，注意 profile-map 必须在 mapping 之前一次性构建；不要在每个 candidate 内 find profile 数组（O(N²)）。
- T56 在 view-beacon 测试中验证 `eventType="related_card_view"` 路径时，需要确保 sessionStorage dedupe key 包含 `eventType` 才不会与同 surface 上的 work_view / profile_view 冲突——既有实现 `buildDedupeKey` 已含 `eventType`，可直接复用；T56 测试要明确断言。

## 处置

- 无新 bug pattern 目录条目。
