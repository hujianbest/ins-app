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
    <main className="pb-24 text-white">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 pt-12 sm:px-10 lg:px-14">
        <PageHero
          eyebrow="Studio Works"
          title="管理作品"
          description="查看当前挂载在公开主页上的作品，并为展示区准备下一批新增内容。"
          actions={[{ href: "/studio", label: "返回工作台" }]}
        />

        <form
          action={saveStudioWorkAction}
          className="grid gap-4 rounded-[1.75rem] border border-white/10 bg-[rgba(14,18,28,0.72)] p-6 shadow-[0_28px_80px_rgba(0,0,0,0.26)] backdrop-blur-xl"
        >
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.28em] text-cyan-200/80">新作品</p>
            <h2 className="text-2xl font-medium text-white">添加新作品</h2>
          </div>
          <input
            name="title"
            placeholder="作品标题"
            className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-base text-white outline-none"
          />
          <input
            name="category"
            placeholder="作品分类"
            className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-base text-white outline-none"
          />
          <input
            name="coverAsset"
            placeholder="封面资源引用"
            defaultValue="work:new-work:cover"
            className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-base text-white outline-none"
          />
          <textarea
            name="description"
            rows={3}
            placeholder="作品简介"
            className="w-full rounded-[1.5rem] border border-white/10 bg-black/20 px-4 py-3 text-base leading-7 text-white outline-none"
          />
          <textarea
            name="detailNote"
            rows={4}
            placeholder="作品说明"
            className="w-full rounded-[1.5rem] border border-white/10 bg-black/20 px-4 py-3 text-base leading-7 text-white outline-none"
          />
          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              name="intent"
              value="save_draft"
              className="inline-flex rounded-full border border-white/15 px-5 py-3 text-sm font-medium text-white transition hover:border-cyan-200/60 hover:text-cyan-200"
            >
              保存为草稿
            </button>
            <button
              type="submit"
              name="intent"
              value="publish"
              className="inline-flex rounded-full bg-white px-5 py-3 text-sm font-medium text-slate-950 transition hover:bg-cyan-100"
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
              className="grid gap-4 rounded-[1.75rem] border border-white/10 bg-[rgba(14,18,28,0.72)] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.18)] backdrop-blur-xl md:grid-cols-[minmax(0,1fr)_auto]"
            >
              <input type="hidden" name="workId" value={work.id} />
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-xs uppercase tracking-[0.28em] text-cyan-200/80">{work.category}</p>
                  <span className="rounded-full border border-white/15 px-3 py-1 text-xs uppercase tracking-[0.24em] text-white/70">
                    {work.status === "published" ? "已发布" : "草稿"}
                  </span>
                </div>
                <input
                  name="title"
                  defaultValue={work.title}
                  className="mt-3 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-2xl font-medium text-white outline-none"
                />
                <input
                  name="category"
                  defaultValue={work.category}
                  className="mt-3 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-base text-white outline-none"
                />
                <input
                  name="coverAsset"
                  defaultValue={work.coverAsset}
                  className="mt-3 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-base text-white outline-none"
                />
                <textarea
                  name="description"
                  defaultValue={work.description}
                  rows={3}
                  className="mt-3 w-full rounded-[1.5rem] border border-white/10 bg-black/20 px-4 py-3 text-sm leading-7 text-slate-300 outline-none"
                />
                <textarea
                  name="detailNote"
                  defaultValue={work.detailNote}
                  rows={4}
                  className="mt-3 w-full rounded-[1.5rem] border border-white/10 bg-black/20 px-4 py-3 text-sm leading-7 text-slate-300 outline-none"
                />
              </div>
              <div className="flex flex-col gap-3">
                <button
                  type="submit"
                  name="intent"
                  value="publish"
                  className="rounded-full border border-white/15 px-4 py-2 text-sm text-white transition hover:border-cyan-200/50 hover:text-cyan-200"
                >
                  {work.status === "published" ? "保存更改" : "发布作品"}
                </button>
                {work.status === "draft" ? (
                  <button
                    type="submit"
                    name="intent"
                    value="save_draft"
                    className="rounded-full border border-white/15 px-4 py-2 text-sm text-white transition hover:border-cyan-200/50 hover:text-cyan-200"
                  >
                    保存为草稿
                  </button>
                ) : null}
                <button
                  type="submit"
                  name="intent"
                  value="revert_to_draft"
                  className="rounded-full border border-white/15 px-4 py-2 text-sm text-white transition hover:border-cyan-200/50 hover:text-cyan-200"
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
