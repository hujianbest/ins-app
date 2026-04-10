import { getSessionContext } from "@/features/auth/session";
import { HomeDiscoverySection } from "@/features/home-discovery/home-discovery-section";
import { resolveHomeDiscoverySections } from "@/features/home-discovery/resolver";
import { PageHero } from "@/features/shell/page-hero";

export default async function DiscoverPage() {
  const session = await getSessionContext();
  const sections = await resolveHomeDiscoverySections({
    surface: "discover",
    accountId: session.accountId,
  });

  return (
    <main className="museum-page">
      <section className="museum-shell pt-14">
        <PageHero
          eyebrow="发现"
          title="继续发现作品与创作者"
          description="精选、最新、关注。"
          actions={[
            { href: "/", label: "首页" },
            { href: "/studio", label: "工作台", variant: "primary" },
            { href: "/opportunities", label: "诉求" },
          ]}
          aside={
            <div className="museum-stat p-4 text-sm leading-7 text-[color:var(--muted-strong)]">
              {session.isAuthenticated ? "已登录，可看关注更新。" : "访客可浏览公开内容。"}
            </div>
          }
        />
      </section>

      <section className="museum-shell pt-14">
        <div className="grid gap-6">
          {sections.map((section) => (
            <HomeDiscoverySection key={section.kind} section={section} />
          ))}
        </div>
      </section>
    </main>
  );
}
