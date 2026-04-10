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
      className="museum-panel museum-panel--soft p-6 md:p-8"
    >
      <div id={`home-discovery-${section.kind}`}>
        <SectionHeading
          eyebrow="Discovery Section"
          title={section.title}
          description={section.description}
        />
      </div>

      {section.items.length > 0 ? (
        <div className="mt-8 grid gap-5 xl:grid-cols-3">
          {section.items.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="museum-card group block p-5"
            >
              <EditorialVisual
                assetRef={item.assetRef}
                label={item.badge}
                variant="landscape"
              />
              <h3 className="font-display museum-clamp-2 mt-5 text-3xl leading-none tracking-[-0.03em] text-[color:var(--accent-strong)]">
                {item.title}
              </h3>
              <p className="museum-clamp-2 mt-3 text-sm leading-7 text-[color:var(--muted-strong)]">
                {item.description}
              </p>
              {item.meta ? (
                <p className="museum-label mt-5">
                  {item.meta}
                </p>
              ) : null}
            </Link>
          ))}
        </div>
      ) : (
        <div className="museum-empty mt-8 px-5 py-8">
          <p className="text-sm leading-7 text-[color:var(--muted-strong)]">
            {section.emptyStateCopy}
          </p>
        </div>
      )}
    </section>
  );
}
