import {
  createReadonlyCommunityRepositoryBundle,
} from "./runtime";

import type { CommunityRepositoryBundle, CommunityRole, CommunityWorkRecord, CreatorProfileRecord } from "./types";
import { getProfileHeroAssetRef } from "@/features/showcase/sample-data";
import type { PublicProfile, PublicWork, ProfileShowcaseItem } from "@/features/showcase/types";

const publicProfileCopy: Record<
  CommunityRole,
  Pick<
    PublicProfile,
    "contactLabel" | "sectionTitle" | "sectionDescription" | "heroImageLabel"
  >
> = {
  photographer: {
    contactLabel: "联系摄影师",
    sectionTitle: "精选画面",
    sectionDescription:
      "从已发布作品中挑出最能体现情绪、控光与人像表现力的一组精选画面。",
    heroImageLabel: "摄影师封面视觉",
  },
  model: {
    contactLabel: "联系模特",
    sectionTitle: "编辑精选",
    sectionDescription:
      "从已发布作品中整理可直接公开浏览的代表内容，展示造型范围、姿态控制与镜头承载力。",
    heroImageLabel: "模特封面视觉",
  },
};

const publicWorkContactLabel: Record<CommunityRole, string> = {
  photographer: "联系摄影师",
  model: "联系模特",
};

function isPublishedWork(work: CommunityWorkRecord) {
  return work.status === "published";
}

function toProfileShowcaseItem(work: CommunityWorkRecord): ProfileShowcaseItem {
  return {
    workId: work.id,
    title: work.title,
    subtitle: work.category,
    description: work.description,
    coverAsset: work.coverAsset,
  };
}

function toPublicProfile(
  profile: CreatorProfileRecord,
  works: CommunityWorkRecord[],
): PublicProfile {
  const roleCopy = publicProfileCopy[profile.role];

  return {
    slug: profile.slug,
    role: profile.role,
    name: profile.name,
    city: profile.city,
    shootingFocus: profile.shootingFocus,
    discoveryContext: profile.discoveryContext,
    externalHandoffUrl: profile.externalHandoffUrl,
    publishedAt: profile.publishedAt,
    updatedAt: profile.updatedAt,
    tagline: profile.tagline,
    bio: profile.bio,
    contactLabel: roleCopy.contactLabel,
    sectionTitle: roleCopy.sectionTitle,
    sectionDescription: roleCopy.sectionDescription,
    heroImageLabel: roleCopy.heroImageLabel,
    heroAsset:
      getProfileHeroAssetRef(profile.role, profile.slug) ??
      works.find(isPublishedWork)?.coverAsset,
    showcaseItems: works.filter(isPublishedWork).map(toProfileShowcaseItem),
  };
}

function toPublicWork(work: CommunityWorkRecord): PublicWork {
  return {
    id: work.id,
    ownerSlug: work.ownerSlug,
    ownerRole: work.ownerRole,
    ownerName: work.ownerName,
    publishedAt: work.publishedAt ?? "",
    updatedAt: work.updatedAt,
    title: work.title,
    category: work.category,
    description: work.description,
    detailNote: work.detailNote,
    contactLabel: publicWorkContactLabel[work.ownerRole],
    coverAsset: work.coverAsset,
  };
}

function resolveActiveBundle(bundle?: CommunityRepositoryBundle): {
  activeBundle: CommunityRepositoryBundle;
  ownedBundle: { close(): void } | null;
} {
  if (bundle) {
    return {
      activeBundle: bundle,
      ownedBundle: null,
    };
  }

  const ownedBundle = createReadonlyCommunityRepositoryBundle();

  return {
    activeBundle: ownedBundle,
    ownedBundle,
  };
}

async function withResolvedBundle<T>(
  bundle: CommunityRepositoryBundle | undefined,
  work: (activeBundle: CommunityRepositoryBundle) => Promise<T>,
): Promise<T> {
  const { activeBundle, ownedBundle } = resolveActiveBundle(bundle);

  try {
    return await work(activeBundle);
  } finally {
    ownedBundle?.close();
  }
}

export async function listPublicProfilePageParams(
  role: CommunityRole,
  bundle?: CommunityRepositoryBundle,
) {
  return withResolvedBundle(bundle, async (activeBundle) => {
    const profiles = await activeBundle.profiles.listPublicProfiles();

    return profiles
      .filter((profile) => profile.role === role)
      .map((profile) => ({ slug: profile.slug }));
  });
}

export async function getPublicProfilePageModel(
  role: CommunityRole,
  slug: string,
  bundle?: CommunityRepositoryBundle,
): Promise<PublicProfile | null> {
  return withResolvedBundle(bundle, async (activeBundle) => {
    const profile = await activeBundle.profiles.getByRoleAndSlug(role, slug);

    if (!profile) {
      return null;
    }

    const works = await activeBundle.works.listByOwnerProfileId(profile.id);

    return toPublicProfile(profile, works);
  });
}

export async function listPublicWorkPageParams(
  bundle?: CommunityRepositoryBundle,
) {
  return withResolvedBundle(bundle, async (activeBundle) => {
    const works = await activeBundle.works.listPublicWorks();

    return works.map((work) => ({ workId: work.id }));
  });
}

export async function getPublicWorkPageModel(
  workId: string,
  bundle?: CommunityRepositoryBundle,
): Promise<PublicWork | null> {
  return withResolvedBundle(bundle, async (activeBundle) => {
    const work = await activeBundle.works.getById(workId);

    if (!work || !isPublishedWork(work)) {
      return null;
    }

    return toPublicWork(work);
  });
}
