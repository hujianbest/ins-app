import type { PublicOpportunityPost, PublicProfile, PublicWork } from "@/features/showcase/types";

export type DiscoverySectionKind = "works" | "profiles" | "opportunities";

export type HomeDiscoverySectionOrder = DiscoverySectionKind[];

export type FeaturedProfileRef = {
  role: PublicProfile["role"];
  slug: PublicProfile["slug"];
};

export type WorkDiscoverySlotConfig = {
  kind: "works";
  featuredIds: Array<PublicWork["id"]>;
};

export type ProfileDiscoverySlotConfig = {
  kind: "profiles";
  featuredProfiles: FeaturedProfileRef[];
};

export type OpportunityDiscoverySlotConfig = {
  kind: "opportunities";
  featuredIds: Array<PublicOpportunityPost["id"]>;
};

export type HomeDiscoverySlotConfig =
  | WorkDiscoverySlotConfig
  | ProfileDiscoverySlotConfig
  | OpportunityDiscoverySlotConfig;

export type HomeDiscoveryCard = {
  id: string;
  href: string;
  badge: string;
  title: string;
  description: string;
  meta?: string;
};

export type HomeDiscoverySection = {
  kind: DiscoverySectionKind;
  title: string;
  description: string;
  items: HomeDiscoveryCard[];
};
