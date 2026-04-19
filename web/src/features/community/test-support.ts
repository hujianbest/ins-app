import { randomUUID } from "node:crypto";

import { getPublicWorkRecords } from "./contracts";

import type {
  AuditLogEntry,
  CommunityRepositoryBundle,
  CommunityWorkRecord,
  CreatorProfileRecord,
  CuratedSlotRecord,
  FollowRelationRecord,
  WorkCommentRecord,
} from "./types";

type InMemoryCommunityRepositoryFixtures = {
  profiles: CreatorProfileRecord[];
  works: CommunityWorkRecord[];
  follows?: FollowRelationRecord[];
  comments?: WorkCommentRecord[];
  curation?: CuratedSlotRecord[];
  audit?: AuditLogEntry[];
};

export function createInMemoryCommunityRepositoryBundle(
  fixtures: InMemoryCommunityRepositoryFixtures,
): CommunityRepositoryBundle {
  const follows = fixtures.follows ?? [];
  const comments = fixtures.comments ?? [];
  const curation = fixtures.curation ?? [];
  const auditLog: AuditLogEntry[] = [...(fixtures.audit ?? [])];

  return {
    profiles: {
      async getById(id) {
        return fixtures.profiles.find((profile) => profile.id === id) ?? null;
      },
      async getByRoleAndSlug(role, slug) {
        return (
          fixtures.profiles.find(
            (profile) => profile.role === role && profile.slug === slug,
          ) ?? null
        );
      },
      async listPublicProfiles() {
        return fixtures.profiles;
      },
      async updateById(id, input) {
        const index = fixtures.profiles.findIndex((profile) => profile.id === id);

        if (index === -1) {
          throw new Error(`Creator profile not found: ${id}`);
        }

        fixtures.profiles[index] = {
          ...fixtures.profiles[index],
          ...input,
        } satisfies CreatorProfileRecord;

        return fixtures.profiles[index];
      },
    },
    works: {
      async getById(id) {
        return fixtures.works.find((work) => work.id === id) ?? null;
      },
      async listByOwnerProfileId(ownerProfileId) {
        return fixtures.works.filter(
          (work) => work.ownerProfileId === ownerProfileId,
        );
      },
      async listPublicWorks() {
        return getPublicWorkRecords(fixtures.works);
      },
      async listAllForAdmin() {
        return [...fixtures.works].sort((left, right) => {
          const leftKey = left.updatedAt ?? left.publishedAt ?? "";
          const rightKey = right.updatedAt ?? right.publishedAt ?? "";
          if (leftKey === rightKey) return left.id.localeCompare(right.id);
          if (leftKey === "") return 1;
          if (rightKey === "") return -1;
          return rightKey.localeCompare(leftKey);
        });
      },
      async save(input) {
        const index = fixtures.works.findIndex((work) => work.id === input.id);

        if (index === -1) {
          fixtures.works.push(input);
          return input;
        }

        fixtures.works[index] = input;
        return fixtures.works[index];
      },
    },
    follows: {
      async isFollowing(followerAccountId, creatorProfileId) {
        return follows.some(
          (relation) =>
            relation.followerAccountId === followerAccountId &&
            relation.creatorProfileId === creatorProfileId,
        );
      },
      async listFollowedProfileIds(followerAccountId) {
        return follows
          .filter((relation) => relation.followerAccountId === followerAccountId)
          .map((relation) => relation.creatorProfileId);
      },
      async follow(followerAccountId, creatorProfileId) {
        if (
          follows.some(
            (relation) =>
              relation.followerAccountId === followerAccountId &&
              relation.creatorProfileId === creatorProfileId,
          )
        ) {
          return;
        }

        follows.push({
          followerAccountId,
          creatorProfileId,
          createdAt: new Date().toISOString(),
        });
      },
      async unfollow(followerAccountId, creatorProfileId) {
        const index = follows.findIndex(
          (relation) =>
            relation.followerAccountId === followerAccountId &&
            relation.creatorProfileId === creatorProfileId,
        );

        if (index !== -1) {
          follows.splice(index, 1);
        }
      },
    },
    comments: {
      async listByWorkId(workId) {
        return comments
          .filter((comment) => comment.workId === workId)
          .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
      },
      async add(input) {
        comments.push(input);
        return input;
      },
    },
    curation: {
      async listSlotsBySurface(surface) {
        return curation
          .filter((slot) => slot.surface === surface)
          .sort((left, right) => left.order - right.order);
      },
      async upsertSlot(slot) {
        const idx = curation.findIndex(
          (existing) =>
            existing.surface === slot.surface &&
            existing.sectionKind === slot.sectionKind &&
            existing.targetKey === slot.targetKey,
        );
        if (idx === -1) {
          curation.push({ ...slot });
        } else {
          curation[idx] = { ...slot };
        }
        return { ...slot };
      },
      async removeSlot(key) {
        const idx = curation.findIndex(
          (slot) =>
            slot.surface === key.surface &&
            slot.sectionKind === key.sectionKind &&
            slot.targetKey === key.targetKey,
        );
        if (idx !== -1) curation.splice(idx, 1);
      },
      async reorderSlot(key) {
        const idx = curation.findIndex(
          (slot) =>
            slot.surface === key.surface &&
            slot.sectionKind === key.sectionKind &&
            slot.targetKey === key.targetKey,
        );
        if (idx === -1) return null;
        const updated: CuratedSlotRecord = { ...curation[idx], order: key.order };
        curation[idx] = updated;
        return { ...updated };
      },
    },
    discovery: {
      async record(input) {
        return {
          id: input.id ?? `discovery:${input.eventType}:${input.targetId}`,
          eventType: input.eventType,
          actorAccountId: input.actorAccountId ?? null,
          targetType: input.targetType,
          targetId: input.targetId,
          targetProfileId: input.targetProfileId,
          surface: input.surface,
          query: input.query,
          success: input.success,
          failureReason: input.failureReason,
          createdAt: input.createdAt ?? new Date().toISOString(),
        };
      },
      async listAll() {
        return [];
      },
    },
    audit: {
      async record(input) {
        const entry: AuditLogEntry = {
          id: input.id ?? randomUUID(),
          createdAt: input.createdAt ?? new Date().toISOString(),
          actorAccountId: input.actorAccountId,
          actorEmail: input.actorEmail,
          action: input.action,
          targetKind: input.targetKind,
          targetId: input.targetId,
          note: input.note,
        };
        auditLog.push(entry);
        return { ...entry };
      },
      async listLatest(limit) {
        return [...auditLog]
          .sort((a, b) => {
            if (a.createdAt === b.createdAt) {
              if (a.id === b.id) return 0;
              return a.id < b.id ? 1 : -1;
            }
            return a.createdAt < b.createdAt ? 1 : -1;
          })
          .slice(0, Math.max(0, limit));
      },
    },
  };
}
