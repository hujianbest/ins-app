# Test Design — T67 /inbox 升级

## 测试单元

- `app/inbox/page.test.tsx`（重写）：5 cases — guest redirect / 双段空 / 双段非空（threads + system notifications + counter +1）/ ?error= alert 中文 copy / counter 不递增 on guest redirect。

## fail-first 主行为

- guest → /login redirect；counter 不递增。
- authenticated 双段空 → 渲染两段空态文案。
- authenticated 双段非空 → 渲染 thread 卡片（含 contextLink tag + counterpart name + 时间 + 未读 badge）+ 系统通知（comment 来自 fan）+ counter system_notifications_listed +1。
- ?error= → alert role + Chinese copy 映射。

## 退出标准

- vitest 子集全绿；typecheck/lint/build baseline 不漂移；既有 baseline 18 failed 集合不变。
