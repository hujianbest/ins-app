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
    <main className="pb-24 text-white">
      <section className="mx-auto w-full max-w-7xl px-6 pt-12 sm:px-10 lg:px-14">
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
                <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/80">
                  Browse Logic
                </p>
                <h2 className="mt-3 text-2xl font-medium text-white">
                  精选、最新与关注中保持稳定层级
                </h2>
              </div>
              <div className="rounded-[1.4rem] border border-white/10 bg-black/20 p-4 text-sm leading-7 text-slate-300">
                当前登录状态：
                {session.isAuthenticated ? " 已登录成员，可查看关注中的内容更新。" : " 访客模式，保持公开可浏览并展示稳定空态。"}
              </div>
            </div>
          }
        />
      </section>

      <section className="mx-auto w-full max-w-7xl px-6 pt-14 sm:px-10 lg:px-14">
        <div className="grid gap-6">
          {sections.map((section) => (
            <HomeDiscoverySection key={section.kind} section={section} />
          ))}
        </div>
      </section>
    </main>
  );
}
