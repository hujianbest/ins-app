import { expect, test, vi } from "vitest";

test("resolveHomeDiscoverySections follows the configured section order", async () => {
  vi.resetModules();

  vi.doMock("./config", () => ({
    homeDiscoverySectionOrder: ["profiles", "works", "opportunities"],
    worksDiscoverySlotConfig: {
      kind: "works",
      featuredIds: [],
    },
    profileDiscoverySlotConfig: {
      kind: "profiles",
      featuredProfiles: [],
    },
    opportunitiesDiscoverySlotConfig: {
      kind: "opportunities",
      featuredIds: [],
    },
  }));

  const { resolveHomeDiscoverySections } = await import("./resolver");

  expect(resolveHomeDiscoverySections().map((section) => section.kind)).toEqual([
    "profiles",
    "works",
    "opportunities",
  ]);

  vi.doUnmock("./config");
  vi.resetModules();
});
