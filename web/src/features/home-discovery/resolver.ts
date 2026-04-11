import { getDefaultCommunityRepositoryBundle } from "@/features/community/runtime";
import type {
  CommunityRepositoryBundle,
  CommunityWorkRecord,
  CreatorProfileRecord,
} from "@/features/community/types";
import {
  getOpportunityOwnerLabel,
  getOpportunityVisualDescription,
} from "@/features/opportunities/opportunity-card";
import {
  getProfileHeroAssetRef,
  opportunityPosts,
} from "@/features/showcase/sample-data";

import type {
  HomeDiscoveryCard,
  HomeDiscoverySection,
  HomeDiscoverySectionKind,
  HomeDiscoverySurface,
} from "./types";
import {
  discoverSurfaceSectionOrder,
  homeSurfaceSectionOrder,
} from "./config";

const maxSectionItems = 6;

const sectionCopy: Record<
  HomeDiscoverySectionKind,
  Pick<HomeDiscoverySection, "title" | "description" | "emptyStateCopy">
> = {
  featured: {
    title: "精选推荐",
    description: "围绕高匹配发现整理的优先入口。",
    emptyStateCopy: "暂无精选。",
  },
  latest: {
    title: "最新发布",
    description: "按公开语境继续浏览最新作品。",
    emptyStateCopy: "暂无更新。",
  },
  following: {
    title: "关注中",
    description: "继续看你关注创作者的最新公开更新。",
    emptyStateCopy: "关注后查看更新。",
  },
};

type ResolveHomeDiscoverySectionsOptions = {
  surface: HomeDiscoverySurface;
  accountId?: string | null;
  bundle?: CommunityRepositoryBundle;
};

type FeaturedSectionResolution = {
  section: HomeDiscoverySection;
  featuredWorkIds: string[];
};

function getRoleLabel(role: "photographer" | "model") {
  return role === "photographer" ? "摄影师" : "模特";
}

function getProfileHref(profile: CreatorProfileRecord) {
  return profile.role === "photographer"
    ? `/photographers/${profile.slug}`
    : `/models/${profile.slug}`;
}

function buildDiscoveryMeta(city: string, shootingFocus: string) {
  return [city, shootingFocus].filter(Boolean).join(" · ");
}

function getProfileDiscoveryDescription(profile: CreatorProfileRecord) {
  return profile.discoveryContext || profile.tagline;
}

function getWorkDiscoveryMeta(
  work: CommunityWorkRecord,
  ownerProfile?: CreatorProfileRecord,
) {
  return [
    work.ownerName,
    getRoleLabel(work.ownerRole),
    buildDiscoveryMeta(ownerProfile?.city ?? "", ownerProfile?.shootingFocus ?? ""),
  ]
    .filter(Boolean)
    .join(" · ");
}

function adaptProfileRecordToHomeDiscoveryCard(
  profile: CreatorProfileRecord,
): HomeDiscoveryCard {
  return {
    id: profile.id,
    href: getProfileHref(profile),
    contentKind: "profile",
    badge: getRoleLabel(profile.role),
    title: profile.name,
    description: getProfileDiscoveryDescription(profile),
    meta: buildDiscoveryMeta(profile.city, profile.shootingFocus),
    assetRef: getProfileHeroAssetRef(profile.role, profile.slug),
  };
}

function adaptWorkRecordToHomeDiscoveryCard(
  work: CommunityWorkRecord,
  profileById: Map<string, CreatorProfileRecord>,
): HomeDiscoveryCard {
  const ownerProfile = profileById.get(work.ownerProfileId);

  return {
    id: work.id,
    href: `/works/${work.id}`,
    contentKind: "work",
    badge: work.category,
    title: work.title,
    description: work.description,
    meta: getWorkDiscoveryMeta(work, ownerProfile),
    assetRef: work.coverAsset,
  };
}

function adaptOpportunityPostToHomeDiscoveryCard(
  opportunityPost: (typeof opportunityPosts)[number],
): HomeDiscoveryCard {
  return {
    id: opportunityPost.id,
    href: `/opportunities/${opportunityPost.id}`,
    contentKind: "opportunity",
    badge: getOpportunityOwnerLabel(opportunityPost.ownerRole),
    title: opportunityPost.title,
    description: opportunityPost.summary,
    meta: opportunityPost.ownerName,
    assetRef: opportunityPost.coverAsset,
    visualDescription: getOpportunityVisualDescription(
      opportunityPost.city,
      opportunityPost.schedule,
    ),
  };
}

function buildSection(
  kind: HomeDiscoverySectionKind,
  items: HomeDiscoveryCard[],
  emptyStateCopy = sectionCopy[kind].emptyStateCopy,
): HomeDiscoverySection {
  return {
    kind,
    title: sectionCopy[kind].title,
    description: sectionCopy[kind].description,
    emptyStateCopy,
    items,
  };
}

function createFeaturedFallbackCards(
  works: CommunityWorkRecord[],
  profiles: CreatorProfileRecord[],
  profileById: Map<string, CreatorProfileRecord>,
  opportunities: typeof opportunityPosts,
): HomeDiscoveryCard[] {
  const workCards = works.map((work) =>
    adaptWorkRecordToHomeDiscoveryCard(work, profileById),
  );
  const profileCards = profiles.map(adaptProfileRecordToHomeDiscoveryCard);
  const opportunityCards = opportunities.map(adaptOpportunityPostToHomeDiscoveryCard);
  const fallbackCards: HomeDiscoveryCard[] = [];
  const longestListLength = Math.max(
    workCards.length,
    profileCards.length,
    opportunityCards.length,
  );

  for (let index = 0; index < longestListLength; index += 1) {
    const candidates = [
      workCards[index],
      profileCards[index],
      opportunityCards[index],
    ].filter((card): card is HomeDiscoveryCard => Boolean(card));

    fallbackCards.push(...candidates);
  }

  return fallbackCards;
}

async function resolveFeaturedSection(
  surface: HomeDiscoverySurface,
  bundle: CommunityRepositoryBundle,
  works: CommunityWorkRecord[],
  profiles: CreatorProfileRecord[],
): Promise<FeaturedSectionResolution> {
  const curatedSlots = await bundle.curation.listSlotsBySurface(surface);
  const workById = new Map(works.map((work) => [work.id, work]));
  const profileById = new Map(profiles.map((profile) => [profile.id, profile]));
  const opportunityById = new Map(
    opportunityPosts.map((opportunityPost) => [opportunityPost.id, opportunityPost]),
  );
  const selectedIds = new Set<string>();
  const cards: HomeDiscoveryCard[] = [];

  for (const slot of curatedSlots) {
    if (slot.targetType === "work") {
      const work = workById.get(slot.targetKey);

      if (!work || selectedIds.has(work.id)) {
        continue;
      }

      selectedIds.add(work.id);
      cards.push(adaptWorkRecordToHomeDiscoveryCard(work, profileById));
      continue;
    }

    if (slot.targetType === "profile") {
      const profile = profileById.get(slot.targetKey);

      if (!profile || selectedIds.has(profile.id)) {
        continue;
      }

      selectedIds.add(profile.id);
      cards.push(adaptProfileRecordToHomeDiscoveryCard(profile));
      continue;
    }

    if (slot.targetType === "opportunity") {
      const opportunityPost = opportunityById.get(slot.targetKey);

      if (!opportunityPost || selectedIds.has(opportunityPost.id)) {
        continue;
      }

      selectedIds.add(opportunityPost.id);
      cards.push(adaptOpportunityPostToHomeDiscoveryCard(opportunityPost));
    }
  }

  const fallbackCards = createFeaturedFallbackCards(
    works,
    profiles,
    profileById,
    opportunityPosts,
  ).filter(
    (card) => !selectedIds.has(card.id),
  );
  const featuredItems = [...cards, ...fallbackCards].slice(0, maxSectionItems);

  return {
    section: buildSection("featured", featuredItems),
    featuredWorkIds: featuredItems
      .filter((card) => card.href.startsWith("/works/"))
      .map((card) => card.id),
  };
}

function resolveLatestSection(
  works: CommunityWorkRecord[],
  profileById: Map<string, CreatorProfileRecord>,
  featuredWorkIds: string[],
): HomeDiscoverySection {
  const latestWorks = works.filter((work) => !featuredWorkIds.includes(work.id));
  const itemsSource = latestWorks.length > 0 ? latestWorks : works;

  return buildSection(
    "latest",
    itemsSource
      .slice(0, maxSectionItems)
      .map((work) => adaptWorkRecordToHomeDiscoveryCard(work, profileById)),
  );
}

async function resolveFollowingSection(
  accountId: string | null | undefined,
  bundle: CommunityRepositoryBundle,
  works: CommunityWorkRecord[],
  profileById: Map<string, CreatorProfileRecord>,
): Promise<HomeDiscoverySection> {
  if (!accountId) {
    return buildSection(
      "following",
      [],
      "登录后查看关注更新。",
    );
  }

  const followedProfileIds = await bundle.follows.listFollowedProfileIds(accountId);
  const followingItems = works
    .filter((work) => followedProfileIds.includes(work.ownerProfileId))
    .slice(0, maxSectionItems)
    .map((work) => adaptWorkRecordToHomeDiscoveryCard(work, profileById));

  return buildSection("following", followingItems);
}

function getSectionOrder(surface: HomeDiscoverySurface) {
  return surface === "home"
    ? homeSurfaceSectionOrder
    : discoverSurfaceSectionOrder;
}

export async function resolveHomeDiscoverySections({
  surface,
  accountId = null,
  bundle = getDefaultCommunityRepositoryBundle(),
}: ResolveHomeDiscoverySectionsOptions): Promise<HomeDiscoverySection[]> {
  const [profiles, works] = await Promise.all([
    bundle.profiles.listPublicProfiles(),
    bundle.works.listPublicWorks(),
  ]);
  const profileById = new Map(profiles.map((profile) => [profile.id, profile]));
  const featuredResolution = await resolveFeaturedSection(
    surface,
    bundle,
    works,
    profiles,
  );

  const sectionResolvers: Record<
    HomeDiscoverySectionKind,
    () => Promise<HomeDiscoverySection>
  > = {
    featured: async () => featuredResolution.section,
    latest: async () =>
      resolveLatestSection(works, profileById, featuredResolution.featuredWorkIds),
    following: () => resolveFollowingSection(accountId, bundle, works, profileById),
  };

  return Promise.all(
    getSectionOrder(surface).map((kind) => sectionResolvers[kind]()),
  );
}
