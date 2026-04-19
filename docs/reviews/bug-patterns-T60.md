# Bug Patterns — T60

## 已规避

1. **hide 时 reset publishedAt 让作品在恢复后排到末尾**：`transitionWork` 使用 `existing.publishedAt`（不传 `undefined`），保持 publish 时间稳定，便于 owner / 推荐 / 列表排序一致。
2. **restore 后作品丢失原 publishedAt**：测试 `preserves existing publishedAt when restoring` 显式锁定。
3. **`save()` 直接接收 `existing` spread 时，draft 路径误把 `publishedAt: undefined` 写回**：transitionWork 不动 publishedAt 字段，避免间接改 publishedAt 行为。
4. **状态机校验放在 audit append 之后**：会导致 audit 出现"假阳性"。本任务把状态机校验放在最前，throw 前不写任何状态。
5. **moderated 作品仍出现在公开 surface**：本任务在 `public-read-model.test.ts` + `related-works.test.ts` 双侧补显式 case，锁住与 draft 同形屏蔽（防 ADR-5 静默漂移）。

## 候选下游

- T62 owner-side `/studio/works` 必须把 moderated 作品在 owner 视图渲染为只读 + 抑制按钮；T60 admin restore 链路与 T62 owner 链路通过 `existing.publishedAt` 保留协作（restore 后 published 标识立即恢复）。
