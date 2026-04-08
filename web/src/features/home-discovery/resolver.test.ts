import { expect, test } from "vitest";

import {
  modelProfiles,
  opportunityPosts,
  photographerProfiles,
  works,
} from "@/features/showcase/sample-data";

import type {
  OpportunityDiscoverySlotConfig,
  ProfileDiscoverySlotConfig,
  WorkDiscoverySlotConfig,
} from "./types";

import {
  resolveOpportunityDiscoverySection,
  resolveProfileDiscoverySection,
  resolveWorkDiscoverySection,
} from "./resolver";

test("work resolver keeps featured items first and fills with latest fallback content", () => {
  const config: WorkDiscoverySlotConfig = {
    kind: "works",
    featuredIds: ["studio-motion-casting"],
  };

  const section = resolveWorkDiscoverySection(config, works);

  expect(section.kind).toBe("works");
  expect(section.items).toHaveLength(3);
  expect(section.items.map((item) => item.id)).toEqual([
    "studio-motion-casting",
    "neon-portrait-study",
    "soft-light-editorial",
  ]);
});

test("profile resolver skips invalid featured entries and avoids duplicate fallback items", () => {
  const config: ProfileDiscoverySlotConfig = {
    kind: "profiles",
    featuredProfiles: [
      { role: "photographer", slug: "sample-photographer" },
      { role: "photographer", slug: "missing-profile" },
    ],
  };

  const section = resolveProfileDiscoverySection(config, [
    ...photographerProfiles,
    ...modelProfiles,
  ]);

  expect(section.items.map((item) => item.id)).toEqual([
    "photographer:sample-photographer",
    "model:sample-model",
  ]);
});

test("opportunity resolver returns an empty section when no public opportunities exist", () => {
  const config: OpportunityDiscoverySlotConfig = {
    kind: "opportunities",
    featuredIds: ["missing-opportunity"],
  };

  const section = resolveOpportunityDiscoverySection(config, []);

  expect(section.kind).toBe("opportunities");
  expect(section.items).toEqual([]);
  expect(section.title).toBe("精选诉求");
});

test("opportunity resolver uses the newest available update or publish time for fallback sorting", () => {
  const config: OpportunityDiscoverySlotConfig = {
    kind: "opportunities",
    featuredIds: [],
  };

  const section = resolveOpportunityDiscoverySection(config, opportunityPosts);

  expect(section.items.map((item) => item.id)).toEqual([
    "shanghai-editorial-casting",
    "hangzhou-beauty-collab",
  ]);
});
