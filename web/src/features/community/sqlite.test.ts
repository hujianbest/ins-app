import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, test } from "vitest";

import {
  modelProfiles,
  photographerProfiles,
  opportunityPosts,
  works,
} from "@/features/showcase/sample-data";

import { createShowcaseSeedSnapshot } from "./contracts";
import { createDefaultSqliteCommunitySeed, createSqliteCommunityRepositoryBundle } from "./sqlite";
import type { CommunityWorkRecord, CuratedSlotRecord } from "./types";

test("default sqlite seed bridges showcase and home discovery data into stable repository reads", async () => {
  const seed = createDefaultSqliteCommunitySeed();
  const bundle = createSqliteCommunityRepositoryBundle({
    seed,
    databasePath: ":memory:",
  });
  const discoverSlots = await bundle.curation.listSlotsBySurface("discover");

  await expect(bundle.profiles.listPublicProfiles()).resolves.toHaveLength(
    photographerProfiles.length + modelProfiles.length,
  );
  await expect(bundle.works.listPublicWorks()).resolves.toHaveLength(works.length);

  await expect(bundle.curation.listSlotsBySurface("home")).resolves.toHaveLength(
    6,
  );
  expect(discoverSlots).toEqual(
    expect.arrayContaining([
      {
        surface: "discover",
        sectionKind: "works",
        targetType: "work",
        targetKey: "neon-portrait-study",
        order: 1,
      },
      {
        surface: "discover",
        sectionKind: "profiles",
        targetType: "profile",
        targetKey: "photographer:elio-ren",
        order: 1,
      },
      {
        surface: "discover",
        sectionKind: "opportunities",
        targetType: "opportunity",
        targetKey: "shenzhen-monochrome-campaign",
        order: 1,
      },
    ]),
  );
  bundle.close();
});

test("sqlite seed skips invalid curated targets and keeps draft works out of public reads", async () => {
  const snapshot = createShowcaseSeedSnapshot(
    [...photographerProfiles, ...modelProfiles],
    works,
  );
  const draftWork: CommunityWorkRecord = {
    ...snapshot.works[0],
    id: "draft-work",
    status: "draft",
    publishedAt: undefined,
  };
  const curation: CuratedSlotRecord[] = [
    {
      surface: "home",
      sectionKind: "works",
      targetType: "work",
      targetKey: "neon-portrait-study",
      order: 1,
    },
    {
      surface: "home",
      sectionKind: "works",
      targetType: "work",
      targetKey: "draft-work",
      order: 2,
    },
    {
      surface: "home",
      sectionKind: "profiles",
      targetType: "profile",
      targetKey: "model:sample-model",
      order: 3,
    },
    {
      surface: "home",
      sectionKind: "works",
      targetType: "work",
      targetKey: "missing-work",
      order: 4,
    },
  ];

  const bundle = createSqliteCommunityRepositoryBundle({
    seed: {
      profiles: snapshot.profiles,
      works: [...snapshot.works, draftWork],
      curation,
    },
    databasePath: ":memory:",
  });

  await expect(bundle.works.listPublicWorks()).resolves.toHaveLength(works.length);
  await expect(bundle.curation.listSlotsBySurface("home")).resolves.toEqual([
    {
      surface: "home",
      sectionKind: "works",
      targetType: "work",
      targetKey: "neon-portrait-study",
      order: 1,
    },
    {
      surface: "home",
      sectionKind: "profiles",
      targetType: "profile",
      targetKey: "model:sample-model",
      order: 3,
    },
  ]);
  bundle.close();
});

test("file-backed sqlite bundle keeps existing seeded state instead of reseeding on re-creation", async () => {
  const tempDirectory = mkdtempSync(join(tmpdir(), "ins-app-community-"));
  const databasePath = join(tempDirectory, "community.sqlite");
  const firstBundle = createSqliteCommunityRepositoryBundle({
    databasePath,
    seed: {
      profiles: [
        {
          id: "photographer:custom-creator",
          role: "photographer",
          slug: "custom-creator",
          name: "Custom Creator",
          city: "上海",
          shootingFocus: "商业肖像",
          discoveryContext: "希望被本地品牌与长期合作模特看到",
          externalHandoffUrl: "https://portfolio.example.com/custom-creator",
          tagline: "custom",
          bio: "custom seed",
          publishedAt: "2026-04-09T00:00:00Z",
        },
      ],
      works: [],
      curation: [],
    },
  });

  await expect(firstBundle.profiles.listPublicProfiles()).resolves.toMatchObject([
    {
      id: "photographer:custom-creator",
      name: "Custom Creator",
    },
  ]);
  firstBundle.close();

  const secondBundle = createSqliteCommunityRepositoryBundle({
    databasePath,
    seed: createDefaultSqliteCommunitySeed(),
  });

  await expect(secondBundle.profiles.listPublicProfiles()).resolves.toEqual([
    expect.objectContaining({
      id: "photographer:custom-creator",
      name: "Custom Creator",
    }),
  ]);

  secondBundle.close();
  rmSync(tempDirectory, { recursive: true, force: true });
});

test("listPublicWorks excludes both draft and moderated works (Ops Back Office V1)", async () => {
  const snapshot = createShowcaseSeedSnapshot(
    [...photographerProfiles, ...modelProfiles],
    works,
  );
  const seedWorkId = snapshot.works[0].id;
  const draftWork: CommunityWorkRecord = {
    ...snapshot.works[0],
    id: "draft-work-x",
    status: "draft",
    title: "Draft work",
  };
  const moderatedWork: CommunityWorkRecord = {
    ...snapshot.works[0],
    id: "moderated-work-x",
    status: "moderated",
    title: "Moderated work",
  };

  const bundle = createSqliteCommunityRepositoryBundle({
    seed: {
      profiles: snapshot.profiles,
      works: [...snapshot.works, draftWork, moderatedWork],
      curation: [],
    },
    databasePath: ":memory:",
  });

  const publicWorks = await bundle.works.listPublicWorks();
  expect(publicWorks.find((w) => w.id === draftWork.id)).toBeUndefined();
  expect(publicWorks.find((w) => w.id === moderatedWork.id)).toBeUndefined();
  expect(publicWorks.find((w) => w.id === seedWorkId)).toBeDefined();

  const allForAdmin = await bundle.works.listAllForAdmin();
  expect(allForAdmin.find((w) => w.id === draftWork.id)).toBeDefined();
  expect(allForAdmin.find((w) => w.id === moderatedWork.id)).toBeDefined();
  expect(allForAdmin.find((w) => w.id === seedWorkId)).toBeDefined();

  bundle.close();
});

test("audit_log: record and listLatest are stable and ordered by created_at desc, id desc", async () => {
  const bundle = createSqliteCommunityRepositoryBundle({
    seed: { profiles: [], works: [], curation: [] },
    databasePath: ":memory:",
  });

  const a = await bundle.audit.record({
    actorAccountId: "account:x:photographer",
    actorEmail: "x@example.com",
    action: "curation.upsert",
    targetKind: "curation_slot",
    targetId: "home:works:work-1",
    note: "first",
    createdAt: "2026-04-19T01:00:00.000Z",
  });
  const b = await bundle.audit.record({
    actorAccountId: "account:x:photographer",
    actorEmail: "x@example.com",
    action: "work_moderation.hide",
    targetKind: "work",
    targetId: "work-2",
    createdAt: "2026-04-19T02:00:00.000Z",
  });
  const c = await bundle.audit.record({
    actorAccountId: "account:x:photographer",
    actorEmail: "x@example.com",
    action: "work_moderation.restore",
    targetKind: "work",
    targetId: "work-2",
    createdAt: "2026-04-19T02:00:00.000Z",
  });

  expect(a.id).toBeTruthy();
  expect(b.id).toBeTruthy();
  expect(c.id).toBeTruthy();
  expect(a.note).toBe("first");
  expect(b.note ?? null).toBeNull();

  const latest = await bundle.audit.listLatest(10);
  expect(latest.length).toBe(3);
  // Newer createdAt first; for equal createdAt the id desc tiebreak
  expect(latest[0].createdAt).toBe("2026-04-19T02:00:00.000Z");
  expect(latest[2].createdAt).toBe("2026-04-19T01:00:00.000Z");
  expect(latest[2].action).toBe("curation.upsert");

  const limited = await bundle.audit.listLatest(2);
  expect(limited.length).toBe(2);

  bundle.close();
});

test("curation upsertSlot / removeSlot / reorderSlot work end-to-end", async () => {
  const bundle = createSqliteCommunityRepositoryBundle({
    seed: { profiles: [], works: [], curation: [] },
    databasePath: ":memory:",
  });

  const slot: CuratedSlotRecord = {
    surface: "home",
    sectionKind: "works",
    targetType: "work",
    targetKey: "work-x",
    order: 1,
  };

  const inserted = await bundle.curation.upsertSlot(slot);
  expect(inserted).toEqual(slot);

  const updated = await bundle.curation.upsertSlot({ ...slot, order: 5 });
  expect(updated.order).toBe(5);

  const reordered = await bundle.curation.reorderSlot({
    surface: "home",
    sectionKind: "works",
    targetKey: "work-x",
    order: 9,
  });
  expect(reordered?.order).toBe(9);

  const reorderedMissing = await bundle.curation.reorderSlot({
    surface: "home",
    sectionKind: "works",
    targetKey: "missing",
    order: 1,
  });
  expect(reorderedMissing).toBeNull();

  await bundle.curation.removeSlot({
    surface: "home",
    sectionKind: "works",
    targetKey: "work-x",
  });
  await expect(bundle.curation.listSlotsBySurface("home")).resolves.toEqual([]);

  // Idempotent: removing again should not throw
  await expect(
    bundle.curation.removeSlot({
      surface: "home",
      sectionKind: "works",
      targetKey: "work-x",
    }),
  ).resolves.toBeUndefined();

  bundle.close();
});

test("withTransaction commits on success and rolls back on error", async () => {
  const bundle = createSqliteCommunityRepositoryBundle({
    seed: { profiles: [], works: [], curation: [] },
    databasePath: ":memory:",
  });

  // Success: both writes persist
  await bundle.withTransaction(async () => {
    await bundle.curation.upsertSlot({
      surface: "home",
      sectionKind: "works",
      targetType: "work",
      targetKey: "tx-success",
      order: 1,
    });
    await bundle.audit.record({
      actorAccountId: "a",
      actorEmail: "a@example.com",
      action: "curation.upsert",
      targetKind: "curation_slot",
      targetId: "home:works:tx-success",
    });
  });

  await expect(bundle.curation.listSlotsBySurface("home")).resolves.toHaveLength(
    1,
  );
  expect((await bundle.audit.listLatest(10)).length).toBe(1);

  // Failure: both writes rolled back
  await expect(
    bundle.withTransaction(async () => {
      await bundle.curation.upsertSlot({
        surface: "discover",
        sectionKind: "works",
        targetType: "work",
        targetKey: "tx-fail",
        order: 2,
      });
      await bundle.audit.record({
        actorAccountId: "a",
        actorEmail: "a@example.com",
        action: "curation.upsert",
        targetKind: "curation_slot",
        targetId: "discover:works:tx-fail",
      });
      throw new Error("boom");
    }),
  ).rejects.toThrow("boom");

  await expect(
    bundle.curation.listSlotsBySurface("discover"),
  ).resolves.toEqual([]);
  expect((await bundle.audit.listLatest(10)).length).toBe(1);

  bundle.close();
});
