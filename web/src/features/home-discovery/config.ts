import type {
  DiscoverSurfaceSectionOrder,
  HomeSurfaceSectionOrder,
  HomeDiscoverySlotConfig,
  OpportunityDiscoverySlotConfig,
  ProfileDiscoverySlotConfig,
  WorkDiscoverySlotConfig,
} from "./types";

export const homeSurfaceSectionOrder: HomeSurfaceSectionOrder = [
  "featured",
  "latest",
];

export const discoverSurfaceSectionOrder: DiscoverSurfaceSectionOrder = [
  "featured",
  "latest",
  "following",
];

export const worksDiscoverySlotConfig: WorkDiscoverySlotConfig = {
  kind: "works",
  featuredIds: ["neon-portrait-study", "luminous-closeup-dossier"],
};

export const profileDiscoverySlotConfig: ProfileDiscoverySlotConfig = {
  kind: "profiles",
  featuredProfiles: [
    {
      role: "photographer",
      slug: "elio-ren",
    },
    {
      role: "model",
      slug: "sora-lin",
    },
  ],
};

export const opportunitiesDiscoverySlotConfig: OpportunityDiscoverySlotConfig = {
  kind: "opportunities",
  featuredIds: ["shenzhen-monochrome-campaign", "hangzhou-beauty-collab"],
};

export const homeDiscoveryFeaturedSlots: HomeDiscoverySlotConfig[] = [
  worksDiscoverySlotConfig,
  profileDiscoverySlotConfig,
  opportunitiesDiscoverySlotConfig,
];
