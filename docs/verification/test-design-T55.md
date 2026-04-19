# Test Design — T55 Related Works 端到端

- Task: T55
- Date: `2026-04-19`

## 测试单元

- `related-works.test.ts`：编排函数所有分支（disabled / rendered / no-candidates / soft-fail / draft 过滤 / 自身过滤 / FR-008 #3 单次读各 1 次 / seed 不存在 fallback / 上限 4）
- `related-works-section.test.tsx`：disabled DOM 无 panel / 空态文案 / 卡片 + heading + 跳转链接（且不含 `/works/seed`）

## fail-first 主行为

1. flag disabled → null + 不读 repository
2. ≥2 published works → kind=rendered + cards.length ∈ [1,4] + counter.cards_rendered+=N
3. 自身过滤
4. draft 不进入候选池
5. 仅自身一篇 → kind=empty/no-candidates + counter.empty+=1
6. FR-008 #3：listPublicWorks 调用 1 次 + listPublicProfiles 调用 1 次（profile-map 单次构建）
7. works repository 异常 → soft-fail + warn + counter.empty+=1
8. seed 不存在但池子非空 → 仍按池子排序渲染（满足"不存在的 seed 不抛错"语义）
9. 上限 4
10. SSR section：disabled 无 DOM / empty 渲染文案不渲染卡片 / rendered 含 h2 + h3 + `/works/[id]` 跳转

## 退出标准

- 上述 vitest 子集全绿
- typecheck / lint / build 不引入新错
- 全套 baseline 不漂移
