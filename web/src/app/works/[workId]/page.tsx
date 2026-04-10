import Link from "next/link";
import { notFound } from "next/navigation";

import { getSessionRole } from "@/features/auth/session";
import {
  getPublicWorkPageModel,
  listPublicWorkPageParams,
} from "@/features/community/public-read-model";
import { startContactThreadAction } from "@/features/contact/actions";
import { toggleWorkLikeAction } from "@/features/engagement/actions";
import { isWorkLiked } from "@/features/engagement/state";
import { EditorialVisual } from "@/features/shell/editorial-visual";
import { SectionHeading } from "@/features/shell/section-heading";
import { addWorkCommentAction } from "@/features/social/comment-actions";
import { getWorkComments } from "@/features/social/comments";

function getRoleLabel(role: "photographer" | "model") {
  return role === "photographer" ? "摄影师" : "模特";
}

export async function generateStaticParams() {
  return listPublicWorkPageParams();
}

export default async function WorkDetailPage({
  params,
}: {
  params: Promise<{ workId: string }>;
}) {
  const { workId } = await params;
  const work = await getPublicWorkPageModel(workId);

  if (!work) {
    notFound();
  }

  const sessionRole = await getSessionRole();
  const liked = await isWorkLiked(work.id);
  const comments = await getWorkComments(work.id);

  return (
    <main className="pb-24 text-white">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 pt-12 sm:px-10 lg:px-14">
        <div className="flex flex-wrap items-center justify-between gap-4 text-sm uppercase tracking-[0.3em] text-white/60">
          <p>{getRoleLabel(work.ownerRole)}作品</p>
          <Link href={`/${work.ownerRole}s/${work.ownerSlug}`} className="transition hover:text-cyan-200">
            返回主页
          </Link>
        </div>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] lg:items-start">
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.32em] text-white/45">
                <span className="text-cyan-200/80">{work.category}</span>
                <span className="rounded-full border border-white/10 px-3 py-1 text-[11px]">
                  Work Detail
                </span>
              </div>
              <h1 className="max-w-4xl text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">{work.title}</h1>
              <p className="max-w-3xl text-base leading-8 text-slate-300 sm:text-lg">{work.description}</p>
            </div>

            <div className="grid gap-4 text-sm text-slate-300 sm:grid-cols-3">
              <div className="rounded-[1.6rem] border border-white/10 bg-[rgba(255,255,255,0.04)] p-5">
                <p className="text-xs uppercase tracking-[0.28em] text-white/45">作者</p>
                <p className="mt-3 text-base text-white">{work.ownerName}</p>
              </div>
              <div className="rounded-[1.6rem] border border-white/10 bg-[rgba(255,255,255,0.04)] p-5">
                <p className="text-xs uppercase tracking-[0.28em] text-white/45">点赞</p>
                {sessionRole ? (
                  <form action={toggleWorkLikeAction.bind(null, work.id, `/works/${work.id}`)}>
                    <button
                      type="submit"
                      className="mt-3 inline-flex rounded-full border border-cyan-200/40 px-4 py-2 text-base text-cyan-200 transition hover:border-white/60 hover:text-white"
                    >
                      {liked ? "已点赞" : "点赞这组作品"}
                    </button>
                  </form>
                ) : (
                  <Link href="/login" className="mt-3 inline-flex text-base text-cyan-200 transition hover:text-white">
                    登录后点赞这组作品
                  </Link>
                )}
              </div>
              <div className="rounded-[1.6rem] border border-white/10 bg-[rgba(255,255,255,0.04)] p-5">
                <p className="text-xs uppercase tracking-[0.28em] text-white/45">合作联系</p>
                {sessionRole ? (
                  <form action={startContactThreadAction.bind(null, work.ownerRole, work.ownerSlug, "work", work.id)}>
                    <button
                      type="submit"
                      className="mt-3 inline-flex rounded-full border border-cyan-200/40 px-4 py-2 text-base text-cyan-200 transition hover:border-white/60 hover:text-white"
                    >
                      发送关于这组作品的私信
                    </button>
                  </form>
                ) : (
                  <Link href="/login" className="mt-3 inline-flex text-base text-cyan-200 transition hover:text-white">
                    {work.contactLabel}
                  </Link>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-[rgba(14,18,28,0.72)] p-6 shadow-[0_28px_80px_rgba(0,0,0,0.28)] backdrop-blur-xl">
            <EditorialVisual
              assetRef={work.coverAsset}
              label="作品详情视觉"
              aspectClassName="aspect-[4/5]"
              description="作品主体、作者关系、互动与合作入口都在同一页内完成承接。"
              showSourceLabel
            />
          </div>
        </div>

        <section className="rounded-[2rem] border border-white/10 bg-[rgba(14,18,28,0.7)] p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-white/45">作品说明</p>
          <p className="mt-4 max-w-4xl text-base leading-8 text-slate-300">{work.detailNote}</p>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-[rgba(14,18,28,0.7)] p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <SectionHeading
              eyebrow="评论"
              title="围绕作品留下反馈与交流"
              description="已登录成员可发布 1..500 字纯文本评论，列表按最新优先展示。"
            />
            {sessionRole ? (
              <form action={addWorkCommentAction.bind(null, work.id, `/works/${work.id}`)} className="flex w-full max-w-xl flex-col gap-3">
                <textarea
                  name="body"
                  rows={3}
                  placeholder="写下你对这组作品的看法"
                  className="w-full rounded-[1.5rem] border border-white/10 bg-black/20 px-4 py-3 text-base leading-7 text-white outline-none"
                />
                <button
                  type="submit"
                  className="inline-flex w-fit rounded-full border border-cyan-200/40 px-4 py-2 text-base text-cyan-200 transition hover:border-white/60 hover:text-white"
                >
                  发表评论
                </button>
              </form>
            ) : (
              <Link href="/login" className="inline-flex text-base text-cyan-200 transition hover:text-white">
                登录后发表评论
              </Link>
            )}
          </div>

          <div className="mt-6 grid gap-4">
            {comments.length > 0 ? (
              comments.map((comment) => (
                <article
                  key={comment.id}
                  className="rounded-[1.5rem] border border-white/10 bg-[rgba(255,255,255,0.04)] p-5"
                >
                  <p className="text-xs uppercase tracking-[0.28em] text-white/45">
                    {comment.authorLabel}
                  </p>
                  <p className="mt-3 text-base leading-7 text-slate-200">
                    {comment.body}
                  </p>
                </article>
              ))
            ) : (
              <p className="text-sm leading-7 text-slate-300">
                还没有评论，成为第一个留言的人。
              </p>
            )}
          </div>
        </section>
      </section>
    </main>
  );
}
