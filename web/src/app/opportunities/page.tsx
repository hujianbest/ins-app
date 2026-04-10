import Link from "next/link";

import { PageHero } from "@/features/shell/page-hero";
import { opportunityPosts } from "@/features/showcase/sample-data";

export default function OpportunitiesPage() {
  return (
    <main className="museum-page">
      <section className="museum-shell flex flex-col gap-10 pt-14">
        <PageHero
          eyebrow="公开约拍板"
          title="诉求"
          description="按城市、档期与发布者快速浏览。"
          actions={[
            { href: "/discover", label: "发现" },
            { href: "/studio/opportunities", label: "管理", variant: "primary" },
          ]}
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
              <p className="museum-clamp-2 mt-5 text-sm leading-7 text-[color:var(--muted-strong)]">{post.summary}</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
