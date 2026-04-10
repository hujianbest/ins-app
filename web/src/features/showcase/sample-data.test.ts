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
  expect(seedContentDisclosure).toMatch(/Pexels/i);
  expect(seedContentDisclosure).toMatch(/虚构演示内容/);
});

test("all referenced seed assets resolve to licensed manifest entries", () => {
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
      licenseLabel: "Pexels License",
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

test("seed source manifest preserves traceable source pages", () => {
  expect(seedContentSourceManifest).toHaveLength(6);
  expect(seedContentSourceManifest.every((asset) => asset.sourceUrl.includes("pexels.com/photo/"))).toBe(
    true,
  );
});
