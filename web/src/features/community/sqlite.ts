import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { dirname } from "node:path";

import { getAppConfig } from "@/config/env";

import { homeDiscoveryFeaturedSlots } from "@/features/home-discovery/config";
import {
  modelProfiles,
  opportunityPosts,
  photographerProfiles,
  works as showcaseWorks,
} from "@/features/showcase/sample-data";

import {
  buildCreatorProfileId,
  createShowcaseSeedSnapshot,
  getPublicWorkRecords,
} from "./contracts";

import type {
  AuditLogEntry,
  CommunityRepositoryBundle,
  CommunitySurface,
  CommunityWorkRecord,
  CreatorProfileRecord,
  CuratedSlotRecord,
  DiscoveryEventRecord,
  FollowRelationRecord,
  MessageThreadRecord,
  MessageThreadParticipantRecord,
  MessageRecord,
  WorkCommentRecord,
} from "./types";

type CommunitySqliteSeed = {
  profiles: CreatorProfileRecord[];
  works: CommunityWorkRecord[];
  curation: CuratedSlotRecord[];
  follows?: FollowRelationRecord[];
  comments?: WorkCommentRecord[];
  opportunityIds?: string[];
};

type CreateSqliteCommunityRepositoryBundleOptions = {
  seed?: CommunitySqliteSeed;
  databasePath?: string;
  forceReseed?: boolean;
};

type CreateReadonlySqliteCommunityRepositoryBundleOptions = {
  databasePath?: string;
  timeoutMs?: number;
};

type GetDefaultSqliteCommunityRepositoryBundleOptions = {
  databasePath?: string;
};

export type SqliteCommunityRepositoryBundle = CommunityRepositoryBundle & {
  databasePath: string;
  close(): void;
  /**
   * Phase 2 — Ops Back Office V1 (ADR-2). Runs `fn` inside a single
   * sqlite transaction (`BEGIN IMMEDIATE / COMMIT / ROLLBACK`) so
   * admin server actions can keep "business write + audit append"
   * atomic.
   */
  withTransaction<T>(fn: () => Promise<T> | T): Promise<T>;
};

let defaultBundle: SqliteCommunityRepositoryBundle | null = null;

const communitySeedSurfaces: CommunitySurface[] = ["home", "discover"];

const curationSectionOrder: Record<CuratedSlotRecord["sectionKind"], number> = {
  works: 0,
  profiles: 1,
  opportunities: 2,
};

type CreatorProfileRow = {
  id: string;
  role: CreatorProfileRecord["role"];
  slug: string;
  name: string;
  city: string;
  shooting_focus: string;
  discovery_context: string;
  external_handoff_url: string;
  tagline: string;
  bio: string;
  published_at: string;
  updated_at: string | null;
};

type CommunityWorkRow = {
  id: string;
  owner_profile_id: string;
  owner_role: CommunityWorkRecord["ownerRole"];
  owner_slug: string;
  owner_name: string;
  status: CommunityWorkRecord["status"];
  title: string;
  category: string;
  description: string;
  detail_note: string;
  cover_asset: string;
  published_at: string | null;
  updated_at: string | null;
};

type CuratedSlotRow = {
  surface: CuratedSlotRecord["surface"];
  section_kind: CuratedSlotRecord["sectionKind"];
  target_type: CuratedSlotRecord["targetType"];
  target_key: string;
  order_index: number;
};

type WorkCommentRow = {
  id: string;
  work_id: string;
  author_account_id: string;
  body: string;
  created_at: string;
};

type DiscoveryEventRow = {
  id: string;
  event_type: DiscoveryEventRecord["eventType"];
  actor_account_id: string | null;
  target_type: DiscoveryEventRecord["targetType"];
  target_id: string;
  target_profile_id: string | null;
  surface: string;
  query: string;
  success: number;
  failure_reason: string | null;
  created_at: string;
};

type AuditLogRow = {
  id: string;
  created_at: string;
  actor_account_id: string;
  actor_email: string;
  action: AuditLogEntry["action"];
  target_kind: AuditLogEntry["targetKind"];
  target_id: string;
  note: string | null;
};

type MessageThreadRow = {
  id: string;
  kind: MessageThreadRecord["kind"];
  subject: string | null;
  context_ref: string | null;
  created_at: string;
  last_message_at: string | null;
};

type MessageThreadParticipantRow = {
  thread_id: string;
  account_id: string;
  role: MessageThreadParticipantRecord["role"];
  joined_at: string;
  last_read_at: string | null;
};

type MessageRow = {
  id: string;
  thread_id: string;
  author_account_id: string | null;
  kind: MessageRecord["kind"];
  body: string;
  created_at: string;
};

type ThreadProjectionRow = MessageThreadRow & {
  counterpart_account_id: string;
  unread_count: number;
};

function mapCreatorProfileRow(row: CreatorProfileRow): CreatorProfileRecord {
  return {
    id: row.id,
    role: row.role,
    slug: row.slug,
    name: row.name,
    city: row.city,
    shootingFocus: row.shooting_focus,
    discoveryContext: row.discovery_context,
    externalHandoffUrl: row.external_handoff_url,
    tagline: row.tagline,
    bio: row.bio,
    publishedAt: row.published_at,
    updatedAt: row.updated_at ?? undefined,
  };
}

function mapCommunityWorkRow(row: CommunityWorkRow): CommunityWorkRecord {
  return {
    id: row.id,
    ownerProfileId: row.owner_profile_id,
    ownerRole: row.owner_role,
    ownerSlug: row.owner_slug,
    ownerName: row.owner_name,
    status: row.status,
    title: row.title,
    category: row.category,
    description: row.description,
    detailNote: row.detail_note,
    coverAsset: row.cover_asset,
    publishedAt: row.published_at ?? undefined,
    updatedAt: row.updated_at ?? undefined,
  };
}

function mapCuratedSlotRow(row: CuratedSlotRow): CuratedSlotRecord {
  return {
    surface: row.surface,
    sectionKind: row.section_kind,
    targetType: row.target_type,
    targetKey: row.target_key,
    order: row.order_index,
  };
}

function mapWorkCommentRow(row: WorkCommentRow): WorkCommentRecord {
  return {
    id: row.id,
    workId: row.work_id,
    authorAccountId: row.author_account_id,
    body: row.body,
    createdAt: row.created_at,
  };
}

function mapDiscoveryEventRow(row: DiscoveryEventRow): DiscoveryEventRecord {
  return {
    id: row.id,
    eventType: row.event_type,
    actorAccountId: row.actor_account_id,
    targetType: row.target_type,
    targetId: row.target_id,
    targetProfileId: row.target_profile_id ?? undefined,
    surface: row.surface,
    query: row.query,
    success: Boolean(row.success),
    failureReason: row.failure_reason ?? undefined,
    createdAt: row.created_at,
  };
}

function mapAuditLogRow(row: AuditLogRow): AuditLogEntry {
  return {
    id: row.id,
    createdAt: row.created_at,
    actorAccountId: row.actor_account_id,
    actorEmail: row.actor_email,
    action: row.action,
    targetKind: row.target_kind,
    targetId: row.target_id,
    note: row.note ?? undefined,
  };
}

function mapMessageThreadRow(row: MessageThreadRow): MessageThreadRecord {
  return {
    id: row.id,
    kind: row.kind,
    subject: row.subject ?? undefined,
    contextRef: row.context_ref ?? undefined,
    createdAt: row.created_at,
    lastMessageAt: row.last_message_at ?? undefined,
  };
}

function mapMessageThreadParticipantRow(
  row: MessageThreadParticipantRow,
): MessageThreadParticipantRecord {
  return {
    threadId: row.thread_id,
    accountId: row.account_id,
    role: row.role,
    joinedAt: row.joined_at,
    lastReadAt: row.last_read_at ?? undefined,
  };
}

function mapMessageRow(row: MessageRow): MessageRecord {
  return {
    id: row.id,
    threadId: row.thread_id,
    authorAccountId: row.author_account_id,
    kind: row.kind,
    body: row.body,
    createdAt: row.created_at,
  };
}

function createCommunityCurationSeed(
  seed: Pick<CommunitySqliteSeed, "profiles" | "works" | "opportunityIds">,
): CuratedSlotRecord[] {
  const publishedWorkIds = new Set(
    getPublicWorkRecords(seed.works).map((work) => work.id),
  );
  const profileIds = new Set(seed.profiles.map((profile) => profile.id));
  const opportunityIds = new Set(seed.opportunityIds ?? []);
  const curation: CuratedSlotRecord[] = [];

  for (const surface of communitySeedSurfaces) {
    for (const slotConfig of homeDiscoveryFeaturedSlots) {
      if (slotConfig.kind === "works") {
        slotConfig.featuredIds.forEach((targetKey, index) => {
          if (!publishedWorkIds.has(targetKey)) {
            return;
          }

          curation.push({
            surface,
            sectionKind: "works",
            targetType: "work",
            targetKey,
            order: index + 1,
          });
        });
      }

      if (slotConfig.kind === "profiles") {
        slotConfig.featuredProfiles.forEach((profileRef, index) => {
          const targetKey = buildCreatorProfileId(profileRef.role, profileRef.slug);

          if (!profileIds.has(targetKey)) {
            return;
          }

          curation.push({
            surface,
            sectionKind: "profiles",
            targetType: "profile",
            targetKey,
            order: index + 1,
          });
        });
      }

      if (slotConfig.kind === "opportunities") {
        slotConfig.featuredIds.forEach((targetKey, index) => {
          if (!opportunityIds.has(targetKey)) {
            return;
          }

          curation.push({
            surface,
            sectionKind: "opportunities",
            targetType: "opportunity",
            targetKey,
            order: index + 1,
          });
        });
      }
    }
  }

  return curation;
}

function createSchema(database: DatabaseSync) {
  database.exec(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS creator_profiles (
      id TEXT PRIMARY KEY,
      role TEXT NOT NULL,
      slug TEXT NOT NULL,
      name TEXT NOT NULL,
      city TEXT NOT NULL,
      shooting_focus TEXT NOT NULL DEFAULT '',
      discovery_context TEXT NOT NULL DEFAULT '',
      external_handoff_url TEXT NOT NULL DEFAULT '',
      tagline TEXT NOT NULL,
      bio TEXT NOT NULL,
      published_at TEXT NOT NULL,
      updated_at TEXT,
      UNIQUE(role, slug)
    );

    CREATE TABLE IF NOT EXISTS works (
      id TEXT PRIMARY KEY,
      owner_profile_id TEXT NOT NULL,
      owner_role TEXT NOT NULL,
      owner_slug TEXT NOT NULL,
      owner_name TEXT NOT NULL,
      status TEXT NOT NULL,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      detail_note TEXT NOT NULL,
      cover_asset TEXT NOT NULL,
      published_at TEXT,
      updated_at TEXT,
      FOREIGN KEY(owner_profile_id) REFERENCES creator_profiles(id)
    );

    CREATE TABLE IF NOT EXISTS curated_slots (
      surface TEXT NOT NULL,
      section_kind TEXT NOT NULL,
      target_type TEXT NOT NULL,
      target_key TEXT NOT NULL,
      order_index INTEGER NOT NULL,
      PRIMARY KEY(surface, section_kind, target_key)
    );

    CREATE TABLE IF NOT EXISTS follows (
      follower_account_id TEXT NOT NULL,
      creator_profile_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      PRIMARY KEY(follower_account_id, creator_profile_id),
      FOREIGN KEY(creator_profile_id) REFERENCES creator_profiles(id)
    );

    CREATE TABLE IF NOT EXISTS work_comments (
      id TEXT PRIMARY KEY,
      work_id TEXT NOT NULL,
      author_account_id TEXT NOT NULL,
      body TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY(work_id) REFERENCES works(id)
    );

    CREATE TABLE IF NOT EXISTS discovery_events (
      id TEXT PRIMARY KEY,
      event_type TEXT NOT NULL,
      actor_account_id TEXT,
      target_type TEXT NOT NULL,
      target_id TEXT NOT NULL,
      target_profile_id TEXT,
      surface TEXT NOT NULL,
      query TEXT NOT NULL DEFAULT '',
      success INTEGER NOT NULL,
      failure_reason TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS audit_log (
      id TEXT PRIMARY KEY,
      created_at TEXT NOT NULL,
      actor_account_id TEXT NOT NULL,
      actor_email TEXT NOT NULL,
      action TEXT NOT NULL,
      target_kind TEXT NOT NULL,
      target_id TEXT NOT NULL,
      note TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_audit_log_created_at_desc
      ON audit_log(created_at DESC, id DESC);

    CREATE TABLE IF NOT EXISTS message_threads (
      id TEXT PRIMARY KEY,
      kind TEXT NOT NULL,
      subject TEXT,
      context_ref TEXT,
      created_at TEXT NOT NULL,
      last_message_at TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_threads_last_message_at_desc
      ON message_threads(last_message_at DESC, id DESC);

    CREATE TABLE IF NOT EXISTS message_thread_participants (
      thread_id TEXT NOT NULL,
      account_id TEXT NOT NULL,
      role TEXT NOT NULL,
      joined_at TEXT NOT NULL,
      last_read_at TEXT,
      PRIMARY KEY (thread_id, account_id),
      FOREIGN KEY (thread_id) REFERENCES message_threads(id)
    );
    CREATE INDEX IF NOT EXISTS idx_thread_participants_account
      ON message_thread_participants(account_id, last_read_at);

    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      thread_id TEXT NOT NULL,
      author_account_id TEXT,
      kind TEXT NOT NULL,
      body TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (thread_id) REFERENCES message_threads(id)
    );
    CREATE INDEX IF NOT EXISTS idx_messages_thread_created_at
      ON messages(thread_id, created_at ASC);
  `);

  ensureCreatorProfileColumns(database);
}

function ensureCreatorProfileColumns(database: DatabaseSync) {
  const profileColumns = database
    .prepare(`PRAGMA table_info(creator_profiles)`)
    .all() as Array<{ name: string }>;
  const existingColumns = new Set(profileColumns.map((column) => column.name));

  if (!existingColumns.has("shooting_focus")) {
    database.exec(
      `ALTER TABLE creator_profiles ADD COLUMN shooting_focus TEXT NOT NULL DEFAULT ''`,
    );
  }

  if (!existingColumns.has("discovery_context")) {
    database.exec(
      `ALTER TABLE creator_profiles ADD COLUMN discovery_context TEXT NOT NULL DEFAULT ''`,
    );
  }

  if (!existingColumns.has("external_handoff_url")) {
    database.exec(
      `ALTER TABLE creator_profiles ADD COLUMN external_handoff_url TEXT NOT NULL DEFAULT ''`,
    );
  }
}

function resolveSqliteDatabasePath(databasePath?: string) {
  return databasePath ?? getAppConfig().sqliteDatabasePath;
}

function createRepositoryBundleFromDatabase(
  database: DatabaseSync,
  databasePath: string,
): SqliteCommunityRepositoryBundle {
  let closed = false;

  const bundle: SqliteCommunityRepositoryBundle = {
    databasePath,
    profiles: {
      async getById(id) {
        const row = database
          .prepare(
            `SELECT * FROM creator_profiles WHERE id = ?`,
          )
          .get(id) as CreatorProfileRow | undefined;

        return row ? mapCreatorProfileRow(row) : null;
      },
      async getByRoleAndSlug(role, slug) {
        const row = database
          .prepare(
            `SELECT * FROM creator_profiles WHERE role = ? AND slug = ?`,
          )
          .get(role, slug) as CreatorProfileRow | undefined;

        return row ? mapCreatorProfileRow(row) : null;
      },
      async listPublicProfiles() {
        const rows = database
          .prepare(
            `SELECT * FROM creator_profiles ORDER BY published_at DESC, id ASC`,
          )
          .all() as CreatorProfileRow[];

        return rows.map(mapCreatorProfileRow);
      },
      async updateById(id, input) {
        const result = database
          .prepare(
            `
              UPDATE creator_profiles
              SET
                name = ?,
                city = ?,
                shooting_focus = ?,
                discovery_context = ?,
                external_handoff_url = ?,
                tagline = ?,
                bio = ?,
                updated_at = ?
              WHERE id = ?
            `,
          )
          .run(
            input.name,
            input.city,
            input.shootingFocus,
            input.discoveryContext,
            input.externalHandoffUrl,
            input.tagline,
            input.bio,
            input.updatedAt ?? null,
            id,
          ) as { changes?: number };

        if (!result.changes) {
          throw new Error(`Creator profile not found: ${id}`);
        }

        const row = database
          .prepare(`SELECT * FROM creator_profiles WHERE id = ?`)
          .get(id) as CreatorProfileRow | undefined;

        if (!row) {
          throw new Error(`Creator profile not found after update: ${id}`);
        }

        return mapCreatorProfileRow(row);
      },
    },
    works: {
      async getById(id) {
        const row = database
          .prepare(`SELECT * FROM works WHERE id = ?`)
          .get(id) as CommunityWorkRow | undefined;

        return row ? mapCommunityWorkRow(row) : null;
      },
      async listByOwnerProfileId(ownerProfileId) {
        const rows = database
          .prepare(
            `
              SELECT * FROM works
              WHERE owner_profile_id = ?
              ORDER BY COALESCE(updated_at, published_at) DESC, id ASC
            `,
          )
          .all(ownerProfileId) as CommunityWorkRow[];

        return rows.map(mapCommunityWorkRow);
      },
      async listPublicWorks() {
        const rows = database
          .prepare(
            `
              SELECT * FROM works
              WHERE status = 'published'
              ORDER BY COALESCE(updated_at, published_at) DESC, id ASC
            `,
          )
          .all() as CommunityWorkRow[];

        return rows.map(mapCommunityWorkRow);
      },
      async listAllForAdmin() {
        const rows = database
          .prepare(
            `
              SELECT * FROM works
              ORDER BY COALESCE(updated_at, published_at) DESC, id ASC
            `,
          )
          .all() as CommunityWorkRow[];

        return rows.map(mapCommunityWorkRow);
      },
      async save(input) {
        database
          .prepare(
            `
              INSERT INTO works (
                id,
                owner_profile_id,
                owner_role,
                owner_slug,
                owner_name,
                status,
                title,
                category,
                description,
                detail_note,
                cover_asset,
                published_at,
                updated_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
              ON CONFLICT(id) DO UPDATE SET
                owner_profile_id = excluded.owner_profile_id,
                owner_role = excluded.owner_role,
                owner_slug = excluded.owner_slug,
                owner_name = excluded.owner_name,
                status = excluded.status,
                title = excluded.title,
                category = excluded.category,
                description = excluded.description,
                detail_note = excluded.detail_note,
                cover_asset = excluded.cover_asset,
                published_at = excluded.published_at,
                updated_at = excluded.updated_at
            `,
          )
          .run(
            input.id,
            input.ownerProfileId,
            input.ownerRole,
            input.ownerSlug,
            input.ownerName,
            input.status,
            input.title,
            input.category,
            input.description,
            input.detailNote,
            input.coverAsset,
            input.publishedAt ?? null,
            input.updatedAt ?? null,
          );

        const row = database
          .prepare(`SELECT * FROM works WHERE id = ?`)
          .get(input.id) as CommunityWorkRow | undefined;

        if (!row) {
          throw new Error(`Work not found after save: ${input.id}`);
        }

        return mapCommunityWorkRow(row);
      },
    },
    follows: {
      async isFollowing(followerAccountId, creatorProfileId) {
        const row = database
          .prepare(
            `
              SELECT 1
              FROM follows
              WHERE follower_account_id = ? AND creator_profile_id = ?
            `,
          )
          .get(followerAccountId, creatorProfileId) as
          | { 1: number }
          | undefined;

        return Boolean(row);
      },
      async listFollowedProfileIds(followerAccountId) {
        const rows = database
          .prepare(
            `
              SELECT creator_profile_id
              FROM follows
              WHERE follower_account_id = ?
              ORDER BY created_at DESC, creator_profile_id ASC
            `,
          )
          .all(followerAccountId) as Array<{ creator_profile_id: string }>;

        return rows.map((row) => row.creator_profile_id);
      },
      async follow(followerAccountId, creatorProfileId) {
        database
          .prepare(
            `
              INSERT INTO follows (
                follower_account_id,
                creator_profile_id,
                created_at
              ) VALUES (?, ?, ?)
              ON CONFLICT(follower_account_id, creator_profile_id) DO NOTHING
            `,
          )
          .run(followerAccountId, creatorProfileId, new Date().toISOString());
      },
      async unfollow(followerAccountId, creatorProfileId) {
        database
          .prepare(
            `
              DELETE FROM follows
              WHERE follower_account_id = ? AND creator_profile_id = ?
            `,
          )
          .run(followerAccountId, creatorProfileId);
      },
    },
    comments: {
      async listByWorkId(workId) {
        const rows = database
          .prepare(
            `
              SELECT * FROM work_comments
              WHERE work_id = ?
              ORDER BY created_at DESC, id DESC
            `,
          )
          .all(workId) as WorkCommentRow[];

        return rows.map(mapWorkCommentRow);
      },
      async add(input) {
        database
          .prepare(
            `
              INSERT INTO work_comments (
                id,
                work_id,
                author_account_id,
                body,
                created_at
              ) VALUES (?, ?, ?, ?, ?)
            `,
          )
          .run(
            input.id,
            input.workId,
            input.authorAccountId,
            input.body,
            input.createdAt,
          );

        const row = database
          .prepare(`SELECT * FROM work_comments WHERE id = ?`)
          .get(input.id) as WorkCommentRow | undefined;

        if (!row) {
          throw new Error(`Comment not found after insert: ${input.id}`);
        }

        return mapWorkCommentRow(row);
      },
    },
    curation: {
      async listSlotsBySurface(surface) {
        const rows = database
          .prepare(
            `
              SELECT * FROM curated_slots
              WHERE surface = ?
              ORDER BY
                order_index ASC,
                CASE section_kind
                  WHEN 'works' THEN 0
                  WHEN 'profiles' THEN 1
                  ELSE 2
                END ASC,
                target_key ASC
            `,
          )
          .all(surface) as CuratedSlotRow[];

        return rows
          .map(mapCuratedSlotRow)
          .sort(
            (left, right) =>
              left.order - right.order ||
              curationSectionOrder[left.sectionKind] -
                curationSectionOrder[right.sectionKind] ||
              left.targetKey.localeCompare(right.targetKey),
          );
      },
      async upsertSlot(slot) {
        database
          .prepare(
            `
              INSERT INTO curated_slots (
                surface, section_kind, target_type, target_key, order_index
              ) VALUES (?, ?, ?, ?, ?)
              ON CONFLICT(surface, section_kind, target_key) DO UPDATE SET
                target_type = excluded.target_type,
                order_index = excluded.order_index
            `,
          )
          .run(
            slot.surface,
            slot.sectionKind,
            slot.targetType,
            slot.targetKey,
            slot.order,
          );

        const row = database
          .prepare(
            `
              SELECT * FROM curated_slots
              WHERE surface = ? AND section_kind = ? AND target_key = ?
            `,
          )
          .get(slot.surface, slot.sectionKind, slot.targetKey) as
          | CuratedSlotRow
          | undefined;

        if (!row) {
          throw new Error(
            `Curation slot vanished after upsert: ${slot.surface}/${slot.sectionKind}/${slot.targetKey}`,
          );
        }
        return mapCuratedSlotRow(row);
      },
      async removeSlot(key) {
        database
          .prepare(
            `
              DELETE FROM curated_slots
              WHERE surface = ? AND section_kind = ? AND target_key = ?
            `,
          )
          .run(key.surface, key.sectionKind, key.targetKey);
      },
      async reorderSlot(key) {
        const result = database
          .prepare(
            `
              UPDATE curated_slots
              SET order_index = ?
              WHERE surface = ? AND section_kind = ? AND target_key = ?
            `,
          )
          .run(key.order, key.surface, key.sectionKind, key.targetKey);

        if (result.changes === 0) {
          return null;
        }

        const row = database
          .prepare(
            `
              SELECT * FROM curated_slots
              WHERE surface = ? AND section_kind = ? AND target_key = ?
            `,
          )
          .get(key.surface, key.sectionKind, key.targetKey) as
          | CuratedSlotRow
          | undefined;

        return row ? mapCuratedSlotRow(row) : null;
      },
    },
    discovery: {
      async record(input) {
        const event = {
          id: input.id ?? randomUUID(),
          eventType: input.eventType,
          actorAccountId: input.actorAccountId ?? null,
          targetType: input.targetType,
          targetId: input.targetId,
          targetProfileId: input.targetProfileId ?? null,
          surface: input.surface,
          query: input.query.trim().slice(0, 120),
          success: input.success,
          failureReason: input.failureReason ?? null,
          createdAt: input.createdAt ?? new Date().toISOString(),
        };

        database
          .prepare(
            `
              INSERT INTO discovery_events (
                id,
                event_type,
                actor_account_id,
                target_type,
                target_id,
                target_profile_id,
                surface,
                query,
                success,
                failure_reason,
                created_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `,
          )
          .run(
            event.id,
            event.eventType,
            event.actorAccountId,
            event.targetType,
            event.targetId,
            event.targetProfileId,
            event.surface,
            event.query,
            event.success ? 1 : 0,
            event.failureReason,
            event.createdAt,
          );

        return {
          ...event,
          targetProfileId: event.targetProfileId ?? undefined,
          failureReason: event.failureReason ?? undefined,
        };
      },
      async listAll() {
        const rows = database
          .prepare(
            `
              SELECT * FROM discovery_events
              ORDER BY created_at ASC, id ASC
            `,
          )
          .all() as DiscoveryEventRow[];

        return rows.map(mapDiscoveryEventRow);
      },
    },
    audit: {
      async record(input) {
        const id = input.id ?? randomUUID();
        const createdAt = input.createdAt ?? new Date().toISOString();

        database
          .prepare(
            `
              INSERT INTO audit_log (
                id, created_at, actor_account_id, actor_email,
                action, target_kind, target_id, note
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `,
          )
          .run(
            id,
            createdAt,
            input.actorAccountId,
            input.actorEmail,
            input.action,
            input.targetKind,
            input.targetId,
            input.note ?? null,
          );

        return {
          id,
          createdAt,
          actorAccountId: input.actorAccountId,
          actorEmail: input.actorEmail,
          action: input.action,
          targetKind: input.targetKind,
          targetId: input.targetId,
          note: input.note,
        };
      },
      async listLatest(limit) {
        const rows = database
          .prepare(
            `
              SELECT * FROM audit_log
              ORDER BY created_at DESC, id DESC
              LIMIT ?
            `,
          )
          .all(limit) as AuditLogRow[];

        return rows.map(mapAuditLogRow);
      },
    },
    messaging: {
      threads: {
        async createDirectThread(input) {
          const id = randomUUID();
          const createdAt = new Date().toISOString();
          database
            .prepare(
              `INSERT INTO message_threads (id, kind, subject, context_ref, created_at, last_message_at)
               VALUES (?, 'direct', NULL, ?, ?, NULL)`,
            )
            .run(id, input.contextRef ?? null, createdAt);
          database
            .prepare(
              `INSERT INTO message_thread_participants (thread_id, account_id, role, joined_at, last_read_at)
               VALUES (?, ?, 'initiator', ?, NULL)`,
            )
            .run(id, input.initiatorAccountId, createdAt);
          database
            .prepare(
              `INSERT INTO message_thread_participants (thread_id, account_id, role, joined_at, last_read_at)
               VALUES (?, ?, 'recipient', ?, NULL)`,
            )
            .run(id, input.recipientAccountId, createdAt);
          return {
            id,
            kind: "direct",
            subject: undefined,
            contextRef: input.contextRef,
            createdAt,
            lastMessageAt: undefined,
          };
        },
        async findDirectThreadByUnorderedPair(accountA, accountB, contextRef) {
          const row = database
            .prepare(
              `SELECT t.* FROM message_threads t
               WHERE t.kind = 'direct'
                 AND ((? IS NULL AND t.context_ref IS NULL) OR t.context_ref = ?)
                 AND t.id IN (
                   SELECT thread_id FROM message_thread_participants
                   WHERE account_id IN (?, ?)
                   GROUP BY thread_id
                   HAVING COUNT(DISTINCT account_id) = 2
                 )
               LIMIT 1`,
            )
            .get(contextRef ?? null, contextRef ?? null, accountA, accountB) as
            | MessageThreadRow
            | undefined;
          return row ? mapMessageThreadRow(row) : null;
        },
        async getThreadById(id) {
          const row = database
            .prepare(`SELECT * FROM message_threads WHERE id = ?`)
            .get(id) as MessageThreadRow | undefined;
          return row ? mapMessageThreadRow(row) : null;
        },
        async updateLastMessageAt(threadId, ts) {
          database
            .prepare(
              `UPDATE message_threads SET last_message_at = ? WHERE id = ?`,
            )
            .run(ts, threadId);
        },
        async listThreadsForAccount(accountId, limit) {
          const rows = database
            .prepare(
              `SELECT
                 t.id, t.kind, t.subject, t.context_ref, t.created_at, t.last_message_at,
                 (SELECT p2.account_id FROM message_thread_participants p2
                  WHERE p2.thread_id = t.id AND p2.account_id <> ?) AS counterpart_account_id,
                 (SELECT COUNT(*) FROM messages m
                  WHERE m.thread_id = t.id
                    AND (m.author_account_id IS NULL OR m.author_account_id <> ?)
                    AND m.created_at > COALESCE(self.last_read_at, '')
                 ) AS unread_count
               FROM message_threads t
               INNER JOIN message_thread_participants self
                 ON self.thread_id = t.id AND self.account_id = ?
               WHERE t.kind = 'direct'
               ORDER BY COALESCE(t.last_message_at, t.created_at) DESC, t.id DESC
               LIMIT ?`,
            )
            .all(accountId, accountId, accountId, limit) as ThreadProjectionRow[];
          return rows.map((row) => ({
            thread: mapMessageThreadRow(row),
            counterpartAccountId: row.counterpart_account_id,
            unreadCount: row.unread_count,
          }));
        },
      },
      messages: {
        async appendMessage(input) {
          const id = randomUUID();
          const createdAt = new Date().toISOString();
          database
            .prepare(
              `INSERT INTO messages (id, thread_id, author_account_id, kind, body, created_at)
               VALUES (?, ?, ?, 'text', ?, ?)`,
            )
            .run(id, input.threadId, input.authorAccountId, input.body, createdAt);
          return {
            id,
            threadId: input.threadId,
            authorAccountId: input.authorAccountId,
            kind: "text",
            body: input.body,
            createdAt,
          };
        },
        async listByThreadId(threadId, limit) {
          const rows = database
            .prepare(
              `SELECT * FROM messages
               WHERE thread_id = ?
               ORDER BY created_at ASC, id ASC
               LIMIT ?`,
            )
            .all(threadId, limit) as MessageRow[];
          return rows.map(mapMessageRow);
        },
      },
      participants: {
        async listForThread(threadId) {
          const rows = database
            .prepare(
              `SELECT * FROM message_thread_participants WHERE thread_id = ?`,
            )
            .all(threadId) as MessageThreadParticipantRow[];
          return rows.map(mapMessageThreadParticipantRow);
        },
        async markRead(threadId, accountId, ts) {
          database
            .prepare(
              `UPDATE message_thread_participants
               SET last_read_at = ?
               WHERE thread_id = ? AND account_id = ?`,
            )
            .run(ts, threadId, accountId);
        },
        async getUnreadCountForAccount(accountId) {
          const row = database
            .prepare(
              `SELECT COALESCE(SUM(unread), 0) AS total FROM (
                 SELECT (
                   SELECT COUNT(*) FROM messages m
                   WHERE m.thread_id = self.thread_id
                     AND (m.author_account_id IS NULL OR m.author_account_id <> ?)
                     AND m.created_at > COALESCE(self.last_read_at, '')
                 ) AS unread
                 FROM message_thread_participants self
                 WHERE self.account_id = ?
               )`,
            )
            .get(accountId, accountId) as { total: number };
          return row.total;
        },
      },
    },
    async withTransaction(fn) {
      database.exec("BEGIN IMMEDIATE");
      try {
        const result = await fn();
        database.exec("COMMIT");
        return result;
      } catch (error) {
        try {
          database.exec("ROLLBACK");
        } catch {
          // ignore rollback errors so the original error propagates
        }
        throw error;
      }
    },
    close() {
      if (closed) {
        return;
      }

      closed = true;
      database.close();

      if (defaultBundle === bundle) {
        defaultBundle = null;
      }
    },
  };

  return bundle;
}

function ensureSqliteDatabaseDirectory(databasePath: string) {
  if (databasePath === ":memory:") {
    return;
  }

  mkdirSync(dirname(databasePath), { recursive: true });
}

function isDatabaseEmpty(database: DatabaseSync) {
  const profilesCount = database
    .prepare(`SELECT COUNT(*) AS count FROM creator_profiles`)
    .get() as { count: number };
  const worksCount = database
    .prepare(`SELECT COUNT(*) AS count FROM works`)
    .get() as { count: number };
  const curatedSlotsCount = database
    .prepare(`SELECT COUNT(*) AS count FROM curated_slots`)
    .get() as { count: number };
  const followsCount = database
    .prepare(`SELECT COUNT(*) AS count FROM follows`)
    .get() as { count: number };
  const commentsCount = database
    .prepare(`SELECT COUNT(*) AS count FROM work_comments`)
    .get() as { count: number };

  return (
    profilesCount.count === 0 &&
    worksCount.count === 0 &&
    curatedSlotsCount.count === 0 &&
    followsCount.count === 0 &&
    commentsCount.count === 0
  );
}

function isCuratedSlotValid(
  slot: CuratedSlotRecord,
  seed: CommunitySqliteSeed,
): boolean {
  if (slot.targetType === "work") {
    return getPublicWorkRecords(seed.works).some((work) => work.id === slot.targetKey);
  }

  if (slot.targetType === "profile") {
    return seed.profiles.some((profile) => profile.id === slot.targetKey);
  }

  return (seed.opportunityIds ?? []).includes(slot.targetKey);
}

function seedDatabase(database: DatabaseSync, seed: CommunitySqliteSeed) {
  const insertProfile = database.prepare(`
    INSERT INTO creator_profiles (
      id, role, slug, name, city, shooting_focus, discovery_context, external_handoff_url, tagline, bio, published_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertWork = database.prepare(`
    INSERT INTO works (
      id,
      owner_profile_id,
      owner_role,
      owner_slug,
      owner_name,
      status,
      title,
      category,
      description,
      detail_note,
      cover_asset,
      published_at,
      updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertCuratedSlot = database.prepare(`
    INSERT INTO curated_slots (
      surface, section_kind, target_type, target_key, order_index
    ) VALUES (?, ?, ?, ?, ?)
  `);
  const insertFollow = database.prepare(`
    INSERT INTO follows (
      follower_account_id, creator_profile_id, created_at
    ) VALUES (?, ?, ?)
  `);
  const insertComment = database.prepare(`
    INSERT INTO work_comments (
      id, work_id, author_account_id, body, created_at
    ) VALUES (?, ?, ?, ?, ?)
  `);

  database.exec(`
    DELETE FROM discovery_events;
    DELETE FROM work_comments;
    DELETE FROM follows;
    DELETE FROM curated_slots;
    DELETE FROM works;
    DELETE FROM creator_profiles;
  `);

  for (const profile of seed.profiles) {
    insertProfile.run(
      profile.id,
      profile.role,
      profile.slug,
      profile.name,
      profile.city,
      profile.shootingFocus,
      profile.discoveryContext,
      profile.externalHandoffUrl,
      profile.tagline,
      profile.bio,
      profile.publishedAt,
      profile.updatedAt ?? null,
    );
  }

  for (const work of seed.works) {
    insertWork.run(
      work.id,
      work.ownerProfileId,
      work.ownerRole,
      work.ownerSlug,
      work.ownerName,
      work.status,
      work.title,
      work.category,
      work.description,
      work.detailNote,
      work.coverAsset,
      work.publishedAt ?? null,
      work.updatedAt ?? null,
    );
  }

  for (const slot of seed.curation) {
    if (!isCuratedSlotValid(slot, seed)) {
      continue;
    }

    insertCuratedSlot.run(
      slot.surface,
      slot.sectionKind,
      slot.targetType,
      slot.targetKey,
      slot.order,
    );
  }

  for (const relation of seed.follows ?? []) {
    insertFollow.run(
      relation.followerAccountId,
      relation.creatorProfileId,
      relation.createdAt,
    );
  }

  for (const comment of seed.comments ?? []) {
    insertComment.run(
      comment.id,
      comment.workId,
      comment.authorAccountId,
      comment.body,
      comment.createdAt,
    );
  }
}

export function createDefaultSqliteCommunitySeed(): CommunitySqliteSeed {
  const snapshot = createShowcaseSeedSnapshot(
    [...photographerProfiles, ...modelProfiles],
    showcaseWorks,
  );

  return {
    profiles: snapshot.profiles,
    works: snapshot.works,
    curation: createCommunityCurationSeed({
      profiles: snapshot.profiles,
      works: snapshot.works,
      opportunityIds: opportunityPosts.map((post) => post.id),
    }),
    follows: [],
    comments: [],
    opportunityIds: opportunityPosts.map((post) => post.id),
  };
}

export function createSqliteCommunityRepositoryBundle(
  options: CreateSqliteCommunityRepositoryBundleOptions = {},
): SqliteCommunityRepositoryBundle {
  const databasePath = resolveSqliteDatabasePath(options.databasePath);

  ensureSqliteDatabaseDirectory(databasePath);

  const database = new DatabaseSync(databasePath, {
    timeout: 1000,
  });
  const seed = options.seed ?? createDefaultSqliteCommunitySeed();

  createSchema(database);
  if (options.forceReseed ?? isDatabaseEmpty(database)) {
    seedDatabase(database, seed);
  }

  return createRepositoryBundleFromDatabase(database, databasePath);
}

export function createReadonlySqliteCommunityRepositoryBundle(
  options: CreateReadonlySqliteCommunityRepositoryBundleOptions = {},
): SqliteCommunityRepositoryBundle {
  const databasePath = resolveSqliteDatabasePath(options.databasePath);

  if (databasePath !== ":memory:") {
    const initializer = createSqliteCommunityRepositoryBundle({ databasePath });
    initializer.close();
  }

  const database = new DatabaseSync(databasePath, {
    readOnly: databasePath !== ":memory:",
    timeout: options.timeoutMs ?? 1000,
  });

  if (databasePath === ":memory:") {
    createSchema(database);
  }

  return createRepositoryBundleFromDatabase(database, databasePath);
}

export function getDefaultSqliteCommunityRepositoryBundle(
  options: GetDefaultSqliteCommunityRepositoryBundleOptions = {},
) {
  const databasePath = resolveSqliteDatabasePath(options.databasePath);

  if (defaultBundle && defaultBundle.databasePath === databasePath) {
    return defaultBundle;
  }

  if (defaultBundle) {
    defaultBundle.close();
  }

  if (!existsSync(databasePath)) {
    ensureSqliteDatabaseDirectory(databasePath);
  }

  defaultBundle = createSqliteCommunityRepositoryBundle({
    databasePath,
  });

  return defaultBundle;
}
