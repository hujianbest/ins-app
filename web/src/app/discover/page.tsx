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
          eyebrow="高匹配发现"
          title="按城市、方向与公开语境继续发现"
          description="不是泛浏览，而是继续判断哪组作品、哪位创作者和你的当下语境真正相关。"
          actions={[
            { href: "/", label: "首页" },
            { href: "/search", label: "搜索" },
            { href: "/studio", label: "工作台", variant: "primary" },
            { href: "/opportunities", label: "诉求" },
          ]}
          aside={
            <div className="museum-stat p-4 text-sm leading-7 text-[color:var(--muted-strong)]">
              {session.isAuthenticated
                ? "已登录，可继续查看关注中的高匹配更新。"
                : "访客可先按城市、方向与公开语境浏览公开内容。"}
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
