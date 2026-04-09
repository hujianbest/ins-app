import { expect, test, vi } from "vitest";

test("resolveHomeDiscoverySections follows the configured section order for the discover surface", async () => {
  vi.resetModules();

  vi.doMock("./config", () => ({
    homeSurfaceSectionOrder: ["latest", "featured"],
    discoverSurfaceSectionOrder: ["following", "featured", "latest"],
    homeDiscoveryFeaturedSlots: [],
  }));

  const { resolveHomeDiscoverySections } = await import("./resolver");
  const { createInMemoryCommunityRepositoryBundle } = await import(
    "@/features/community/test-support"
  );

  const sections = await resolveHomeDiscoverySections({
    surface: "discover",
    accountId: null,
    bundle: createInMemoryCommunityRepositoryBundle({
      profiles: [],
      works: [],
      curation: [],
    }),
  });

  expect(sections.map((section) => section.kind)).toEqual([
    "following",
    "featured",
    "latest",
  ]);

  vi.doUnmock("./config");
  vi.resetModules();
});
