import Link from "next/link";

import { opportunityPosts } from "@/features/showcase/sample-data";

export default function OpportunitiesPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(163,230,255,0.16),_transparent_26%),linear-gradient(180deg,_#050816_0%,_#0b1020_54%,_#111827_100%)] text-white">
      <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-10 px-6 py-10 sm:px-10 lg:px-14">
        <header className="space-y-4">
          <p className="text-sm uppercase tracking-[0.35em] text-cyan-200/80">公开约拍板</p>
          <h1 className="max-w-4xl text-5xl font-semibold tracking-tight sm:text-6xl">当前诉求</h1>
          <p className="max-w-3xl text-lg leading-8 text-slate-300">
            浏览摄影师和模特当前发布的城市与档期诉求，再继续进入完整详情或对应创作者主页。
          </p>
        </header>

        <div className="grid gap-5 lg:grid-cols-2">
          {opportunityPosts.map((post) => (
            <Link
              key={post.id}
              href={`/opportunities/${post.id}`}
              className="block rounded-[2rem] border border-white/10 bg-white/6 p-6 backdrop-blur transition hover:border-cyan-200/40 hover:bg-white/10"
            >
              <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/80">
                {post.ownerRole === "photographer" ? "摄影师诉求" : "模特诉求"}
              </p>
              <h2 className="mt-4 text-3xl font-medium text-white">{post.title}</h2>
              <div className="mt-5 grid gap-4 text-sm text-slate-300 sm:grid-cols-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-white/50">城市</p>
                  <p className="mt-2 text-base text-white">{post.city}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-white/50">档期</p>
                  <p className="mt-2 text-base text-white">{post.schedule}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-white/50">发布者</p>
                  <p className="mt-2 text-base text-white">{post.ownerName}</p>
                </div>
              </div>
              <p className="mt-5 text-sm leading-7 text-slate-300">{post.summary}</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
