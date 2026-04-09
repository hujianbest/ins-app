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
        targetKey: "photographer:sample-photographer",
        order: 1,
      },
      {
        surface: "discover",
        sectionKind: "opportunities",
        targetType: "opportunity",
        targetKey: opportunityPosts[0]?.id ?? "",
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
