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
    <main className="pb-24 text-white">
      <section className="mx-auto w-full max-w-7xl px-6 pt-12 sm:px-10 lg:px-14">
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
              <div className="rounded-[1.6rem] border border-white/10 bg-[rgba(255,255,255,0.04)] p-5">
                <p className="text-xs uppercase tracking-[0.28em] text-white/45">
                  内容主线
                </p>
                <p className="mt-3 text-base text-white">
                  精选作品、创作者摘要与持续浏览入口优先占据首屏。
                </p>
              </div>
              <div className="rounded-[1.6rem] border border-white/10 bg-[rgba(255,255,255,0.04)] p-5">
                <p className="text-xs uppercase tracking-[0.28em] text-white/45">
                  发布能力
                </p>
                <p className="mt-3 text-base text-white">
                  创作者可从工作台进入资料维护、作品编辑与公开发布。
                </p>
              </div>
              <div className="rounded-[1.6rem] border border-white/10 bg-[rgba(255,255,255,0.04)] p-5">
                <p className="text-xs uppercase tracking-[0.28em] text-white/45">
                  合作入口
                </p>
                <p className="mt-3 text-base text-white">
                  保留合作线索与约拍浏览，但不再挤占首页核心叙事。
                </p>
              </div>
            </div>
          }
          aside={
            <div className="space-y-5">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/80">
                  Featured Direction
                </p>
                <h2 className="mt-3 text-2xl font-medium text-white">
                  成熟、克制、以画面为中心的暗色杂志风
                </h2>
              </div>
              <div className="grid gap-3 text-sm text-slate-300">
                <div className="rounded-[1.4rem] border border-white/10 bg-black/20 p-4">
                  首页把精选作品、创作者与合作灵感收成一条连续叙事。
                </div>
                <div className="rounded-[1.4rem] border border-white/10 bg-black/20 p-4">
                  后续通过发现页、作品详情和工作台形成持续浏览与发布闭环。
                </div>
              </div>
            </div>
          }
        />
      </section>

      <section className="mx-auto w-full max-w-7xl px-6 pt-14 sm:px-10 lg:px-14">
        <div className="grid gap-6">
          {discoverySections.map((section) => (
            <HomeDiscoverySection key={section.kind} section={section} />
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-6 pt-10 sm:px-10 lg:px-14">
        <div className="rounded-[2rem] border border-white/10 bg-[rgba(14,18,28,0.62)] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.22)] backdrop-blur-xl">
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/80">
            Seed Content Notice
          </p>
          <p className="mt-4 max-w-4xl text-sm leading-7 text-slate-300 sm:text-base">
            {seedContentDisclosure}
          </p>
          <div className="mt-6 flex flex-wrap gap-3 text-xs uppercase tracking-[0.24em] text-white/50">
            {seedContentSourceManifest.slice(0, 4).map((asset) => (
              <a
                key={asset.id}
                href={asset.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-white/10 px-4 py-2 transition hover:border-cyan-200/50 hover:text-white"
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
