import { redirect } from "next/navigation";

import { getRequestAccessControl } from "@/features/auth/access-control";
import { saveStudioWorkAction } from "@/features/community/work-actions";
import { getStudioWorksEditorModel } from "@/features/community/work-editor";
import { PageHero } from "@/features/shell/page-hero";

const STATUS_LABEL = {
  draft: "草稿",
  published: "已发布",
  moderated: "已隐藏（运营处置）",
} as const;

const OWNER_LOCK_ERROR_COPY: Record<string, string> = {
  moderated_work_owner_locked:
    "该作品已被运营隐藏；如需恢复，请联系管理员。",
};

function ErrorAlert({ code }: { code: string | null }) {
  if (!code) return null;
  const message = OWNER_LOCK_ERROR_COPY[code] ?? "操作失败，请稍后重试。";
  return (
    <div
      role="alert"
      aria-live="polite"
      className="museum-tag mt-4 block max-w-3xl text-sm leading-6 text-[color:var(--accent-strong)]"
    >
      {message}（错误码：{code}）
    </div>
  );
}

export default async function StudioWorksPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[]>>;
}) {
  const accessControl = await getRequestAccessControl();
  const session = accessControl.session;

  if (session.status !== "authenticated" || !accessControl.studioGuard.allowed) {
    redirect(accessControl.studioGuard.redirectTo ?? "/login");
    return null;
  }

  const params = (await searchParams) ?? {};
  const errorParam = params.error;
  const errorCode =
    typeof errorParam === "string"
      ? errorParam
      : Array.isArray(errorParam)
        ? errorParam[0] ?? null
        : null;

  const managedWorks = await getStudioWorksEditorModel(session.primaryRole);

  return (
    <main className="museum-page">
      <section className="museum-shell flex flex-col gap-10 pt-14">
        <PageHero
          eyebrow="作品"
          title="管理作品"
          actions={[{ href: "/studio", label: "总览" }]}
          tone="utility"
        />
        <ErrorAlert code={errorCode} />

        <form
          action={saveStudioWorkAction}
          className="museum-panel grid gap-4 p-6 md:p-8"
        >
          <div className="space-y-2">
            <p className="museum-label">新增</p>
            <h2 className="font-display text-4xl leading-none tracking-[-0.03em] text-[color:var(--accent-strong)]">
              新建
            </h2>
          </div>
          <input
            name="title"
            placeholder="标题"
            className="museum-field"
          />
          <input
            name="category"
            placeholder="分类"
            className="museum-field"
          />
          <input
            name="coverAsset"
            placeholder="封面资源"
            defaultValue="work:new-work:cover"
            className="museum-field"
          />
          <textarea
            name="description"
            rows={3}
            placeholder="摘要"
            className="museum-textarea"
          />
          <textarea
            name="detailNote"
            rows={4}
            placeholder="说明"
            className="museum-textarea"
          />
          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              name="intent"
              value="save_draft"
              className="museum-button-secondary"
            >
              存草稿
            </button>
            <button
              type="submit"
              name="intent"
              value="publish"
              className="museum-button-primary"
            >
              发布
            </button>
          </div>
        </form>

        <div className="grid gap-5">
          {managedWorks.map((work) => {
            // Phase 2 — Ops Back Office V1 (FR-004 #6 / I-14):
            // moderated 作品对 owner 仍可见但 owner 不能 publish/revert/save。
            // 所有处置按钮抑制；只渲染只读视图 + 申诉提示。
            if (work.status === "moderated") {
              return (
                <article
                  key={work.id}
                  className="museum-panel museum-panel--soft grid gap-4 p-6 md:p-8"
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="museum-label">{work.category}</p>
                    <span className="museum-tag">{STATUS_LABEL.moderated}</span>
                  </div>
                  <h3 className="font-display text-2xl text-[color:var(--accent-strong)]">
                    {work.title}
                  </h3>
                  <p className="text-sm leading-6 text-[color:var(--muted-strong)]">
                    {work.description}
                  </p>
                  {work.detailNote ? (
                    <p className="text-xs leading-6 text-[color:var(--muted-strong)]">
                      {work.detailNote}
                    </p>
                  ) : null}
                  <p className="text-xs leading-6 text-[color:var(--muted-strong)]">
                    该作品已被运营隐藏。如需申请恢复，请联系管理员。
                  </p>
                </article>
              );
            }

            return (
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
                      {STATUS_LABEL[work.status]}
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
                    {work.status === "published" ? "保存" : "发布"}
                  </button>
                  {work.status === "draft" ? (
                    <button
                      type="submit"
                      name="intent"
                      value="save_draft"
                      className="museum-button-secondary"
                    >
                      存草稿
                    </button>
                  ) : null}
                  <button
                    type="submit"
                    name="intent"
                    value="revert_to_draft"
                    className="museum-button-secondary"
                  >
                    转草稿
                  </button>
                </div>
              </form>
            );
          })}
        </div>
      </section>
    </main>
  );
}
