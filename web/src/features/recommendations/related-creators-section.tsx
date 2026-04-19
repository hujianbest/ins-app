import { Fragment } from "react";

import { EditorialCard } from "@/features/cards/editorial-card";
import { DiscoveryViewBeacon } from "@/features/discovery/view-beacon";
import { SectionHeading } from "@/features/shell/section-heading";

import {
  type GetRelatedCreatorsDeps,
  type RelatedCreatorsSeed,
  getRelatedCreators,
} from "./related-creators";

type Props = {
  seed: RelatedCreatorsSeed;
  /** For tests / SSR injection. Default uses real bundle + observability. */
  deps?: GetRelatedCreatorsDeps;
};

export async function RelatedCreatorsSection({ seed, deps }: Props) {
  const result = await getRelatedCreators(seed, deps);
  if (!result) {
    // I-3 / I-11: flag disabled — emit nothing (no panel, no beacon).
    return null;
  }

  return (
    <section className="museum-panel museum-panel--soft p-6 md:p-8">
      <SectionHeading eyebrow="相关创作者" title="也看看这些创作者" />
      {result.kind === "empty" ? (
        <p className="mt-4 text-sm leading-7 text-[color:var(--muted-strong)]">
          暂无更多相关创作者。
        </p>
      ) : (
        <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {result.cards.map((card) => (
            <Fragment key={`${card.role}:${card.slug}`}>
              <EditorialCard
                href={`/${card.role}s/${card.slug}`}
                assetRef={card.heroAsset}
                visualLabel={card.shootingFocus || "创作者"}
                visualVariant="card"
                title={card.name}
                summary={
                  card.city
                    ? `${card.city}・${card.shootingFocus || "未填写方向"}`
                    : card.shootingFocus || "—"
                }
                titleTag="h3"
              />
              <DiscoveryViewBeacon
                eventType="related_card_view"
                targetType="profile"
                targetId={`${card.role}:${card.slug}`}
                targetProfileId={`${card.role}:${card.slug}`}
                surface="related_creators_section"
              />
            </Fragment>
          ))}
        </div>
      )}
    </section>
  );
}
