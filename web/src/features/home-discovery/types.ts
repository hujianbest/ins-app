import type { PublicOpportunityPost, PublicProfile, PublicWork } from "@/features/showcase/types";

export type DiscoverySectionKind = "works" | "profiles" | "opportunities";

export type HomeDiscoverySectionKind = "featured" | "latest" | "following";

export type HomeDiscoverySurface = "home" | "discover";

export type HomeSurfaceSectionOrder = Array<Extract<HomeDiscoverySectionKind, "featured" | "latest">>;

export type DiscoverSurfaceSectionOrder = HomeDiscoverySectionKind[];

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
  contentKind: "work" | "profile" | "opportunity";
  badge: string;
  title: string;
  description: string;
  meta?: string;
  assetRef?: string;
  visualDescription?: string;
};

export type HomeDiscoverySection = {
  kind: HomeDiscoverySectionKind;
  title: string;
  description: string;
  emptyStateCopy: string;
  items: HomeDiscoveryCard[];
};
