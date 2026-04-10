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
          eyebrow="首页"
          title="从作品开始浏览"
          description="精选、创作者、诉求。"
          actions={[
            { href: "/discover", label: "发现", variant: "primary" },
            { href: "/studio", label: "工作台" },
            { href: "/opportunities", label: "诉求" },
          ]}
          supporting={
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="museum-stat p-5">
                <p className="museum-label">精选</p>
                <p className="mt-3 text-base text-[color:var(--accent-strong)]">
                  先看作品。
                </p>
              </div>
              <div className="museum-stat p-5">
                <p className="museum-label">发布</p>
                <p className="mt-3 text-base text-[color:var(--accent-strong)]">
                  工作台发布。
                </p>
              </div>
              <div className="museum-stat p-5">
                <p className="museum-label">诉求</p>
                <p className="mt-3 text-base text-[color:var(--accent-strong)]">
                  单独查看。
                </p>
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
          <p className="museum-label">本地素材包</p>
          <p className="mt-4 max-w-4xl text-sm leading-7 text-[color:var(--muted-strong)] sm:text-base">
            {seedContentDisclosure}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {seedContentSourceManifest.slice(0, 4).map((asset) => (
              <span
                key={asset.id}
                className="museum-tag"
              >
                {asset.sourceName}
              </span>
            ))}
          </div>
          <p className="mt-5 text-xs uppercase tracking-[0.26em] text-[color:var(--muted)]">
            图片文件已本地化到仓库，不再依赖第三方图片外链。
          </p>
        </div>
      </section>
    </main>
  );
}
