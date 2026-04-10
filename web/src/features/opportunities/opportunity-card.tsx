import { EditorialCard, type EditorialCardStat } from "@/features/cards/editorial-card";
import type { PublicOpportunityPost, SeedAssetRef } from "@/features/showcase/types";

type OpportunityCardProps = {
  href?: string;
  assetRef?: SeedAssetRef;
  visualLabel: string;
  visualDescription?: string;
  imageLoading?: "lazy" | "eager";
  imageSizes?: string;
  title: string;
  summary: string;
  ownerName?: string;
  detailStats?: OpportunityCardStat[];
  footerTag?: string;
  showFooterMeta?: boolean;
  titleTag?: "h2" | "h3";
  titleClassName?: string;
  cardClassName?: string;
};

export function getOpportunityOwnerLabel(
  ownerRole: PublicOpportunityPost["ownerRole"],
) {
  return ownerRole === "photographer" ? "摄影师诉求" : "模特诉求";
}

export function getOpportunityVisualDescription(city: string, schedule: string) {
  return `${city} · ${schedule}`;
}

export function OpportunityCard({
  ownerName,
  showFooterMeta = true,
  ...cardProps
}: OpportunityCardProps) {
  return (
    <EditorialCard
      {...cardProps}
      visualVariant="landscape"
      footerText={showFooterMeta ? ownerName : undefined}
    />
  );
}
