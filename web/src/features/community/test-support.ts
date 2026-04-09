import { getPublicWorkRecords } from "./contracts";

import type {
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
};

export function createInMemoryCommunityRepositoryBundle(
  fixtures: InMemoryCommunityRepositoryFixtures,
): CommunityRepositoryBundle {
  const follows = fixtures.follows ?? [];
  const comments = fixtures.comments ?? [];
  const curation = fixtures.curation ?? [];

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
    },
  };
}
