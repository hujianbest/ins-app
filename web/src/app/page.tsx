import { HomeDiscoverySection } from "@/features/home-discovery/home-discovery-section";
import { resolveHomeDiscoverySections } from "@/features/home-discovery/resolver";
import { PageHero } from "@/features/shell/page-hero";
import {
  seedContentDisclosure,
  seedContentSourceManifest,
} from "@/features/showcase/sample-data";

export default async function Home() {
  const discoverySections = await resolveHomeDiscoverySections({
    surface: "home",
  });

  return (
    <main className="museum-page">
      <section className="museum-shell pt-14">
        <PageHero
          eyebrow="Editorial Discovery"
          title="以作品、创作者与合作灵感重构 Lens Archive 的首页主线"
          description="这不再是单纯的演示站首屏，而是一个面向真实浏览、真实发布与真实合作线索的入口。首页优先承接精选作品、创作者关系和下一步发现路径。"
          actions={[
            { href: "/discover", label: "进入发现流", variant: "primary" },
            { href: "/studio", label: "进入工作台" },
            { href: "/opportunities", label: "查看合作入口" },
          ]}
          supporting={
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="museum-stat p-5">
                <p className="museum-label">内容主线</p>
                <p className="mt-3 text-base text-[color:var(--accent-strong)]">
                  精选作品、创作者摘要与持续浏览入口优先占据首屏。
                </p>
              </div>
              <div className="museum-stat p-5">
                <p className="museum-label">发布能力</p>
                <p className="mt-3 text-base text-[color:var(--accent-strong)]">
                  创作者可从工作台进入资料维护、作品编辑与公开发布。
                </p>
              </div>
              <div className="museum-stat p-5">
                <p className="museum-label">合作入口</p>
                <p className="mt-3 text-base text-[color:var(--accent-strong)]">
                  保留合作线索与约拍浏览，但不再挤占首页核心叙事。
                </p>
              </div>
            </div>
          }
          aside={
            <div className="space-y-5">
              <div>
                <p className="museum-label">Featured Direction</p>
                <h2 className="font-display mt-3 text-4xl leading-none tracking-[-0.03em] text-[color:var(--accent-strong)]">
                  更像线上画廊的留白式编排与作品陈列
                </h2>
              </div>
              <div className="grid gap-3 text-sm text-[color:var(--muted-strong)]">
                <div className="museum-stat p-4">
                  首页把精选作品、创作者与合作灵感收成一条连续叙事。
                </div>
                <div className="museum-stat p-4">
                  后续通过发现页、作品详情和工作台形成持续浏览与发布闭环。
                </div>
              </div>
            </div>
          }
        />
      </section>

      <section className="museum-shell pt-14">
        <div className="grid gap-6">
          {discoverySections.map((section) => (
            <HomeDiscoverySection key={section.kind} section={section} />
          ))}
        </div>
      </section>

      <section className="museum-shell pt-10">
        <div className="museum-panel p-6 md:p-8">
          <p className="museum-label">Seed Content Notice</p>
          <p className="mt-4 max-w-4xl text-sm leading-7 text-[color:var(--muted-strong)] sm:text-base">
            {seedContentDisclosure}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {seedContentSourceManifest.slice(0, 4).map((asset) => (
              <a
                key={asset.id}
                href={asset.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="museum-tag"
              >
                {asset.sourceName}
              </a>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
