import Link from "next/link";

import { getSessionContext } from "@/features/auth/session";
import { HomeDiscoverySection } from "@/features/home-discovery/home-discovery-section";
import { resolveHomeDiscoverySections } from "@/features/home-discovery/resolver";

export default async function DiscoverPage() {
  const session = await getSessionContext();
  const sections = await resolveHomeDiscoverySections({
    surface: "discover",
    accountId: session.accountId,
  });

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_#050816_0%,_#0b1020_52%,_#111827_100%)] text-white">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-12 sm:px-10 lg:px-14">
        <div className="space-y-4">
          <p className="text-sm uppercase tracking-[0.35em] text-cyan-200/80">
            Discover
          </p>
          <h1 className="max-w-4xl text-4xl font-semibold tracking-tight sm:text-5xl">
            持续浏览社区中的公开作品与创作者
          </h1>
          <p className="max-w-3xl text-base leading-8 text-slate-300 sm:text-lg">
            在精选推荐、最新发布与关注中之间持续切换，保持未登录可浏览，同时为登录成员保留稳定的关注更新区域。
          </p>
        </div>

        <div className="flex flex-wrap gap-3 text-sm text-slate-300">
          <Link
            href="/"
            className="inline-flex items-center rounded-full border border-white/15 px-4 py-2 transition hover:border-cyan-200/70 hover:bg-white/5"
          >
            返回首页
          </Link>
          <Link
            href="/opportunities"
            className="inline-flex items-center rounded-full border border-white/15 px-4 py-2 transition hover:border-cyan-200/70 hover:bg-white/5"
          >
            查看次级合作入口
          </Link>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-6 pb-20 sm:px-10 lg:px-14">
        <div className="grid gap-6">
          {sections.map((section) => (
            <HomeDiscoverySection key={section.kind} section={section} />
          ))}
        </div>
      </section>
    </main>
  );
}
