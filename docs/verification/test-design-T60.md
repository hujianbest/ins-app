# Test Design — T60 Work moderation 后台 + 公开屏蔽闭环

## 测试单元

- `web/src/features/admin/work-moderation-actions.test.ts`：hide / restore happy + 状态机校验 + 不存在 workId + tx fn-error 不写 audit。
- `web/src/app/studio/admin/works/page.test.tsx`：guest/non-admin redirect、admin 渲染状态标签三态 + 处置按钮按状态 + ?error= alert。
- `web/src/features/community/public-read-model.test.ts`（扩展）：moderated 作品在 `getPublicWorkPageModel` / `listPublicWorkPageParams` / `showcaseItems` 全部屏蔽。
- `web/src/features/recommendations/related-works.test.ts`（扩展）：moderated 不进入推荐候选池。

## fail-first 主行为

1. hide / restore 拒绝非 admin / guest（forbidden_admin_only）。
2. hide / restore 不存在 workId → work_not_found (404)。
3. hide on draft → invalid_work_status_transition；hide on already moderated → 同；restore on published / draft → 同。
4. hide published → moderated；audit append；counter 递增；保留原 publishedAt。
5. restore moderated → published；audit append；counter 递增。
6. 业务写抛错 → audit 不写。
7. SSR page：guest/non-admin redirect；admin 渲染三态标签 + 按状态显示按钮；空态文案；?error= alert。
8. 公开屏蔽：moderated 作品在 getPublicWorkPageModel / listPublicWorkPageParams / 创作者主页 showcase 中全部不可见。
9. 推荐：moderated 不进入候选池（与 draft 同形）。

## 退出标准

- vitest 子集全绿
- typecheck/lint/build baseline 不漂移
