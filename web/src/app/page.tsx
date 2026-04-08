import Link from "next/link";
import { HomeDiscoverySection } from "@/features/home-discovery/home-discovery-section";
import { resolveHomeDiscoverySections } from "@/features/home-discovery/resolver";
import {
  homeHeroContent,
  homePageFeaturedPaths,
  homePagePillars,
} from "@/features/showcase/sample-data";

export default function Home() {
  const discoverySections = resolveHomeDiscoverySections();

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(163,230,255,0.18),_transparent_28%),linear-gradient(180deg,_#050816_0%,_#0b1020_52%,_#111827_100%)] text-white">
      <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col justify-between px-6 py-10 sm:px-10 lg:px-14">
        <div className="flex items-center justify-between text-sm uppercase tracking-[0.3em] text-white/70">
          <p>Lens Archive</p>
          <p>Portfolio showcase platform</p>
        </div>

        <div className="grid gap-16 py-16 lg:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)] lg:items-end">
          <div className="space-y-8">
            <div className="space-y-4">
              <p className="text-sm uppercase tracking-[0.4em] text-cyan-200/80">
                {homeHeroContent.label}
              </p>
              <h1 className="max-w-4xl text-5xl font-semibold tracking-tight text-white sm:text-6xl lg:text-7xl">
                {homeHeroContent.title}
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
                {homeHeroContent.description}
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
              <Link
                href={homeHeroContent.primaryCta.href}
                className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-medium text-slate-950 transition hover:bg-cyan-100"
              >
                {homeHeroContent.primaryCta.label}
              </Link>
              <Link
                href={homeHeroContent.secondaryCta.href}
                className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-3 text-sm font-medium text-white transition hover:border-cyan-200/70 hover:bg-white/5"
              >
                {homeHeroContent.secondaryCta.label}
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/6 p-6 backdrop-blur">
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-200/80">Featured Pathways</p>
            <div className="mt-6 space-y-4">
              {homePageFeaturedPaths.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block rounded-[1.5rem] border border-white/10 bg-black/20 p-5 transition hover:border-cyan-200/40 hover:bg-white/10"
                >
                  <p className="text-xs uppercase tracking-[0.28em] text-white/50">{item.eyebrow}</p>
                  <h2 className="mt-3 text-2xl font-medium text-white">{item.title}</h2>
                  <p className="mt-3 text-sm leading-7 text-slate-300">{item.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-6 border-t border-white/10 pt-8 text-sm text-slate-300 md:grid-cols-3">
          {homePagePillars.map((pillar) => (
            <div key={pillar.title}>
              <p className="text-xs uppercase tracking-[0.3em] text-white/50">{pillar.title}</p>
              <p className="mt-2 leading-7">{pillar.description}</p>
            </div>
          ))}
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
