import { expect, test } from "vitest";

import { modelProfiles, opportunityPosts, photographerProfiles, works } from "@/features/showcase/sample-data";

import {
  discoverSurfaceSectionOrder,
  homeDiscoveryFeaturedSlots,
  homeSurfaceSectionOrder,
  opportunitiesDiscoverySlotConfig,
  profileDiscoverySlotConfig,
  worksDiscoverySlotConfig,
} from "./config";

test("home discovery config exposes separate section orders for home and discover surfaces", () => {
  expect(homeSurfaceSectionOrder).toEqual(["featured", "latest"]);
  expect(discoverSurfaceSectionOrder).toEqual(["featured", "latest", "following"]);
  expect(homeDiscoveryFeaturedSlots).toHaveLength(3);
});

test("profile discovery config requires role and slug for featured profiles", () => {
  expect(profileDiscoverySlotConfig.kind).toBe("profiles");
  expect(profileDiscoverySlotConfig.featuredProfiles[0]).toEqual({
    role: "photographer",
    slug: "elio-ren",
  });
  expect(profileDiscoverySlotConfig.featuredProfiles[1]).toEqual({
    role: "model",
    slug: "sora-lin",
  });
});

test("work discovery config balances featured work curation against profile and opportunity slots", () => {
  expect(worksDiscoverySlotConfig.featuredIds).toEqual([
    "neon-portrait-study",
    "luminous-closeup-dossier",
  ]);
});

test("opportunity discovery config highlights a photographer brief and a model collaboration", () => {
  expect(opportunitiesDiscoverySlotConfig.featuredIds).toEqual([
    "shenzhen-monochrome-campaign",
    "hangzhou-beauty-collab",
  ]);
});

test("homepage discovery sample data exposes a stable published time key", () => {
  expect(photographerProfiles[0].publishedAt).toMatch(/^2026-/);
  expect(modelProfiles[0].publishedAt).toMatch(/^2026-/);
  expect(works[0].publishedAt).toMatch(/^2026-/);
  expect(opportunityPosts[0].publishedAt).toMatch(/^2026-/);
});
