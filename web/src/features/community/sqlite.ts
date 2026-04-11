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
  CommunityRepositoryBundle,
  CommunitySurface,
  CommunityWorkRecord,
  CreatorProfileRecord,
  CuratedSlotRecord,
  DiscoveryEventRecord,
  FollowRelationRecord,
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
