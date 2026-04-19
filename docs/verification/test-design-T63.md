# Test Design — T63 Admin Dashboard + /studio admin entry card

## 测试单元

- `web/src/app/studio/admin/page.test.tsx`：guest/non-admin redirect + admin 渲染 dashboard（heading / admin email / 名单大小 / 三张入口卡 链接）。
- `web/src/app/studio/page.test.tsx`（扩展）：admin 用户显示「进入运营后台」入口卡 → `/studio/admin`；非 admin 用户 DOM 中**不**渲染该卡。

## fail-first 主行为

1. /studio/admin guest → /login。
2. /studio/admin 非 admin → /studio。
3. /studio/admin admin → 渲染 dashboard。
4. dashboard 含三张入口卡链向 curation / works / audit。
5. dashboard 顶部显示 admin 邮箱 + 名单大小。
6. /studio admin 用户 → DOM 含「进入运营后台」link + `href="/studio/admin"`。
7. /studio 非 admin → DOM 中无 admin 入口卡（query null）。

## 退出标准

- vitest 子集全绿
- typecheck/lint/build baseline 不漂移
