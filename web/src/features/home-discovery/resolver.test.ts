import { expect, test } from "vitest";

import { createShowcaseSeedSnapshot } from "@/features/community/contracts";
import { createInMemoryCommunityRepositoryBundle } from "@/features/community/test-support";
import {
  modelProfiles,
  opportunityPosts,
  photographerProfiles,
  works,
} from "@/features/showcase/sample-data";

import { resolveHomeDiscoverySections } from "./resolver";

test("discover resolver builds featured, latest, and following sections from the community bundle", async () => {
  const snapshot = createShowcaseSeedSnapshot(
    [...photographerProfiles, ...modelProfiles],
    works,
  );
  const bundle = createInMemoryCommunityRepositoryBundle({
    profiles: snapshot.profiles,
    works: snapshot.works,
    follows: [
      {
        followerAccountId: "demo-account:photographer",
        creatorProfileId: "model:sample-model",
        createdAt: "2026-04-09T12:00:00Z",
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
      {
        surface: "discover",
        sectionKind: "profiles",
        targetType: "profile",
        targetKey: "photographer:sample-photographer",
        order: 2,
      },
      {
        surface: "discover",
        sectionKind: "opportunities",
        targetType: "opportunity",
        targetKey: opportunityPosts[0].id,
        order: 3,
      },
    ],
  });

  const sections = await resolveHomeDiscoverySections({
    surface: "discover",
    accountId: "demo-account:photographer",
    bundle,
  });

  expect(sections.map((section) => section.kind)).toEqual([
    "featured",
    "latest",
    "following",
  ]);
  expect(sections[0].items.map((item) => item.id)).toEqual(
    expect.arrayContaining([
      "neon-portrait-study",
      "photographer:sample-photographer",
    ]),
  );
  expect(sections[1].items[0]?.id).toBe("neon-portrait-study");
  expect(sections[2].items.map((item) => item.id)).toContain("soft-light-editorial");
});

test("discover resolver keeps a stable following empty state for guests and no-follow members", async () => {
  const snapshot = createShowcaseSeedSnapshot(
    [...photographerProfiles, ...modelProfiles],
    works,
  );
  const bundle = createInMemoryCommunityRepositoryBundle({
    profiles: snapshot.profiles,
    works: snapshot.works,
    curation: [],
  });

  const guestSections = await resolveHomeDiscoverySections({
    surface: "discover",
    accountId: null,
    bundle,
  });
  const memberSections = await resolveHomeDiscoverySections({
    surface: "discover",
    accountId: "demo-account:model",
    bundle,
  });

  expect(guestSections[2]).toMatchObject({
    kind: "following",
    items: [],
    emptyStateCopy: "登录后查看关注更新。",
  });
  expect(memberSections[2]).toMatchObject({
    kind: "following",
    items: [],
    emptyStateCopy: "关注后查看更新。",
  });
});

test("home resolver keeps collaboration as teaser instead of a primary opportunity section", async () => {
  const snapshot = createShowcaseSeedSnapshot(
    [...photographerProfiles, ...modelProfiles],
    works,
  );
  const bundle = createInMemoryCommunityRepositoryBundle({
    profiles: snapshot.profiles,
    works: snapshot.works,
    curation: [],
  });

  const sections = await resolveHomeDiscoverySections({
    surface: "home",
    accountId: null,
    bundle,
  });

  expect(sections.map((section) => section.kind)).toEqual([
    "featured",
    "latest",
  ]);
});
