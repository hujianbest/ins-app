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
  featuredIds: [
    "neon-portrait-study",
    "soft-light-editorial",
    "monochrome-street-session",
  ],
};

export const profileDiscoverySlotConfig: ProfileDiscoverySlotConfig = {
  kind: "profiles",
  featuredProfiles: [
    {
      role: "photographer",
      slug: "sample-photographer",
    },
    {
      role: "model",
      slug: "sample-model",
    },
  ],
};

export const opportunitiesDiscoverySlotConfig: OpportunityDiscoverySlotConfig = {
  kind: "opportunities",
  featuredIds: ["shanghai-editorial-casting", "hangzhou-beauty-collab"],
};

export const homeDiscoveryFeaturedSlots: HomeDiscoverySlotConfig[] = [
  worksDiscoverySlotConfig,
  profileDiscoverySlotConfig,
  opportunitiesDiscoverySlotConfig,
];
