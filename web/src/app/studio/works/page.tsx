import { redirect } from "next/navigation";

import { getRequestAccessControl } from "@/features/auth/access-control";
import { saveStudioWorkAction } from "@/features/community/work-actions";
import { getStudioWorksEditorModel } from "@/features/community/work-editor";
import { PageHero } from "@/features/shell/page-hero";

export default async function StudioWorksPage() {
  const accessControl = await getRequestAccessControl();
  const session = accessControl.session;

  if (session.status !== "authenticated" || !accessControl.studioGuard.allowed) {
    redirect(accessControl.studioGuard.redirectTo ?? "/login");
    return null;
  }

  const managedWorks = await getStudioWorksEditorModel(session.primaryRole);

  return (
    <main className="museum-page">
      <section className="museum-shell flex flex-col gap-10 pt-14">
        <PageHero
          eyebrow="Studio Works"
          title="管理作品"
          description="查看当前挂载在公开主页上的作品，并为展示区准备下一批新增内容。"
          actions={[{ href: "/studio", label: "返回工作台" }]}
          tone="utility"
        />

        <form
          action={saveStudioWorkAction}
          className="museum-panel grid gap-4 p-6 md:p-8"
        >
          <div className="space-y-2">
            <p className="museum-label">新作品</p>
            <h2 className="font-display text-4xl leading-none tracking-[-0.03em] text-[color:var(--accent-strong)]">
              添加新作品
            </h2>
          </div>
          <input
            name="title"
            placeholder="作品标题"
            className="museum-field"
          />
          <input
            name="category"
            placeholder="作品分类"
            className="museum-field"
          />
          <input
            name="coverAsset"
            placeholder="封面资源引用"
            defaultValue="work:new-work:cover"
            className="museum-field"
          />
          <textarea
            name="description"
            rows={3}
            placeholder="作品简介"
            className="museum-textarea"
          />
          <textarea
            name="detailNote"
            rows={4}
            placeholder="作品说明"
            className="museum-textarea"
          />
          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              name="intent"
              value="save_draft"
              className="museum-button-secondary"
            >
              保存为草稿
            </button>
            <button
              type="submit"
              name="intent"
              value="publish"
              className="museum-button-primary"
            >
              发布作品
            </button>
          </div>
        </form>

        <div className="grid gap-5">
          {managedWorks.map((work) => (
            <form
              key={work.id}
              action={saveStudioWorkAction}
              className="museum-panel grid gap-4 p-6 md:grid-cols-[minmax(0,1fr)_auto] md:p-8"
            >
              <input type="hidden" name="workId" value={work.id} />
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <p className="museum-label">{work.category}</p>
                  <span className="museum-tag">
                    {work.status === "published" ? "已发布" : "草稿"}
                  </span>
                </div>
                <input
                  name="title"
                  defaultValue={work.title}
                  className="museum-field mt-3 text-2xl font-medium"
                />
                <input
                  name="category"
                  defaultValue={work.category}
                  className="museum-field mt-3"
                />
                <input
                  name="coverAsset"
                  defaultValue={work.coverAsset}
                  className="museum-field mt-3"
                />
                <textarea
                  name="description"
                  defaultValue={work.description}
                  rows={3}
                  className="museum-textarea mt-3 text-sm leading-7"
                />
                <textarea
                  name="detailNote"
                  defaultValue={work.detailNote}
                  rows={4}
                  className="museum-textarea mt-3 text-sm leading-7"
                />
              </div>
              <div className="flex flex-col gap-3">
                <button
                  type="submit"
                  name="intent"
                  value="publish"
                  className="museum-button-primary"
                >
                  {work.status === "published" ? "保存更改" : "发布作品"}
                </button>
                {work.status === "draft" ? (
                  <button
                    type="submit"
                    name="intent"
                    value="save_draft"
                    className="museum-button-secondary"
                  >
                    保存为草稿
                  </button>
                ) : null}
                <button
                  type="submit"
                  name="intent"
                  value="revert_to_draft"
                  className="museum-button-secondary"
                >
                  回退到草稿
                </button>
              </div>
            </form>
          ))}
        </div>
      </section>
    </main>
  );
}
