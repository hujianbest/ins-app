import { expect, test } from "vitest";

import { createShowcaseSeedSnapshot } from "@/features/community/contracts";
import { resolveHomeDiscoverySections } from "@/features/home-discovery/resolver";
import {
  modelProfiles,
  photographerProfiles,
  works,
} from "@/features/showcase/sample-data";

import {
  isProfileFollowedByViewer,
  toggleProfileFollowForViewer,
} from "./follows";
import { createSqliteCommunityRepositoryBundle } from "@/features/community/sqlite";

test("authenticated members can follow and unfollow a creator, and discover feed consumes the same follow graph", async () => {
  const snapshot = createShowcaseSeedSnapshot(
    [...photographerProfiles, ...modelProfiles],
    works,
  );
  const bundle = createSqliteCommunityRepositoryBundle({
    databasePath: ":memory:",
    seed: {
      profiles: snapshot.profiles,
      works: snapshot.works,
      curation: [],
    },
  });

  await expect(
    isProfileFollowedByViewer(
      "demo-account:photographer",
      "model",
      "sample-model",
      bundle,
    ),
  ).resolves.toBe(false);

  await expect(
    toggleProfileFollowForViewer(
      "demo-account:photographer",
      "model",
      "sample-model",
      bundle,
    ),
  ).resolves.toMatchObject({
    following: true,
    profileId: "model:sample-model",
  });

  await expect(
    isProfileFollowedByViewer(
      "demo-account:photographer",
      "model",
      "sample-model",
      bundle,
    ),
  ).resolves.toBe(true);

  const sectionsAfterFollow = await resolveHomeDiscoverySections({
    surface: "discover",
    accountId: "demo-account:photographer",
    bundle,
  });

  expect(sectionsAfterFollow[2]).toMatchObject({
    kind: "following",
  });
  expect(sectionsAfterFollow[2].items.map((item) => item.id)).toContain(
    "soft-light-editorial",
  );

  await expect(
    toggleProfileFollowForViewer(
      "demo-account:photographer",
      "model",
      "sample-model",
      bundle,
    ),
  ).resolves.toMatchObject({
    following: false,
    profileId: "model:sample-model",
  });

  const sectionsAfterUnfollow = await resolveHomeDiscoverySections({
    surface: "discover",
    accountId: "demo-account:photographer",
    bundle,
  });

  expect(sectionsAfterUnfollow[2]).toMatchObject({
    kind: "following",
    items: [],
    emptyStateCopy: "关注后查看更新。",
  });

  bundle.close();
});
