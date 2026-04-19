# Traceability Review — T62

| 上游 | 工件 | 测试 |
|---|---|---|
| FR-004 #6 owner 仍可见 moderated 但不可自助恢复 | studio/works/page.tsx 三态文案 + 抑制按钮 | page test `renders moderated works as read-only` ✅ |
| FR-004 #6 隐含：admin restore 是唯一恢复路径 | T60 admin restoreWork（独立 path）+ T62 owner-side throw | 二者解耦；T60 + T62 测试矩阵覆盖 ✅ |
| 设计 §9.8.1 owner-side fail-closed | resolveNextVisibility throw + work-actions redirect | work-editor.test 用例 + page test alert ✅ |
| 设计 §10.4 moderated_work_owner_locked 错误码 | OWNER_LOCK_ERROR_COPY | page test alert containing code ✅ |
| 设计 ADR-5 (公开屏蔽 + 唯一 restore 路径) | T57 (status union) + T60 (restore) + T62 (owner lock) 三件套 | 三任务集合断言 ✅ |
| 设计 §11 I-14 owner 链路 fail-closed | resolveNextVisibility 第一段 throw | work-editor.test 用例 ✅ |

## 结论

通过。
