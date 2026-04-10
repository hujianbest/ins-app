import { getDefaultCommunityRepositoryBundle } from "@/features/community/runtime";
import type {
  CommunityRepositoryBundle,
  CommunityWorkRecord,
  CreatorProfileRecord,
} from "@/features/community/types";
import { getProfileHeroAssetRef } from "@/features/showcase/sample-data";

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
    description: "优先展示社区精选作品与创作者。",
    emptyStateCopy: "精选内容整理中。",
  },
  latest: {
    title: "最新发布",
    description: "按最新公开发布时间浏览社区内容。",
    emptyStateCopy: "最新内容整理中。",
  },
  following: {
    title: "关注中",
    description: "关注创作者后，这里会显示他们的最新公开内容。",
    emptyStateCopy: "关注创作者后，这里会显示他们的最新公开内容。",
  },
};

type ResolveHomeDiscoverySectionsOptions = {
  surface: HomeDiscoverySurface;
  accountId?: string | null;
  bundle?: CommunityRepositoryBundle;
};

function getProfileHref(profile: CreatorProfileRecord) {
  return profile.role === "photographer"
    ? `/photographers/${profile.slug}`
    : `/models/${profile.slug}`;
}

function adaptProfileRecordToHomeDiscoveryCard(
  profile: CreatorProfileRecord,
): HomeDiscoveryCard {
  return {
    id: profile.id,
    href: getProfileHref(profile),
    badge: profile.role === "photographer" ? "摄影师" : "模特",
    title: profile.name,
    description: profile.tagline,
    meta: profile.city,
    assetRef: getProfileHeroAssetRef(profile.role, profile.slug),
  };
}

function adaptWorkRecordToHomeDiscoveryCard(
  work: CommunityWorkRecord,
): HomeDiscoveryCard {
  return {
    id: work.id,
    href: `/works/${work.id}`,
    badge: work.category,
    title: work.title,
    description: work.description,
    meta: `${work.ownerName} · ${
      work.ownerRole === "photographer" ? "摄影师" : "模特"
    }`,
    assetRef: work.coverAsset,
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
): HomeDiscoveryCard[] {
  return [
    ...works.map(adaptWorkRecordToHomeDiscoveryCard),
    ...profiles.map(adaptProfileRecordToHomeDiscoveryCard),
  ];
}

async function resolveFeaturedSection(
  surface: HomeDiscoverySurface,
  bundle: CommunityRepositoryBundle,
  works: CommunityWorkRecord[],
  profiles: CreatorProfileRecord[],
): Promise<HomeDiscoverySection> {
  const curatedSlots = await bundle.curation.listSlotsBySurface(surface);
  const workById = new Map(works.map((work) => [work.id, work]));
  const profileById = new Map(profiles.map((profile) => [profile.id, profile]));
  const selectedIds = new Set<string>();
  const cards: HomeDiscoveryCard[] = [];

  for (const slot of curatedSlots) {
    if (slot.targetType === "work") {
      const work = workById.get(slot.targetKey);

      if (!work || selectedIds.has(work.id)) {
        continue;
      }

      selectedIds.add(work.id);
      cards.push(adaptWorkRecordToHomeDiscoveryCard(work));
      continue;
    }

    if (slot.targetType === "profile") {
      const profile = profileById.get(slot.targetKey);

      if (!profile || selectedIds.has(profile.id)) {
        continue;
      }

      selectedIds.add(profile.id);
      cards.push(adaptProfileRecordToHomeDiscoveryCard(profile));
    }
  }

  const fallbackCards = createFeaturedFallbackCards(works, profiles).filter(
    (card) => !selectedIds.has(card.id),
  );

  return buildSection("featured", [...cards, ...fallbackCards].slice(0, maxSectionItems));
}

function resolveLatestSection(
  works: CommunityWorkRecord[],
): HomeDiscoverySection {
  return buildSection(
    "latest",
    works.slice(0, maxSectionItems).map(adaptWorkRecordToHomeDiscoveryCard),
  );
}

async function resolveFollowingSection(
  accountId: string | null | undefined,
  bundle: CommunityRepositoryBundle,
  works: CommunityWorkRecord[],
): Promise<HomeDiscoverySection> {
  if (!accountId) {
    return buildSection(
      "following",
      [],
      "登录后查看关注中的创作者更新。",
    );
  }

  const followedProfileIds = await bundle.follows.listFollowedProfileIds(accountId);
  const followingItems = works
    .filter((work) => followedProfileIds.includes(work.ownerProfileId))
    .slice(0, maxSectionItems)
    .map(adaptWorkRecordToHomeDiscoveryCard);

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

  const sectionResolvers: Record<
    HomeDiscoverySectionKind,
    () => Promise<HomeDiscoverySection>
  > = {
    featured: () => resolveFeaturedSection(surface, bundle, works, profiles),
    latest: async () => resolveLatestSection(works),
    following: () => resolveFollowingSection(accountId, bundle, works),
  };

  return Promise.all(
    getSectionOrder(surface).map((kind) => sectionResolvers[kind]()),
  );
}
