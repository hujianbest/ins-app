# Bug Patterns — T59

## 已规避

1. **counter 在业务写之前递增 → tx rollback 时 counter 漂移**：admin server action 在 `bundle.curation.upsertSlot` + `bundle.audit.record` 全部 await 完成之后再 `incrementCurationAdded` + `incrementAuditAppended`，让任一 await 抛错时 counter 自动跳过。
2. **target 存在性检查阻塞 audit append**：targetExists 在业务写之后调用、返回 boolean 控制 audit `note` 字段；若 targetExists 自身 throw，audit 仍写入（默认 note=undefined）；不阻塞主线。
3. **`reorderSlot` 返回 null 被静默忽略**：实现把 null 转为 `AppError("invalid_curation_input")`，避免 admin 误以为操作成功。
4. **page 同步阶段 redirect**：guard 在 `await searchParams` 之后但所有数据 fetch 之前；防止 admin 数据先 fetch 再 redirect 时数据进入 SSR 缓存。
5. **错误码字典硬编码 vs 共享常量**：当前 ERROR_COPY 在 page.tsx 内联，与 server action 抛出的 `AppError.code` 形成"双侧字符串"。后续 task 可考虑提取为共享枚举；V1 先保持简单。

## 候选下游

- T60 / T61 实现的 server action 与 page 错误码也走同一 URL 协议 + ERROR_COPY 字典，应保持命名空间统一（`error=<code>`）。
- form-action wrapper 在 try/catch 后 `redirect(...)` 会抛 NEXT_REDIRECT；测试侧需让 `redirectMock.mockImplementation(() => { throw ... })` 对齐。
