import Link from "next/link";

import { EditorialVisual } from "@/features/shell/editorial-visual";
import { SectionHeading } from "@/features/shell/section-heading";

import type { HomeDiscoverySection as HomeDiscoverySectionViewModel } from "./types";

type HomeDiscoverySectionProps = {
  section: HomeDiscoverySectionViewModel;
};

export function HomeDiscoverySection({ section }: HomeDiscoverySectionProps) {
  return (
    <section
      id={`discovery-section-${section.kind}`}
      aria-labelledby={`home-discovery-${section.kind}`}
      className="rounded-[2rem] border border-white/10 bg-[rgba(14,18,28,0.62)] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.22)] backdrop-blur-xl"
    >
      <div id={`home-discovery-${section.kind}`}>
        <SectionHeading
          eyebrow="Discovery Section"
          title={section.title}
          description={section.description}
        />
      </div>

      {section.items.length > 0 ? (
        <div className="mt-8 grid gap-4 xl:grid-cols-3">
          {section.items.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="group rounded-[1.6rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.01))] p-5 transition hover:-translate-y-0.5 hover:border-cyan-200/40 hover:bg-[rgba(255,255,255,0.08)]"
            >
              <EditorialVisual
                assetRef={item.assetRef}
                label={item.badge}
                variant="landscape"
              />
              <h3 className="mt-4 text-xl font-medium text-white transition group-hover:text-cyan-100">
                {item.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-slate-300">{item.description}</p>
              {item.meta ? (
                <p className="mt-5 text-xs uppercase tracking-[0.24em] text-white/45">
                  {item.meta}
                </p>
              ) : null}
            </Link>
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-[1.5rem] border border-dashed border-white/15 bg-black/20 px-5 py-8">
          <p className="text-sm leading-7 text-slate-300">
            {section.emptyStateCopy}
          </p>
        </div>
      )}
    </section>
  );
}
