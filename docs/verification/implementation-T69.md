# Implementation — T69 contact migration

## 实现摘要

- `features/contact/state.ts` 大幅缩减：删除 `parseContactThreads` / `serializeContactThreads` / `buildContactThread` / `upsertContactThread` / `contactThreadsCookieName` / `getInboxThreadsForRole` / `ContactThread` 类型；只保留 `ContactSourceType`（被 actions 与既有公开页面 contact 按钮 bind 调用消费）。
- `features/contact/actions.ts` 重写：
  - guest path：record `discovery_events.contact_start failed/unauthenticated` + `redirect("/login")`（行为 1:1 保持）。
  - authenticated path：`bundle.profiles.getById("photographer:slug" / "model:slug")` 解析 recipient → 不存在 → record failed/recipient_not_found + redirect `/inbox?error=recipient_not_found` + 不调 createOrFindDirectThread。
  - happy：`createOrFindDirectThread(recipientProfileId, contextRef)` → record success → redirect `/inbox/[threadId]`。
  - invalid_self_thread catch：redirect `/inbox?error=invalid_self_thread`。
  - signature `(recipientRole, recipientSlug, sourceType, sourceId)` 完全保持；既有公开页面 form action `bind(null, role, slug, sourceType, sourceId)` 调用形态零修改。
- `features/contact/actions.test.ts` 重写：4 cases，mock `next/navigation` redirect (no throw) + getSessionContext + recordDiscoveryEvent + getDefaultCommunityRepositoryBundle + createOrFindDirectThread。

## fail-first 证据

```
$ # 实现前 actions.test 仍是旧 cookie path 测试
$ # 重写后
$ npx vitest run src/features/contact/
 Test Files  1 passed (1)
      Tests  4 passed (4)
```

旧 cookie 工具全仓引用 0 命中：
```
$ rg "contactThreadsCookieName|parseContactThreads|serializeContactThreads|buildContactThread|upsertContactThread|getInboxThreadsForRole" web/src
（无命中）
```

## 全套验证

```
$ npm run typecheck   — baseline 4 errors
$ npm run lint        — 0 errors（baseline 1 warning）
$ npm run build       — success
$ npx vitest run（全套）— 18 failed | 65 passed | 2 skipped (85) | 1 failed | 338 passed (343)
                            vs T68 baseline 18 | 65 (85) | 336；passed test files 不变
                            +2 passed tests（新 4 cases - 旧 2 cases）；既有失败集合不变
```

## Acceptance 校验

| Acceptance | 证据 |
|---|---|
| guest path 1:1 行为保持 | actions.test ✅ |
| recipient_not_found → discovery failed + redirect ?error= + 不调 createOrFindDirectThread | actions.test ✅ |
| happy → createOrFindDirectThread + discovery success + redirect /inbox/[threadId] | actions.test ✅ |
| invalid_self_thread catch → redirect /inbox?error= | actions.test ✅ |
| signature 不变 + 既有 page tests 不漂移 | rg 全仓 + vitest baseline 18 不变 |
| 5 cookie 工具函数 + cookie name 全部删除 | rg 全仓 0 命中 ✅ |

## 不变量

- I-8 ✅ startContactThreadAction 公开签名零变化；旧 cookie 不读不写不清；调用方 0 改
- A-007 ✅ recipient profile id（`${role}:${slug}`）作为 messaging 身份键传入

## 文件改动

修改：
- `web/src/features/contact/state.ts`（删除 cookie 工具；保留 ContactSourceType）
- `web/src/features/contact/actions.ts`（重写为 createOrFindDirectThread 调用）
- `web/src/features/contact/actions.test.ts`（重写：4 cases）
