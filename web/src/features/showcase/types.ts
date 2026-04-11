export type FeaturedPath = {
  href: string;
  eyebrow: string;
  title: string;
  description: string;
};

export type SeedAssetRef = string;

export type SeedVisualAsset = {
  id: SeedAssetRef;
  imageUrl: string;
  alt: string;
  sourceName: string;
  sourceUrl: string;
  licenseLabel: string;
};

export type HomeHeroContent = {
  label: string;
  title: string;
  description: string;
  primaryCta: {
    href: string;
    label: string;
  };
  secondaryCta: {
    href: string;
    label: string;
  };
};

export type HomePillar = {
  title: string;
  description: string;
};

export type ProfileShowcaseItem = {
  workId: string;
  title: string;
  subtitle: string;
  description: string;
  coverAsset?: SeedAssetRef;
};

export type PublicProfile = {
  slug: string;
  role: "photographer" | "model";
  name: string;
  city: string;
  shootingFocus: string;
  discoveryContext: string;
  externalHandoffUrl: string;
  publishedAt: string;
  updatedAt?: string;
  tagline: string;
  bio: string;
  contactLabel: string;
  sectionTitle: string;
  sectionDescription: string;
  heroImageLabel: string;
  heroAsset?: SeedAssetRef;
  showcaseItems: ProfileShowcaseItem[];
};

export type PublicWork = {
  id: string;
  ownerSlug: string;
  ownerRole: "photographer" | "model";
  ownerName: string;
  publishedAt: string;
  updatedAt?: string;
  title: string;
  category: string;
  description: string;
  detailNote: string;
  contactLabel: string;
  coverAsset?: SeedAssetRef;
};

export type PublicOpportunityPost = {
  id: string;
  ownerSlug: string;
  ownerRole: "photographer" | "model";
  ownerName: string;
  publishedAt: string;
  updatedAt?: string;
  title: string;
  city: string;
  schedule: string;
  summary: string;
  contactLabel: string;
  coverAsset?: SeedAssetRef;
};
