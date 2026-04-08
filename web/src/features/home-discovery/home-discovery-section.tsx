import Link from "next/link";

import type { HomeDiscoverySection as HomeDiscoverySectionViewModel } from "./types";

type HomeDiscoverySectionProps = {
  section: HomeDiscoverySectionViewModel;
};

const emptyStateCopyByKind: Record<HomeDiscoverySectionViewModel["kind"], string> = {
  works: "更多作品精选即将上线。",
  profiles: "更多主页精选即将上线。",
  opportunities: "更多约拍诉求即将上线。",
};

export function HomeDiscoverySection({ section }: HomeDiscoverySectionProps) {
  return (
    <section
      aria-labelledby={`home-discovery-${section.kind}`}
      className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur"
    >
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/80">首页发现</p>
        <h2 id={`home-discovery-${section.kind}`} className="text-2xl font-medium text-white">
          {section.title}
        </h2>
        <p className="max-w-2xl text-sm leading-7 text-slate-300">{section.description}</p>
      </div>

      {section.items.length > 0 ? (
        <div className="mt-6 grid gap-4 xl:grid-cols-3">
          {section.items.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5 transition hover:border-cyan-200/40 hover:bg-white/10"
            >
              <p className="text-xs uppercase tracking-[0.28em] text-cyan-200/80">{item.badge}</p>
              <h3 className="mt-3 text-xl font-medium text-white">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-300">{item.description}</p>
              {item.meta ? <p className="mt-4 text-xs uppercase tracking-[0.24em] text-white/50">{item.meta}</p> : null}
            </Link>
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-[1.5rem] border border-dashed border-white/15 bg-black/20 px-5 py-8">
          <p className="text-sm leading-7 text-slate-300">
            {emptyStateCopyByKind[section.kind]}
          </p>
        </div>
      )}
    </section>
  );
}
