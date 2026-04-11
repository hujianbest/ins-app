import {
  OpportunityCard,
  getOpportunityOwnerLabel,
  getOpportunityVisualDescription,
} from "@/features/opportunities/opportunity-card";
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
          {opportunityPosts.map((post, index) => (
            <OpportunityCard
              key={post.id}
              href={`/opportunities/${post.id}`}
              assetRef={post.coverAsset}
              visualLabel={getOpportunityOwnerLabel(post.ownerRole)}
              visualDescription={getOpportunityVisualDescription(
                post.city,
                post.schedule,
              )}
              imageLoading={index === 0 ? "eager" : undefined}
              title={post.title}
              summary={post.summary}
              ownerName={post.ownerName}
              detailStats={[
                { label: "城市", value: post.city },
                { label: "档期", value: post.schedule },
                { label: "发布者", value: post.ownerName },
              ]}
              showFooterMeta={false}
              titleTag="h2"
              titleClassName="mt-4 text-2xl font-medium leading-8 tracking-[-0.02em] text-[color:var(--accent-strong)] sm:text-3xl"
              cardClassName="p-6"
            />
          ))}
        </div>
      </section>
    </main>
  );
}
