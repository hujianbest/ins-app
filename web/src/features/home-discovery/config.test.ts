import { expect, test } from "vitest";

import { modelProfiles, opportunityPosts, photographerProfiles, works } from "@/features/showcase/sample-data";

import {
  homeDiscoveryFeaturedSlots,
  homeDiscoverySectionOrder,
  profileDiscoverySlotConfig,
} from "./config";

test("home discovery config exposes all three homepage discovery sections", () => {
  expect(homeDiscoverySectionOrder).toEqual(["works", "profiles", "opportunities"]);
  expect(homeDiscoveryFeaturedSlots).toHaveLength(3);
});

test("profile discovery config requires role and slug for featured profiles", () => {
  expect(profileDiscoverySlotConfig.kind).toBe("profiles");
  expect(profileDiscoverySlotConfig.featuredProfiles[0]).toEqual({
    role: "photographer",
    slug: "sample-photographer",
  });
  expect(profileDiscoverySlotConfig.featuredProfiles[1]).toEqual({
    role: "model",
    slug: "sample-model",
  });
});

test("homepage discovery sample data exposes a stable published time key", () => {
  expect(photographerProfiles[0].publishedAt).toMatch(/^2026-/);
  expect(modelProfiles[0].publishedAt).toMatch(/^2026-/);
  expect(works[0].publishedAt).toMatch(/^2026-/);
  expect(opportunityPosts[0].publishedAt).toMatch(/^2026-/);
});
