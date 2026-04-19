# Bug Patterns — T62

## 已规避

1. **owner 通过 form 强行提交 publish 把 moderated → published**：`resolveNextVisibility` fail-fast throw，wrapServerAction 不会写 sqlite；URL alert 携带 code 给 owner 反馈。
2. **moderated 作品在 owner 页面显示「草稿」误导**：三态文案显式区分草稿 / 已发布 / 已隐藏。
3. **DOM 中残留处置按钮**：moderated row 渲染 `<article>` 而非 `<form>`，且代码路径中不渲染任何 `<button>`；测试通过 `hiddenWorkSection.querySelectorAll("button").length === 0` 锁定。
4. **AppError code 未被 form-action 路径透传**：`work-actions.ts` 显式 try/catch 捕获该 code，redirect 到 `/studio/works?error=` 而非走 wrapServerAction 默认归一化路径（默认会变 `internal_error`）。
5. **alert 文案与 moderated row 提示重叠导致 getByText 多匹配**：测试改用 `getByRole("alert")` + `textContent.toContain` 精确匹配 alert 容器内文本。

## 候选下游

- T63 dashboard 不需要本任务的 owner-side 防护；admin 后台路径天然分离。
- 未来如允许"创作者申诉恢复"，需引入新 server action（如 `appealModeratedWork`），不得复用 `saveCreatorWorkForRole`。
