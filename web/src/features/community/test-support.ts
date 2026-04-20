import { randomUUID } from "node:crypto";

import { getPublicWorkRecords } from "./contracts";

import type {
  AuditLogEntry,
  CommunityRepositoryBundle,
  CommunityWorkRecord,
  CreatorProfileRecord,
  CuratedSlotRecord,
  DiscoveryEventRecord,
  FollowRelationRecord,
  MessageRecord,
  MessageThreadParticipantRecord,
  MessageThreadRecord,
  WorkCommentRecord,
} from "./types";

type InMemoryCommunityRepositoryFixtures = {
  profiles: CreatorProfileRecord[];
  works: CommunityWorkRecord[];
  follows?: FollowRelationRecord[];
  comments?: WorkCommentRecord[];
  curation?: CuratedSlotRecord[];
  audit?: AuditLogEntry[];
  discoveryEvents?: DiscoveryEventRecord[];
  messageThreads?: MessageThreadRecord[];
  messageThreadParticipants?: MessageThreadParticipantRecord[];
  messages?: MessageRecord[];
};

export function createInMemoryCommunityRepositoryBundle(
  fixtures: InMemoryCommunityRepositoryFixtures,
): CommunityRepositoryBundle {
  const follows = fixtures.follows ?? [];
  const comments = fixtures.comments ?? [];
  const curation = fixtures.curation ?? [];
  const auditLog: AuditLogEntry[] = [...(fixtures.audit ?? [])];
  const discoveryEvents: DiscoveryEventRecord[] = [...(fixtures.discoveryEvents ?? [])];
  const messageThreads: MessageThreadRecord[] = [...(fixtures.messageThreads ?? [])];
  const messageThreadParticipants: MessageThreadParticipantRecord[] = [
    ...(fixtures.messageThreadParticipants ?? []),
  ];
  const messages: MessageRecord[] = [...(fixtures.messages ?? [])];

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
        const event: DiscoveryEventRecord = {
          id: input.id ?? `discovery:${input.eventType}:${input.targetId}:${discoveryEvents.length}`,
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
        discoveryEvents.push(event);
        return { ...event };
      },
      async listAll() {
        return [...discoveryEvents].map((e) => ({ ...e }));
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
    messaging: {
      threads: {
        async createDirectThread(input) {
          const id = randomUUID();
          const createdAt = new Date().toISOString();
          const thread: MessageThreadRecord = {
            id,
            kind: "direct",
            contextRef: input.contextRef,
            createdAt,
          };
          messageThreads.push(thread);
          messageThreadParticipants.push({
            threadId: id,
            accountId: input.initiatorAccountId,
            role: "initiator",
            joinedAt: createdAt,
          });
          messageThreadParticipants.push({
            threadId: id,
            accountId: input.recipientAccountId,
            role: "recipient",
            joinedAt: createdAt,
          });
          return { ...thread };
        },
        async findDirectThreadByUnorderedPair(accountA, accountB, contextRef) {
          const candidate = messageThreads.find((t) => {
            if (t.kind !== "direct") return false;
            if ((t.contextRef ?? null) !== (contextRef ?? null)) return false;
            const parts = messageThreadParticipants.filter(
              (p) => p.threadId === t.id,
            );
            const accounts = new Set(parts.map((p) => p.accountId));
            return (
              accounts.size === 2 &&
              accounts.has(accountA) &&
              accounts.has(accountB)
            );
          });
          return candidate ? { ...candidate } : null;
        },
        async getThreadById(id) {
          const thread = messageThreads.find((t) => t.id === id);
          return thread ? { ...thread } : null;
        },
        async updateLastMessageAt(threadId, ts) {
          const idx = messageThreads.findIndex((t) => t.id === threadId);
          if (idx !== -1) {
            messageThreads[idx] = { ...messageThreads[idx], lastMessageAt: ts };
          }
        },
        async listThreadsForAccount(accountId, limit) {
          const projections = messageThreads
            .filter((t) => t.kind === "direct")
            .filter((t) =>
              messageThreadParticipants.some(
                (p) => p.threadId === t.id && p.accountId === accountId,
              ),
            )
            .map((t) => {
              const self = messageThreadParticipants.find(
                (p) => p.threadId === t.id && p.accountId === accountId,
              );
              const counterpart = messageThreadParticipants.find(
                (p) => p.threadId === t.id && p.accountId !== accountId,
              );
              const selfLastReadAt = self?.lastReadAt ?? "";
              const unreadCount = messages.filter(
                (m) =>
                  m.threadId === t.id &&
                  (m.authorAccountId === null ||
                    m.authorAccountId !== accountId) &&
                  m.createdAt > selfLastReadAt,
              ).length;
              return {
                thread: { ...t },
                counterpartAccountId: counterpart?.accountId ?? "",
                unreadCount,
              };
            });
          projections.sort((a, b) => {
            const aKey = a.thread.lastMessageAt ?? a.thread.createdAt;
            const bKey = b.thread.lastMessageAt ?? b.thread.createdAt;
            if (aKey === bKey) {
              return a.thread.id > b.thread.id ? -1 : 1;
            }
            return aKey > bKey ? -1 : 1;
          });
          return projections.slice(0, Math.max(0, limit));
        },
      },
      messages: {
        async appendMessage(input) {
          const message: MessageRecord = {
            id: randomUUID(),
            threadId: input.threadId,
            authorAccountId: input.authorAccountId,
            kind: "text",
            body: input.body,
            createdAt: new Date().toISOString(),
          };
          messages.push(message);
          return { ...message };
        },
        async listByThreadId(threadId, limit) {
          return messages
            .filter((m) => m.threadId === threadId)
            .sort((a, b) => {
              if (a.createdAt === b.createdAt) {
                return a.id > b.id ? 1 : -1;
              }
              return a.createdAt > b.createdAt ? 1 : -1;
            })
            .slice(0, Math.max(0, limit))
            .map((m) => ({ ...m }));
        },
      },
      participants: {
        async listForThread(threadId) {
          return messageThreadParticipants
            .filter((p) => p.threadId === threadId)
            .map((p) => ({ ...p }));
        },
        async markRead(threadId, accountId, ts) {
          const idx = messageThreadParticipants.findIndex(
            (p) => p.threadId === threadId && p.accountId === accountId,
          );
          if (idx !== -1) {
            messageThreadParticipants[idx] = {
              ...messageThreadParticipants[idx],
              lastReadAt: ts,
            };
          }
        },
        async getUnreadCountForAccount(accountId) {
          let total = 0;
          for (const self of messageThreadParticipants) {
            if (self.accountId !== accountId) continue;
            const selfLastReadAt = self.lastReadAt ?? "";
            for (const m of messages) {
              if (m.threadId !== self.threadId) continue;
              if (m.authorAccountId !== null && m.authorAccountId === accountId)
                continue;
              if (m.createdAt > selfLastReadAt) total += 1;
            }
          }
          return total;
        },
      },
    },
  };
}
