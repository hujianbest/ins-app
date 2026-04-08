import {
  adaptOpportunityPostToHomeDiscoveryCard,
  adaptProfileToHomeDiscoveryCard,
  adaptWorkToHomeDiscoveryCard,
} from "./adapters";
import {
  homeDiscoverySectionOrder,
  opportunitiesDiscoverySlotConfig,
  profileDiscoverySlotConfig,
  worksDiscoverySlotConfig,
} from "./config";
import {
  modelProfiles,
  opportunityPosts,
  photographerProfiles,
  works,
} from "@/features/showcase/sample-data";
import type {
  PublicOpportunityPost,
  PublicProfile,
  PublicWork,
} from "@/features/showcase/types";

import type {
  HomeDiscoveryCard,
  HomeDiscoverySection,
  OpportunityDiscoverySlotConfig,
  ProfileDiscoverySlotConfig,
  WorkDiscoverySlotConfig,
} from "./types";

const maxSectionItems = 3;

const sectionCopy = {
  works: {
    title: "精选作品",
    description: "从社区最新作品里挑出的优先浏览内容。",
  },
  profiles: {
    title: "精选主页",
    description: "认识准备开启合作的摄影师与模特。",
  },
  opportunities: {
    title: "精选诉求",
    description: "浏览最新发布的约拍诉求与合作请求。",
  },
} as const;

type TimeTrackedRecord = {
  publishedAt: string;
  updatedAt?: string;
};

function getNewestTimestamp(record: TimeTrackedRecord) {
  return Date.parse(record.updatedAt ?? record.publishedAt);
}

function buildEmptySection(kind: HomeDiscoverySection["kind"]): HomeDiscoverySection {
  return {
    kind,
    title: sectionCopy[kind].title,
    description: sectionCopy[kind].description,
    items: [],
  };
}

function resolveSectionItems<TItem extends TimeTrackedRecord, TReference>({
  items,
  featuredReferences,
  findFeaturedItem,
  getKey,
  adapt,
}: {
  items: TItem[];
  featuredReferences: TReference[];
  findFeaturedItem: (reference: TReference, items: TItem[]) => TItem | undefined;
  getKey: (item: TItem) => string;
  adapt: (item: TItem) => HomeDiscoveryCard;
}) {
  const selectedKeys = new Set<string>();
  const featuredItems: TItem[] = [];

  for (const reference of featuredReferences) {
    const matchedItem = findFeaturedItem(reference, items);

    if (!matchedItem) {
      continue;
    }

    const key = getKey(matchedItem);

    if (selectedKeys.has(key)) {
      continue;
    }

    selectedKeys.add(key);
    featuredItems.push(matchedItem);
  }

  const fallbackItems = [...items]
    .sort((left, right) => getNewestTimestamp(right) - getNewestTimestamp(left))
    .filter((item) => !selectedKeys.has(getKey(item)));

  return [...featuredItems, ...fallbackItems]
    .slice(0, maxSectionItems)
    .map((item) => adapt(item));
}

export function resolveWorkDiscoverySection(
  config: WorkDiscoverySlotConfig,
  workItems: PublicWork[]
): HomeDiscoverySection {
  if (workItems.length === 0) {
    return buildEmptySection("works");
  }

  return {
    kind: "works",
    title: sectionCopy.works.title,
    description: sectionCopy.works.description,
    items: resolveSectionItems({
      items: workItems,
      featuredReferences: config.featuredIds,
      findFeaturedItem: (featuredId, items) => items.find((item) => item.id === featuredId),
      getKey: (item) => item.id,
      adapt: adaptWorkToHomeDiscoveryCard,
    }),
  };
}

export function resolveProfileDiscoverySection(
  config: ProfileDiscoverySlotConfig,
  profileItems: PublicProfile[]
): HomeDiscoverySection {
  if (profileItems.length === 0) {
    return buildEmptySection("profiles");
  }

  return {
    kind: "profiles",
    title: sectionCopy.profiles.title,
    description: sectionCopy.profiles.description,
    items: resolveSectionItems({
      items: profileItems,
      featuredReferences: config.featuredProfiles,
      findFeaturedItem: (featuredProfile, items) =>
        items.find(
          (item) =>
            item.role === featuredProfile.role && item.slug === featuredProfile.slug
        ),
      getKey: (item) => `${item.role}:${item.slug}`,
      adapt: adaptProfileToHomeDiscoveryCard,
    }),
  };
}

export function resolveOpportunityDiscoverySection(
  config: OpportunityDiscoverySlotConfig,
  postItems: PublicOpportunityPost[]
): HomeDiscoverySection {
  if (postItems.length === 0) {
    return buildEmptySection("opportunities");
  }

  return {
    kind: "opportunities",
    title: sectionCopy.opportunities.title,
    description: sectionCopy.opportunities.description,
    items: resolveSectionItems({
      items: postItems,
      featuredReferences: config.featuredIds,
      findFeaturedItem: (featuredId, items) => items.find((item) => item.id === featuredId),
      getKey: (item) => item.id,
      adapt: adaptOpportunityPostToHomeDiscoveryCard,
    }),
  };
}

export function resolveHomeDiscoverySections() {
  const profileItems = [...photographerProfiles, ...modelProfiles];

  const sectionResolvers: Record<HomeDiscoverySection["kind"], () => HomeDiscoverySection> = {
    works: () => resolveWorkDiscoverySection(worksDiscoverySlotConfig, works),
    profiles: () => resolveProfileDiscoverySection(profileDiscoverySlotConfig, profileItems),
    opportunities: () =>
      resolveOpportunityDiscoverySection(opportunitiesDiscoverySlotConfig, opportunityPosts),
  };

  return homeDiscoverySectionOrder.map((kind) => sectionResolvers[kind]());
}
