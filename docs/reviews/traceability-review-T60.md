# Traceability Review — T60

| 上游 | 工件 | 测试 |
|---|---|---|
| FR-004 #1 admin → 渲染所有作品 + 状态标签 | works/page.tsx | page test `renders all works with status-specific buttons` ✅ |
| FR-004 #2 hide published → moderated | hideWork | `flips published → moderated, writes audit, increments counters` ✅ |
| FR-004 #3 restore moderated → published | restoreWork | `flips moderated → published, writes audit, increments counters` ✅ |
| FR-004 #4 hide on draft 拒绝 | transitionWork 状态机校验 | `rejects hide on draft works` ✅ |
| FR-004 #5 不存在 workId → work_not_found | transitionWork getById 校验 | `rejects unknown workId with work_not_found` ✅ |
| FR-004 #6 owner 仍可见 moderated（不允许自助恢复） | T62 任务承接 | T62 接力（本任务保留 publishedAt 为前提条件） |
| FR-004 #7 hide / restore 后公开页 404 / 推荐 / showcase 不显示 | public-read-model + related-works 测试 | `hide moderated works the same way as drafts` + `excludes moderated works from the candidate pool` ✅ |
| FR-004 #8 counter | metrics helpers + snap 断言 | `flips ... counters` ✅ |
| FR-005 audit append 强制 | runAdminAction + ctx.bundle.audit.record | counter `admin.audit.appended` ✅ |
| FR-006 公开 read model 同形屏蔽 | T57 已落地；本任务在 5 surface 补显式断言 | public-read-model + related-works ✅ |
| 设计 ADR-2 (write+audit same tx) | runAdminAction | `does not write audit when business write throws` ✅ |
| 设计 ADR-5 (公开屏蔽) | listPublicWorks WHERE + getPublicWorkRecords filter | 显式 case ✅ |
| 设计 §10.4 错误码字典 | works/page.tsx ERROR_COPY | page test alert ✅ |
| 设计 §10.6 noindex | metadata.robots | code review ✅ |
| 设计 I-9 同形屏蔽 | 5 公开 surface（page detail / static params / showcase / 推荐 / 搜索） | 显式 case 4 个 + search 由 listPublicWorks 兜底 ✅ |

## 结论

通过。
