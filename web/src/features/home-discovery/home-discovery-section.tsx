import { EditorialCard } from "@/features/cards/editorial-card";
import { OpportunityCard } from "@/features/opportunities/opportunity-card";
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
          eyebrow="高匹配发现"
          title={section.title}
          description={section.description}
        />
      </div>

      {section.items.length > 0 ? (
        <div className="mt-8 grid gap-5 xl:grid-cols-3">
          {section.items.map((item, index) => {
            const shouldEagerLoad =
              section.kind === "featured" && index === 0;

            return item.contentKind === "opportunity" ? (
              <OpportunityCard
                key={item.id}
                href={item.href}
                assetRef={item.assetRef}
                visualLabel={item.badge}
                visualDescription={item.visualDescription}
                imageLoading={shouldEagerLoad ? "eager" : undefined}
                title={item.title}
                summary={item.description}
                ownerName={item.meta}
              />
            ) : (
              <EditorialCard
                key={item.id}
                href={item.href}
                assetRef={item.assetRef}
                visualLabel={item.badge}
                visualDescription={item.visualDescription}
                imageLoading={shouldEagerLoad ? "eager" : undefined}
                title={item.title}
                summary={item.description}
                footerText={item.meta}
              />
            )
          })}
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
