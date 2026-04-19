import { expect, test } from "vitest";

import {
  modelProfiles,
  photographerProfiles,
  works,
} from "@/features/showcase/sample-data";

import { createShowcaseSeedSnapshot } from "./contracts";
import { getPublicProfilePageModel, getPublicWorkPageModel, listPublicProfilePageParams, listPublicWorkPageParams } from "./public-read-model";
import { createSqliteCommunityRepositoryBundle } from "./sqlite";
import type { CommunityWorkRecord } from "./types";

test("public profile page model derives showcase items from published repository works only", async () => {
  const snapshot = createShowcaseSeedSnapshot(
    [...photographerProfiles, ...modelProfiles],
    works,
  );
  const draftWork: CommunityWorkRecord = {
    ...snapshot.works[0],
    id: "draft-work",
    title: "仅草稿作品",
    status: "draft",
    publishedAt: undefined,
  };
  const bundle = createSqliteCommunityRepositoryBundle({
    databasePath: ":memory:",
    seed: {
      profiles: snapshot.profiles,
      works: [draftWork, ...snapshot.works],
      curation: [],
    },
  });

  const profile = await getPublicProfilePageModel(
    "photographer",
    "sample-photographer",
    bundle,
  );

  expect(profile).toMatchObject({
    slug: "sample-photographer",
    name: "Avery Vale",
    shootingFocus: "夜色编辑人像与品牌情绪片",
    discoveryContext: "希望被上海品牌团队、长期合作模特与 editorial collaborator 反复看到",
    externalHandoffUrl: "https://portfolio.example.com/avery",
    sectionTitle: "精选画面",
    heroAsset: "seed:avery-hero",
  });
  expect(profile?.showcaseItems.map((item) => item.workId)).not.toContain(
    "draft-work",
  );
  expect(profile?.showcaseItems[0]).toMatchObject({
    workId: "neon-portrait-study",
    title: "霓虹人像研究",
    subtitle: "编辑人像",
    coverAsset: "seed:avery-hero",
  });

  bundle.close();
});

test("public work page model and static params expose published works only", async () => {
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
  const bundle = createSqliteCommunityRepositoryBundle({
    databasePath: ":memory:",
    seed: {
      profiles: snapshot.profiles,
      works: [...snapshot.works, draftWork],
      curation: [],
    },
  });

  await expect(getPublicWorkPageModel("draft-work", bundle)).resolves.toBeNull();
  await expect(getPublicWorkPageModel("neon-portrait-study", bundle)).resolves.toMatchObject(
    {
      id: "neon-portrait-study",
      coverAsset: "seed:avery-hero",
    },
  );
  await expect(listPublicWorkPageParams(bundle)).resolves.not.toContainEqual({
    workId: "draft-work",
  });
  await expect(
    listPublicProfilePageParams("model", bundle),
  ).resolves.toContainEqual({ slug: "sample-model" });

  bundle.close();
});

test("public read paths hide moderated works the same way as drafts (Phase 2 §3.2 ADR-5)", async () => {
  const snapshot = createShowcaseSeedSnapshot(
    [...photographerProfiles, ...modelProfiles],
    works,
  );
  const moderatedWork: CommunityWorkRecord = {
    ...snapshot.works[0],
    id: "moderated-work",
    status: "moderated",
  };
  const bundle = createSqliteCommunityRepositoryBundle({
    databasePath: ":memory:",
    seed: {
      profiles: snapshot.profiles,
      works: [...snapshot.works, moderatedWork],
      curation: [],
    },
  });

  // moderated work cannot be fetched as a public work
  await expect(getPublicWorkPageModel(moderatedWork.id, bundle)).resolves.toBeNull();

  // moderated work id must not appear in the static params list
  await expect(listPublicWorkPageParams(bundle)).resolves.not.toContainEqual({
    workId: moderatedWork.id,
  });

  // owner profile showcase must not surface moderated works
  const profile = await getPublicProfilePageModel(
    moderatedWork.ownerRole,
    moderatedWork.ownerSlug,
    bundle,
  );
  expect(profile?.showcaseItems.map((item) => item.workId)).not.toContain(
    moderatedWork.id,
  );

  bundle.close();
});
