import { expect, test } from "vitest";

import {
  modelProfiles,
  opportunityPosts,
  photographerProfiles,
  works,
} from "@/features/showcase/sample-data";

import {
  adaptOpportunityPostToHomeDiscoveryCard,
  adaptProfileToHomeDiscoveryCard,
  adaptWorkToHomeDiscoveryCard,
} from "./adapters";

test("work adapter maps a public work into a homepage discovery card", () => {
  const card = adaptWorkToHomeDiscoveryCard(works[0]);

  expect(card).toMatchObject({
    id: works[0].id,
    href: `/works/${works[0].id}`,
    badge: works[0].category,
    title: works[0].title,
    description: works[0].description,
  });
});

test("profile adapter maps photographer and model profiles to distinct public routes", () => {
  const photographerCard = adaptProfileToHomeDiscoveryCard(photographerProfiles[0]);
  const modelCard = adaptProfileToHomeDiscoveryCard(modelProfiles[0]);

  expect(photographerCard.href).toBe(`/photographers/${photographerProfiles[0].slug}`);
  expect(modelCard.href).toBe(`/models/${modelProfiles[0].slug}`);
  expect(photographerCard.title).toBe(photographerProfiles[0].name);
  expect(modelCard.title).toBe(modelProfiles[0].name);
  expect(photographerCard.badge).toBe("摄影师");
  expect(modelCard.badge).toBe("模特");
});

test("opportunity adapter maps a public opportunity into a detail-first discovery card", () => {
  const card = adaptOpportunityPostToHomeDiscoveryCard(opportunityPosts[0]);

  expect(card).toMatchObject({
    id: opportunityPosts[0].id,
    href: `/opportunities/${opportunityPosts[0].id}`,
    title: opportunityPosts[0].title,
    description: opportunityPosts[0].summary,
  });
});
