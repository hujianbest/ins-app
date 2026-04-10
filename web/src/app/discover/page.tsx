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
          eyebrow="Discover Surface"
          title="持续浏览作品、创作者与值得跟进的摄影灵感"
          description="发现页承接首页之后的持续浏览。未登录用户可以继续浏览精选和最新内容，已登录成员则能在同一结构里看到关注中的更新。"
          actions={[
            { href: "/", label: "返回首页" },
            { href: "/studio", label: "进入工作台", variant: "primary" },
            { href: "/opportunities", label: "查看合作入口" },
          ]}
          aside={
            <div className="space-y-5">
              <div>
                <p className="museum-label">Browse Logic</p>
                <h2 className="font-display mt-3 text-4xl leading-none tracking-[-0.03em] text-[color:var(--accent-strong)]">
                  精选、最新与关注中保持稳定层级
                </h2>
              </div>
              <div className="museum-stat p-4 text-sm leading-7 text-[color:var(--muted-strong)]">
                当前登录状态：
                {session.isAuthenticated ? " 已登录成员，可查看关注中的内容更新。" : " 访客模式，保持公开可浏览并展示稳定空态。"}
              </div>
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
