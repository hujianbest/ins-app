import Link from "next/link";
import { notFound } from "next/navigation";

import { getSessionRole } from "@/features/auth/session";
import {
  getPublicProfilePageModel,
  getPublicWorkPageModel,
  listPublicWorkPageParams,
} from "@/features/community/public-read-model";
import { startContactThreadAction } from "@/features/contact/actions";
import { DiscoveryViewBeacon } from "@/features/discovery/view-beacon";
import { toggleWorkLikeAction } from "@/features/engagement/actions";
import { isWorkLiked } from "@/features/engagement/state";
import { RelatedWorksSection } from "@/features/recommendations/related-works-section";
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

  const ownerProfile = await getPublicProfilePageModel(
    work.ownerRole,
    work.ownerSlug,
  );

  const sessionRole = await getSessionRole();
  const liked = await isWorkLiked(work.id);
  const comments = await getWorkComments(work.id);

  return (
    <main className="museum-page">
      <DiscoveryViewBeacon
        eventType="work_view"
        targetType="work"
        targetId={work.id}
        targetProfileId={
          ownerProfile ? `${ownerProfile.role}:${ownerProfile.slug}` : undefined
        }
        surface="work_detail"
      />
      <section className="museum-shell flex flex-col gap-10 pt-14">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="museum-label">{getRoleLabel(work.ownerRole)}作品</p>
          <Link
            href={`/${work.ownerRole}s/${work.ownerSlug}`}
            className="museum-button-quiet text-sm uppercase tracking-[0.3em]"
          >
            进入创作者主页
          </Link>
        </div>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] lg:items-start">
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <span className="museum-label">{work.category}</span>
                <span className="museum-tag">
                  详情
                </span>
              </div>
              <h1 className="font-display max-w-4xl text-5xl leading-none tracking-[-0.04em] text-[color:var(--accent-strong)] sm:text-6xl lg:text-7xl">
                {work.title}
              </h1>
              <p className="max-w-3xl text-base leading-8 text-[color:var(--muted-strong)] sm:text-lg">
                {work.description}
              </p>
            </div>

            <div className="grid gap-4 text-sm text-[color:var(--muted-strong)] sm:grid-cols-3">
              <div className="museum-stat p-5">
                <p className="museum-label">作者</p>
                <p className="mt-3 text-base text-[color:var(--accent-strong)]">{work.ownerName}</p>
              </div>
              <div className="museum-stat p-5">
                <p className="museum-label">点赞</p>
                {sessionRole ? (
                  <form action={toggleWorkLikeAction.bind(null, work.id, `/works/${work.id}`)}>
                    <button
                      type="submit"
                      className="museum-button-secondary mt-3"
                    >
                      {liked ? "已点赞" : "点赞"}
                    </button>
                  </form>
                ) : (
                  <Link href="/login" className="museum-button-quiet mt-3 text-base">
                    登录后点赞
                  </Link>
                )}
              </div>
              <div className="museum-stat p-5">
                <p className="museum-label">联系</p>
                {sessionRole ? (
                  <form action={startContactThreadAction.bind(null, work.ownerRole, work.ownerSlug, "work", work.id)}>
                    <button
                      type="submit"
                      className="museum-button-primary mt-3"
                    >
                      私信
                    </button>
                  </form>
                ) : (
                  <Link href="/login" className="museum-button-quiet mt-3 text-base">
                    登录后私信
                  </Link>
                )}
              </div>
            </div>
          </div>

          <div className="museum-panel p-6 md:p-7">
            <EditorialVisual
              assetRef={work.coverAsset}
              label="作品详情视觉"
              variant="portrait"
              imageLoading="eager"
              showSourceLabel
            />
          </div>
        </div>

        {ownerProfile ? (
          <section className="museum-panel museum-panel--soft p-6 md:p-8">
            <p className="museum-label">创作者语境</p>
            <div className="mt-5 grid gap-4 text-sm text-[color:var(--muted-strong)] md:grid-cols-3">
              <div className="museum-stat p-5">
                <p className="museum-label">城市</p>
                <p className="mt-3 text-base text-[color:var(--accent-strong)]">
                  {ownerProfile.city}
                </p>
              </div>
              <div className="museum-stat p-5">
                <p className="museum-label">主要方向</p>
                <p className="mt-3 text-base text-[color:var(--accent-strong)]">
                  {ownerProfile.shootingFocus || "未填写"}
                </p>
              </div>
              <div className="museum-stat p-5">
                <p className="museum-label">可信承接</p>
                <div className="mt-3 flex flex-wrap gap-3">
                  <Link
                    href={`/${work.ownerRole}s/${work.ownerSlug}`}
                    className="museum-button-secondary"
                  >
                    进入创作者主页
                  </Link>
                  {ownerProfile.externalHandoffUrl ? (
                    <Link
                      href={`/outbound/${work.ownerRole}/${work.ownerSlug}`}
                      className="museum-button-quiet"
                    >
                      查看主外部承接
                    </Link>
                  ) : null}
                </div>
              </div>
            </div>
            <p className="mt-5 max-w-4xl text-base leading-8 text-[color:var(--muted-strong)]">
              {ownerProfile.discoveryContext || "当前未填写公开发现语境。"}
            </p>
          </section>
        ) : null}

        <section className="museum-panel museum-panel--soft p-6 md:p-8">
          <p className="museum-label">说明</p>
          <p className="mt-4 max-w-4xl text-base leading-8 text-[color:var(--muted-strong)]">
            {work.detailNote}
          </p>
        </section>

        <RelatedWorksSection seed={{ workId: work.id }} />

        <section className="museum-panel p-6 md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <SectionHeading
              eyebrow="评论"
              title="评论"
            />
            {sessionRole ? (
              <form action={addWorkCommentAction.bind(null, work.id, `/works/${work.id}`)} className="flex w-full max-w-xl flex-col gap-3">
                <textarea
                  name="body"
                  rows={3}
                  placeholder="写点看法"
                  className="museum-textarea"
                />
                <button
                  type="submit"
                  className="museum-button-primary w-fit"
                >
                  发表评论
                </button>
              </form>
            ) : (
              <Link href="/login" className="museum-button-quiet text-base">
                登录后评论
              </Link>
            )}
          </div>

          <div className="mt-6 grid gap-4">
            {comments.length > 0 ? (
              comments.map((comment) => (
                <article
                  key={comment.id}
                  className="museum-stat p-5"
                >
                  <p className="museum-label">
                    {comment.authorLabel}
                  </p>
                  <p className="mt-3 text-base leading-7 text-[color:var(--muted-strong)]">
                    {comment.body}
                  </p>
                </article>
              ))
            ) : (
              <p className="text-sm leading-7 text-[color:var(--muted-strong)]">
                暂无评论。
              </p>
            )}
          </div>
        </section>
      </section>
    </main>
  );
}
