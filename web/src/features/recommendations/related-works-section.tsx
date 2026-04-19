import { Fragment } from "react";

import { EditorialCard } from "@/features/cards/editorial-card";
import { DiscoveryViewBeacon } from "@/features/discovery/view-beacon";
import { SectionHeading } from "@/features/shell/section-heading";

import {
  type GetRelatedWorksDeps,
  type RelatedWorksSeed,
  getRelatedWorks,
} from "./related-works";

type Props = {
  seed: RelatedWorksSeed;
  deps?: GetRelatedWorksDeps;
};

export async function RelatedWorksSection({ seed, deps }: Props) {
  const result = await getRelatedWorks(seed, deps);
  if (!result) {
    // I-3 / I-11: flag disabled — no panel, no beacon.
    return null;
  }

  return (
    <section className="museum-panel museum-panel--soft p-6 md:p-8">
      <SectionHeading eyebrow="相关作品" title="也看看这些作品" />
      {result.kind === "empty" ? (
        <p className="mt-4 text-sm leading-7 text-[color:var(--muted-strong)]">
          暂无更多相关作品。
        </p>
      ) : (
        <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {result.cards.map((card) => (
            <Fragment key={card.workId}>
              <EditorialCard
                href={`/works/${card.workId}`}
                assetRef={card.coverAsset || undefined}
                visualLabel={card.category || "作品"}
                visualVariant="card"
                title={card.title}
                summary={
                  card.ownerName
                    ? `${card.ownerName}・${card.category}`
                    : card.category
                }
                titleTag="h3"
              />
              <DiscoveryViewBeacon
                eventType="related_card_view"
                targetType="work"
                targetId={card.workId}
                targetProfileId={`${card.ownerRole}:${card.ownerSlug}`}
                surface="related_works_section"
              />
            </Fragment>
          ))}
        </div>
      )}
    </section>
  );
}
