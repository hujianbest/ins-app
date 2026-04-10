import { expect, test } from "vitest";

import {
  getProfileHeroAssetRef,
  modelProfiles,
  opportunityPosts,
  photographerProfiles,
  resolveSeedVisualAsset,
  seedContentDisclosure,
  seedContentSourceManifest,
  works,
} from "./sample-data";

test("seed content disclosure keeps source and usage guidance visible", () => {
  expect(seedContentDisclosure).toMatch(/本地化/);
  expect(seedContentDisclosure).toMatch(/虚构演示文案/);
  expect(seedContentDisclosure).toMatch(/不再依赖第三方图片外链/);
});

test("all referenced seed assets resolve to local manifest entries", () => {
  const referencedAssets = [
    ...photographerProfiles.map((profile) => profile.heroAsset),
    ...modelProfiles.map((profile) => profile.heroAsset),
    ...photographerProfiles.flatMap((profile) =>
      profile.showcaseItems.map((item) => item.coverAsset),
    ),
    ...modelProfiles.flatMap((profile) =>
      profile.showcaseItems.map((item) => item.coverAsset),
    ),
    ...works.map((work) => work.coverAsset),
    ...opportunityPosts.map((post) => post.coverAsset),
  ].filter((value): value is string => Boolean(value));

  expect(referencedAssets.length).toBeGreaterThan(0);

  for (const assetRef of referencedAssets) {
    expect(resolveSeedVisualAsset(assetRef)).toMatchObject({
      id: assetRef,
      imageUrl: expect.stringMatching(/^\/seed\//),
      licenseLabel: "Pexels License (local mirror)",
    });
  }
});

test("profile hero asset lookup stays aligned with the seeded public profiles", () => {
  expect(getProfileHeroAssetRef("photographer", "sample-photographer")).toBe(
    photographerProfiles[0].heroAsset,
  );
  expect(getProfileHeroAssetRef("model", "sample-model")).toBe(
    modelProfiles[0].heroAsset,
  );
});

test("seed source manifest preserves a medium local image pack with traceable source pages", () => {
  expect(seedContentSourceManifest).toHaveLength(21);
  expect(
    seedContentSourceManifest.every((asset) =>
      asset.imageUrl.startsWith("/seed/"),
    ),
  ).toBe(true);
  expect(
    seedContentSourceManifest.every((asset) =>
      asset.sourceUrl.includes("pexels.com/photo/"),
    ),
  ).toBe(true);
});
