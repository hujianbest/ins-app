import Link from "next/link";

import { HomeDiscoverySection } from "@/features/home-discovery/home-discovery-section";
import { resolveHomeDiscoverySections } from "@/features/home-discovery/resolver";

export default async function Home() {
  const discoverySections = await resolveHomeDiscoverySections({
    surface: "home",
  });

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(163,230,255,0.18),_transparent_28%),linear-gradient(180deg,_#050816_0%,_#0b1020_52%,_#111827_100%)] text-white">
      <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col justify-between px-6 py-10 sm:px-10 lg:px-14">
        <div className="flex items-center justify-between text-sm uppercase tracking-[0.3em] text-white/70">
          <p>Lens Archive</p>
          <p>摄影社区主线</p>
        </div>

        <div className="grid gap-16 py-16 lg:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)] lg:items-end">
          <div className="space-y-8">
            <div className="space-y-4">
              <p className="text-sm uppercase tracking-[0.4em] text-cyan-200/80">
                社区浏览入口
              </p>
              <h1 className="max-w-4xl text-5xl font-semibold tracking-tight text-white sm:text-6xl lg:text-7xl">
                摄影社区发现首页
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
                优先浏览精选作品、最新发布与值得继续关注的创作者更新，把首页重新收拢为摄影社区的持续发现入口。
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
              <Link
                href="/discover"
                className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-medium text-slate-950 transition hover:bg-cyan-100"
              >
                进入社区发现
              </Link>
              <Link
                href="/discover#discovery-section-latest"
                className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-3 text-sm font-medium text-white transition hover:border-cyan-200/70 hover:bg-white/5"
              >
                查看最新发布
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/6 p-6 backdrop-blur">
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-200/80">次级合作入口</p>
            <div className="mt-6 space-y-4">
              <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
                <p className="text-xs uppercase tracking-[0.28em] text-white/50">合作 teaser</p>
                <h2 className="mt-3 text-2xl font-medium text-white">模特主页与约拍诉求继续保留</h2>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  合作场景仍可继续浏览，但它们不再占据首页首屏主视觉，而是作为社区主线之外的次级入口存在。
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Link
                    href="/models/sample-model"
                    className="inline-flex items-center rounded-full border border-white/15 px-4 py-2 text-sm text-white/90 transition hover:border-cyan-200/70 hover:bg-white/5"
                  >
                    浏览模特主页
                  </Link>
                  <Link
                    href="/opportunities"
                    className="inline-flex items-center rounded-full border border-white/15 px-4 py-2 text-sm text-white/90 transition hover:border-cyan-200/70 hover:bg-white/5"
                  >
                    查看合作诉求
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-6 pb-20 sm:px-10 lg:px-14">
        <div className="grid gap-6">
          {discoverySections.map((section) => (
            <HomeDiscoverySection key={section.kind} section={section} />
          ))}
        </div>
      </section>
    </main>
  );
}
