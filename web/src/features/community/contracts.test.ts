import { expect, test } from "vitest";

import {
  modelProfiles,
  photographerProfiles,
  works,
} from "@/features/showcase/sample-data";

import {
  createShowcaseSeedSnapshot,
  getPublicWorkRecords,
  isCommunitySectionKind,
  isCommunitySurface,
  isCommunityTargetType,
} from "./contracts";
import { createInMemoryCommunityRepositoryBundle } from "./test-support";
import type { CommunityWorkRecord } from "./types";

test("createShowcaseSeedSnapshot derives stable creator ids and a minimal work contract from showcase data", () => {
  const snapshot = createShowcaseSeedSnapshot(
    [...photographerProfiles, ...modelProfiles],
    works,
  );

  const photographer = snapshot.profiles.find(
    (profile) => profile.slug === "sample-photographer",
  );

  expect(photographer).toMatchObject({
    id: "photographer:sample-photographer",
    role: "photographer",
    slug: "sample-photographer",
    name: "Avery Vale",
  });

  const neonWork = snapshot.works.find(
    (work) => work.id === "neon-portrait-study",
  );

  expect(neonWork).toMatchObject({
    id: "neon-portrait-study",
    ownerProfileId: "photographer:sample-photographer",
    ownerRole: "photographer",
    ownerSlug: "sample-photographer",
    ownerName: "Avery Vale",
    status: "published",
    title: "霓虹人像研究",
    category: "编辑人像",
    description:
      "一组以青色高光与浓重阴影平衡的低调人像，用来建立强烈的合作第一印象。",
    detailNote: "这组作品适合用于艺术指导沟通，重点体现强控光能力与一眼可见的视觉自信。",
    publishedAt: "2026-04-05T09:00:00Z",
    updatedAt: "2026-04-05T18:00:00Z",
  });
  expect(neonWork?.coverAsset).toBe("work:neon-portrait-study:cover");
});

test("getPublicWorkRecords excludes draft works from public reads", () => {
  const snapshot = createShowcaseSeedSnapshot(
    [...photographerProfiles, ...modelProfiles],
    works,
  );

  const draftWork: CommunityWorkRecord = {
    ...snapshot.works[1],
    id: "draft-work",
    status: "draft",
    publishedAt: undefined,
  };

  const publicWorks = getPublicWorkRecords([
    draftWork,
    snapshot.works[0],
    snapshot.works[2],
  ]);

  expect(publicWorks.map((work) => work.id)).toEqual([
    "neon-portrait-study",
    "studio-motion-casting",
  ]);
});

test("isCommunitySurface only accepts home and discover", () => {
  expect(isCommunitySurface("home")).toBe(true);
  expect(isCommunitySurface("discover")).toBe(true);
  expect(isCommunitySurface("profile")).toBe(false);
});

test("isCommunitySectionKind keeps discovery section names aligned with existing home-discovery config", () => {
  expect(isCommunitySectionKind("works")).toBe(true);
  expect(isCommunitySectionKind("profiles")).toBe(true);
  expect(isCommunitySectionKind("opportunities")).toBe(true);
  expect(isCommunitySectionKind("work")).toBe(false);
});

test("isCommunityTargetType uses singular entity names instead of section names", () => {
  expect(isCommunityTargetType("work")).toBe(true);
  expect(isCommunityTargetType("profile")).toBe(true);
  expect(isCommunityTargetType("opportunity")).toBe(true);
  expect(isCommunityTargetType("works")).toBe(false);
});

test("community repository bundle contract supports profile, work, follow, comment, and curation queries", async () => {
  const snapshot = createShowcaseSeedSnapshot(
    [...photographerProfiles, ...modelProfiles],
    works,
  );
  const photographerProfileId = "photographer:sample-photographer";
  const bundle = createInMemoryCommunityRepositoryBundle({
    profiles: snapshot.profiles,
    works: [
      ...snapshot.works,
      {
        ...snapshot.works[1],
        id: "draft-work",
        status: "draft",
        publishedAt: undefined,
      },
    ],
    follows: [
      {
        followerAccountId: "viewer-1",
        creatorProfileId: "photographer:sample-photographer",
        createdAt: "2026-04-08T10:00:00Z",
      },
    ],
    comments: [
      {
        id: "comment-1",
        workId: "neon-portrait-study",
        authorAccountId: "viewer-1",
        body: "控光和色彩非常稳。",
        createdAt: "2026-04-08T10:05:00Z",
      },
    ],
    curation: [
      {
        surface: "discover",
        sectionKind: "works",
        targetType: "work",
        targetKey: "neon-portrait-study",
        order: 1,
      },
    ],
  });

  await expect(
    bundle.profiles.getByRoleAndSlug("photographer", "sample-photographer"),
  ).resolves.toMatchObject({
    id: photographerProfileId,
    role: "photographer",
  });

  const photographerWorks = await bundle.works.listByOwnerProfileId(
    photographerProfileId,
  );
  expect(photographerWorks.map((work) => work.id)).toContain("draft-work");
  expect(photographerWorks).toHaveLength(
    snapshot.works.filter((work) => work.ownerProfileId === photographerProfileId)
      .length + 1,
  );

  const publicWorks = await bundle.works.listPublicWorks();
  expect(publicWorks).toHaveLength(snapshot.works.length);
  expect(publicWorks.map((work) => work.id)).not.toContain("draft-work");

  await expect(
    bundle.follows.isFollowing(
      "viewer-1",
      photographerProfileId,
    ),
  ).resolves.toBe(true);
  await expect(
    bundle.comments.listByWorkId("neon-portrait-study"),
  ).resolves.toMatchObject([
    {
      id: "comment-1",
      authorAccountId: "viewer-1",
    },
  ]);
  await expect(bundle.curation.listSlotsBySurface("discover")).resolves.toEqual([
    {
      surface: "discover",
      sectionKind: "works",
      targetType: "work",
      targetKey: "neon-portrait-study",
      order: 1,
    },
  ]);
});
