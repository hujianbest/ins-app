import Link from "next/link";

import { PageHero } from "@/features/shell/page-hero";
import { opportunityPosts } from "@/features/showcase/sample-data";

export default function OpportunitiesPage() {
  return (
    <main className="museum-page">
      <section className="museum-shell flex flex-col gap-10 pt-14">
        <PageHero
          eyebrow="公开约拍板"
          title="当前诉求"
          description="浏览摄影师和模特当前发布的城市与档期诉求，再继续进入完整详情或对应创作者主页。"
          actions={[
            { href: "/discover", label: "回到发现页" },
            { href: "/studio/opportunities", label: "进入诉求工作台", variant: "primary" },
          ]}
          aside={
            <div className="space-y-4">
              <p className="museum-label">Curation Rule</p>
              <p className="text-sm leading-7 text-[color:var(--muted-strong)]">
                每条诉求都保持城市、档期、发布者和摘要在同一阅读块中，优先帮助品牌或创作者快速判断是否值得继续沟通。
              </p>
            </div>
          }
        />

        <div className="grid gap-5 lg:grid-cols-2">
          {opportunityPosts.map((post) => (
            <Link
              key={post.id}
              href={`/opportunities/${post.id}`}
              className="museum-card block p-6"
            >
              <p className="museum-label">
                {post.ownerRole === "photographer" ? "摄影师诉求" : "模特诉求"}
              </p>
              <h2 className="font-display mt-4 text-4xl leading-none tracking-[-0.03em] text-[color:var(--accent-strong)]">
                {post.title}
              </h2>
              <div className="mt-5 grid gap-4 text-sm text-[color:var(--muted-strong)] sm:grid-cols-3">
                <div>
                  <p className="museum-label">城市</p>
                  <p className="mt-2 text-base text-[color:var(--accent-strong)]">{post.city}</p>
                </div>
                <div>
                  <p className="museum-label">档期</p>
                  <p className="mt-2 text-base text-[color:var(--accent-strong)]">{post.schedule}</p>
                </div>
                <div>
                  <p className="museum-label">发布者</p>
                  <p className="mt-2 text-base text-[color:var(--accent-strong)]">{post.ownerName}</p>
                </div>
              </div>
              <p className="mt-5 text-sm leading-7 text-[color:var(--muted-strong)]">{post.summary}</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
