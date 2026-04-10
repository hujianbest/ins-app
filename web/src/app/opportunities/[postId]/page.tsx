import Link from "next/link";
import { notFound } from "next/navigation";

import { getSessionRole } from "@/features/auth/session";
import { startContactThreadAction } from "@/features/contact/actions";
import { EditorialVisual } from "@/features/shell/editorial-visual";
import { PageHero } from "@/features/shell/page-hero";
import { getOpportunityPostById, opportunityPosts } from "@/features/showcase/sample-data";

export function generateStaticParams() {
  return opportunityPosts.map((post) => ({ postId: post.id }));
}

function getOpportunityOwnerLabel(ownerRole: "photographer" | "model") {
  return ownerRole === "photographer" ? "摄影师诉求" : "模特诉求";
}

export default async function OpportunityDetailPage({
  params,
}: {
  params: Promise<{ postId: string }>;
}) {
  const { postId } = await params;
  const post = getOpportunityPostById(postId);

  if (!post) {
    notFound();
  }

  const sessionRole = await getSessionRole();
  const profileHref = `/${post.ownerRole}s/${post.ownerSlug}`;

  return (
    <main className="museum-page">
      <section className="museum-shell flex flex-col gap-10 pt-14">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="museum-label">
            {post.ownerRole === "photographer" ? "摄影师诉求" : "模特诉求"}
          </p>
          <Link href="/opportunities" className="museum-button-quiet text-sm uppercase tracking-[0.3em]">
            返回
          </Link>
        </div>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] lg:items-start">
          <div className="space-y-8">
            <PageHero
              eyebrow="诉求"
              title={post.title}
              description={post.summary}
            />

            <div className="grid gap-4 text-sm text-[color:var(--muted-strong)] sm:grid-cols-3">
              <div className="museum-stat p-5">
                <p className="museum-label">城市</p>
                <p className="mt-3 text-base text-[color:var(--accent-strong)]">{post.city}</p>
              </div>
              <div className="museum-stat p-5">
                <p className="museum-label">档期</p>
                <p className="mt-3 text-base text-[color:var(--accent-strong)]">{post.schedule}</p>
              </div>
              <div className="museum-stat p-5">
                <p className="museum-label">作者</p>
                <p className="mt-3 text-base text-[color:var(--accent-strong)]">{post.ownerName}</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="museum-panel p-6 md:p-7">
              <EditorialVisual
                assetRef={post.coverAsset}
                label={getOpportunityOwnerLabel(post.ownerRole)}
                variant="portrait"
                description={`${post.city} · ${post.schedule}`}
                imageLoading="eager"
              />
            </div>

            <div className="museum-panel p-6 md:p-7">
              <p className="museum-label">主页</p>
              <p className="mt-4 text-sm leading-7 text-[color:var(--muted-strong)]">
                先查看发布者主页，再继续确认档期与合作方向。
              </p>
              <div className="mt-5 space-y-4">
                <Link href={profileHref} className="museum-button-quiet text-base">
                  主页
                </Link>
                {sessionRole ? (
                  <form
                    action={startContactThreadAction.bind(null, post.ownerRole, post.ownerSlug, "opportunity", post.id)}
                  >
                    <button
                      type="submit"
                      className="museum-button-primary"
                    >
                      私信
                    </button>
                  </form>
                ) : (
                  <Link href="/login" className="museum-button-quiet text-base">
                    登录后私信
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
