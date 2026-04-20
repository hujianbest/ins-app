# Test Design — T69 contact migration

## 测试单元

- `features/contact/actions.test.ts` (重写)：4 cases — guest / recipient_not_found / happy / invalid_self_thread。

## fail-first 主行为

- guest → recordDiscoveryEvent failed/unauthenticated + redirect /login。
- recipient_not_found → discovery failed + redirect /inbox?error= + 不调 createOrFindDirectThread。
- happy → createOrFindDirectThread(`${role}:${slug}`, contextRef) + discovery success + redirect /inbox/[threadId]。
- invalid_self_thread → 捕获并 redirect /inbox?error=。

## 退出标准

- vitest 子集全绿；既有 baseline 18 不变；旧 cookie 工具引用 0 命中。
