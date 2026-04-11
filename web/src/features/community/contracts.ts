import type { PublicProfile, PublicWork } from "@/features/showcase/types";

import type {
  CommunitySeedSnapshot,
  CommunitySectionKind,
  CommunitySurface,
  CommunityTargetType,
  CommunityWorkRecord,
  CreatorProfileRecord,
} from "./types";

type LegacyShowcaseSeedWork = PublicWork &
  Partial<{
    coverAsset: string;
  }>;

const communitySurfaceValues: CommunitySurface[] = ["home", "discover"];
const communitySectionKindValues: CommunitySectionKind[] = [
  "works",
  "profiles",
  "opportunities",
];
const communityTargetTypeValues: CommunityTargetType[] = [
  "work",
  "profile",
  "opportunity",
];

export function buildCreatorProfileId(
  role: PublicProfile["role"],
  slug: string,
) {
  return `${role}:${slug}`;
}

export function isCommunitySurface(value: string): value is CommunitySurface {
  return communitySurfaceValues.includes(value as CommunitySurface);
}

export function isCommunitySectionKind(
  value: string,
): value is CommunitySectionKind {
  return communitySectionKindValues.includes(value as CommunitySectionKind);
}

export function isCommunityTargetType(
  value: string,
): value is CommunityTargetType {
  return communityTargetTypeValues.includes(value as CommunityTargetType);
}

export function toCreatorProfileRecord(
  profile: PublicProfile,
): CreatorProfileRecord {
  return {
    id: buildCreatorProfileId(profile.role, profile.slug),
    role: profile.role,
    slug: profile.slug,
    name: profile.name,
    city: profile.city,
    shootingFocus: profile.shootingFocus,
    discoveryContext: profile.discoveryContext,
    externalHandoffUrl: profile.externalHandoffUrl,
    tagline: profile.tagline,
    bio: profile.bio,
    publishedAt: profile.publishedAt,
    updatedAt: profile.updatedAt,
  };
}

function toSeedCommunityWorkRecord(
  work: LegacyShowcaseSeedWork,
): CommunityWorkRecord {
  return {
    id: work.id,
    ownerProfileId: buildCreatorProfileId(work.ownerRole, work.ownerSlug),
    ownerRole: work.ownerRole,
    ownerSlug: work.ownerSlug,
    ownerName: work.ownerName,
    // Current showcase sample data only represents already-public works.
    status: "published",
    title: work.title,
    category: work.category,
    description: work.description,
    detailNote: work.detailNote,
    coverAsset: work.coverAsset ?? `work:${work.id}:cover`,
    publishedAt: work.publishedAt,
    updatedAt: work.updatedAt,
  };
}

export function createShowcaseSeedSnapshot(
  profiles: PublicProfile[],
  works: PublicWork[],
): CommunitySeedSnapshot {
  return {
    profiles: profiles.map(toCreatorProfileRecord),
    works: works.map((work) => toSeedCommunityWorkRecord(work)),
  };
}

export function getPublicWorkRecords(
  works: CommunityWorkRecord[],
): CommunityWorkRecord[] {
  return works.filter((work) => work.status === "published");
}
