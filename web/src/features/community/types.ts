import type { PublicProfile } from "@/features/showcase/types";

export type CommunityRole = PublicProfile["role"];

export type CommunitySurface = "home" | "discover";

export type CommunitySectionKind = "works" | "profiles" | "opportunities";

export type CommunityTargetType = "profile" | "work" | "opportunity";

export type CommunityWorkStatus = "draft" | "published";

export type CreatorProfileRecord = {
  id: string;
  role: CommunityRole;
  slug: string;
  name: string;
  city: string;
  tagline: string;
  bio: string;
  publishedAt: string;
  updatedAt?: string;
};

export type CreatorProfileUpdateInput = Pick<
  CreatorProfileRecord,
  "name" | "city" | "tagline" | "bio" | "updatedAt"
>;

export type CommunityWorkRecord = {
  id: string;
  ownerProfileId: string;
  ownerRole: CommunityRole;
  ownerSlug: string;
  ownerName: string;
  status: CommunityWorkStatus;
  title: string;
  category: string;
  description: string;
  detailNote: string;
  coverAsset: string;
  publishedAt?: string;
  updatedAt?: string;
};

export type CommunityWorkSaveInput = CommunityWorkRecord;

export type FollowRelationRecord = {
  followerAccountId: string;
  creatorProfileId: string;
  createdAt: string;
};

export type WorkCommentRecord = {
  id: string;
  workId: string;
  authorAccountId: string;
  body: string;
  createdAt: string;
};

export type CuratedSlotRecord = {
  surface: CommunitySurface;
  sectionKind: CommunitySectionKind;
  targetType: CommunityTargetType;
  targetKey: string;
  order: number;
};

export type CreatorProfileRepository = {
  getById(id: string): Promise<CreatorProfileRecord | null>;
  getByRoleAndSlug(
    role: CommunityRole,
    slug: string,
  ): Promise<CreatorProfileRecord | null>;
  listPublicProfiles(): Promise<CreatorProfileRecord[]>;
  updateById(
    id: string,
    input: CreatorProfileUpdateInput,
  ): Promise<CreatorProfileRecord>;
};

export type WorkRepository = {
  getById(id: string): Promise<CommunityWorkRecord | null>;
  listByOwnerProfileId(ownerProfileId: string): Promise<CommunityWorkRecord[]>;
  listPublicWorks(): Promise<CommunityWorkRecord[]>;
  save(input: CommunityWorkSaveInput): Promise<CommunityWorkRecord>;
};

export type FollowRepository = {
  isFollowing(
    followerAccountId: string,
    creatorProfileId: string,
  ): Promise<boolean>;
  listFollowedProfileIds(followerAccountId: string): Promise<string[]>;
  follow(
    followerAccountId: string,
    creatorProfileId: string,
  ): Promise<void>;
  unfollow(
    followerAccountId: string,
    creatorProfileId: string,
  ): Promise<void>;
};

export type CommentRepository = {
  listByWorkId(workId: string): Promise<WorkCommentRecord[]>;
  add(input: WorkCommentRecord): Promise<WorkCommentRecord>;
};

export type CurationConfigRepository = {
  listSlotsBySurface(surface: CommunitySurface): Promise<CuratedSlotRecord[]>;
};

export type CommunityRepositoryBundle = {
  profiles: CreatorProfileRepository;
  works: WorkRepository;
  follows: FollowRepository;
  comments: CommentRepository;
  curation: CurationConfigRepository;
};

export type CommunitySeedSnapshot = {
  profiles: CreatorProfileRecord[];
  works: CommunityWorkRecord[];
};
