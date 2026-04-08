import Link from "next/link";
import { notFound } from "next/navigation";

import { getSessionRole } from "@/features/auth/session";
import { startContactThreadAction } from "@/features/contact/actions";
import { getOpportunityPostById, opportunityPosts } from "@/features/showcase/sample-data";

export function generateStaticParams() {
  return opportunityPosts.map((post) => ({ postId: post.id }));
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
  const profileLabel = `查看${post.ownerRole === "photographer" ? "摄影师" : "模特"}主页`;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(103,232,249,0.14),_transparent_20%),linear-gradient(180deg,_#050816_0%,_#0f172a_56%,_#111827_100%)] text-white">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-10 px-6 py-10 sm:px-10 lg:px-14">
        <div className="flex flex-wrap items-center justify-between gap-4 text-sm uppercase tracking-[0.3em] text-white/60">
          <p>{post.ownerRole === "photographer" ? "摄影师诉求" : "模特诉求"}</p>
          <Link href="/opportunities" className="transition hover:text-cyan-200">
            返回诉求列表
          </Link>
        </div>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] lg:items-start">
          <div className="space-y-6">
            <div className="space-y-3">
              <p className="text-sm uppercase tracking-[0.35em] text-cyan-200/80">公开诉求</p>
              <h1 className="max-w-4xl text-5xl font-semibold tracking-tight sm:text-6xl">{post.title}</h1>
              <p className="max-w-3xl text-lg leading-8 text-slate-300">{post.summary}</p>
            </div>

            <div className="grid gap-4 text-sm text-slate-300 sm:grid-cols-3">
              <div className="rounded-3xl border border-white/10 bg-white/6 p-5 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.28em] text-white/50">城市</p>
                <p className="mt-3 text-base text-white">{post.city}</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/6 p-5 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.28em] text-white/50">档期</p>
                <p className="mt-3 text-base text-white">{post.schedule}</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/6 p-5 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.28em] text-white/50">发布者</p>
                <p className="mt-3 text-base text-white">{post.ownerName}</p>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/6 p-6 backdrop-blur">
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">主页信息</p>
            <div className="mt-5 space-y-4">
              <Link href={profileHref} className="inline-flex text-base text-cyan-200 transition hover:text-white">
                {profileLabel}
              </Link>
              {sessionRole ? (
                <form
                  action={startContactThreadAction.bind(null, post.ownerRole, post.ownerSlug, "opportunity", post.id)}
                >
                  <button
                    type="submit"
                    className="inline-flex rounded-full border border-cyan-200/40 px-4 py-2 text-base text-cyan-200 transition hover:border-white/60 hover:text-white"
                  >
                    发送关于该诉求的私信
                  </button>
                </form>
              ) : (
                <Link href="/login" className="inline-flex text-base text-cyan-200 transition hover:text-white">
                  {post.contactLabel}
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
