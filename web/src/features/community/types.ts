import type { PublicProfile } from "@/features/showcase/types";

export type CommunityRole = PublicProfile["role"];

export type CommunitySurface = "home" | "discover";

export type CommunitySectionKind = "works" | "profiles" | "opportunities";

export type CommunityTargetType = "profile" | "work" | "opportunity";

export type CommunityWorkStatus = "draft" | "published" | "moderated";

export type CreatorProfileRecord = {
  id: string;
  role: CommunityRole;
  slug: string;
  name: string;
  city: string;
  shootingFocus: string;
  discoveryContext: string;
  externalHandoffUrl: string;
  tagline: string;
  bio: string;
  publishedAt: string;
  updatedAt?: string;
};

export type CreatorProfileUpdateInput = Pick<
  CreatorProfileRecord,
  | "name"
  | "city"
  | "shootingFocus"
  | "discoveryContext"
  | "externalHandoffUrl"
  | "tagline"
  | "bio"
  | "updatedAt"
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
  /**
   * Phase 2 — Ops Back Office V1 (FR-006 / ADR-5).
   * Returns every work in the system regardless of status (draft /
   * published / moderated). The ONLY consumer should be admin SSR
   * pages and admin server actions; public read paths must use
   * `listPublicWorks` (which filters non-published).
   */
  listAllForAdmin(): Promise<CommunityWorkRecord[]>;
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

export type CurationSlotKey = {
  surface: CommunitySurface;
  sectionKind: CommunitySectionKind;
  targetKey: string;
};

export type CurationConfigRepository = {
  listSlotsBySurface(surface: CommunitySurface): Promise<CuratedSlotRecord[]>;
  /**
   * Phase 2 — Ops Back Office V1 (FR-003).
   * INSERT or UPDATE by primary key (surface, sectionKind, targetKey).
   * Returns the persisted row.
   */
  upsertSlot(slot: CuratedSlotRecord): Promise<CuratedSlotRecord>;
  /**
   * Idempotent: removing a non-existent slot is not an error.
   */
  removeSlot(key: CurationSlotKey): Promise<void>;
  /**
   * Updates only `order_index`. Returns the updated row, or `null`
   * if no slot matched the key.
   */
  reorderSlot(key: CurationSlotKey & { order: number }): Promise<CuratedSlotRecord | null>;
};

export type DiscoveryEventType =
  | "work_view"
  | "profile_view"
  | "follow"
  | "contact_start"
  | "external_handoff_click"
  | "related_card_view";

export type DiscoveryEventRecord = {
  id: string;
  eventType: DiscoveryEventType;
  actorAccountId: string | null;
  targetType: CommunityTargetType;
  targetId: string;
  targetProfileId?: string;
  surface: string;
  query: string;
  success: boolean;
  failureReason?: string;
  createdAt: string;
};

export type DiscoveryEventCreateInput = Omit<
  DiscoveryEventRecord,
  "id" | "createdAt"
> &
  Partial<Pick<DiscoveryEventRecord, "id" | "createdAt">>;

export type DiscoveryEventRepository = {
  record(input: DiscoveryEventCreateInput): Promise<DiscoveryEventRecord>;
  listAll(): Promise<DiscoveryEventRecord[]>;
};

// ---------------------------------------------------------------------------
// Phase 2 — Ops Back Office V1: AuditLog (FR-005)
// ---------------------------------------------------------------------------

export type AuditAction =
  | "curation.upsert"
  | "curation.remove"
  | "curation.reorder"
  | "work_moderation.hide"
  | "work_moderation.restore";

export type AuditTargetKind = "curation_slot" | "work";

export type AuditLogEntry = {
  id: string;
  createdAt: string;
  actorAccountId: string;
  actorEmail: string;
  action: AuditAction;
  targetKind: AuditTargetKind;
  targetId: string;
  note?: string;
};

export type AuditLogCreateInput = Omit<
  AuditLogEntry,
  "id" | "createdAt"
> &
  Partial<Pick<AuditLogEntry, "id" | "createdAt">>;

export type AuditLogRepository = {
  record(input: AuditLogCreateInput): Promise<AuditLogEntry>;
  listLatest(limit: number): Promise<AuditLogEntry[]>;
};

export type CommunityRepositoryBundle = {
  profiles: CreatorProfileRepository;
  works: WorkRepository;
  follows: FollowRepository;
  comments: CommentRepository;
  curation: CurationConfigRepository;
  discovery: DiscoveryEventRepository;
  /**
   * Phase 2 — Ops Back Office V1 (FR-005). Every bundle must
   * implement an audit repository (sqlite uses the `audit_log`
   * table; in-memory test bundle keeps a real array so tests can
   * assert "record then listLatest").
   */
  audit: AuditLogRepository;
};

export type CommunitySeedSnapshot = {
  profiles: CreatorProfileRecord[];
  works: CommunityWorkRecord[];
};
