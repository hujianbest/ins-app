# Test Design — T54 Related Creators 端到端

- Task: T54
- Date: `2026-04-19`

## 测试单元

| 测试文件 | 覆盖目标 |
|---|---|
| `related-creators.test.ts` | 编排函数所有分支：disabled / rendered / no-candidates / soft-fail；同角色过滤；自身过滤；FR-008 #3 单次 repository 读；I-12 publishedAt 回退 |
| `related-creators-section.test.tsx` | flag disabled DOM 无 panel；空态文案；卡片网格 + heading 层级 + 跳转链接 |
| `app/photographers/[slug]/page.test.tsx` | 既有断言不漂移（baseline 已在 18 failed 文件中，同 T51 baseline 一致；未引入新失败） |

## fail-first 主行为

1. flag disabled → null + 不读 repository + counter 0
2. ≥2 同角色候选 → kind=rendered + cards.length ∈ [1,4] + counter cards_rendered+=N
3. 自身被过滤
4. 跨角色被过滤（仅同角色入候选池）
5. 仅自身一名 → kind=empty/no-candidates + counter empty+=1
6. repository throw → kind=empty/soft-fail + warn log + counter empty+=1
7. updatedAt 缺省时使用 publishedAt 回退（I-12）
8. 候选 ≥ 4 时只渲染 4 张
9. SSR 段：disabled DOM 无 section / 空态显示文案不渲染卡片 / 渲染时含 h2 + h3 链接

## 退出标准

- 上述 vitest 子集全绿
- typecheck / lint / build 不引入新错
- 全套 vitest baseline 不漂移
