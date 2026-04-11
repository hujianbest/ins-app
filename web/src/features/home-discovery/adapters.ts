import type {
  PublicOpportunityPost,
  PublicProfile,
  PublicWork,
} from "@/features/showcase/types";
import {
  getOpportunityOwnerLabel,
  getOpportunityVisualDescription,
} from "@/features/opportunities/opportunity-card";
import { getProfileHeroAssetRef } from "@/features/showcase/sample-data";

import type { HomeDiscoveryCard } from "./types";

function getRoleLabel(role: PublicProfile["role"] | PublicWork["ownerRole"] | PublicOpportunityPost["ownerRole"]) {
  return role === "photographer" ? "摄影师" : "模特";
}

function getProfileHref(profile: PublicProfile) {
  return profile.role === "photographer"
    ? `/photographers/${profile.slug}`
    : `/models/${profile.slug}`;
}

function buildDiscoveryMeta(city: string, shootingFocus: string) {
  return [city, shootingFocus].filter(Boolean).join(" · ");
}

export function adaptWorkToHomeDiscoveryCard(work: PublicWork): HomeDiscoveryCard {
  return {
    id: work.id,
    href: `/works/${work.id}`,
    contentKind: "work",
    badge: work.category,
    title: work.title,
    description: work.description,
    meta: `${work.ownerName} · ${getRoleLabel(work.ownerRole)}`,
    assetRef: work.coverAsset,
  };
}

export function adaptProfileToHomeDiscoveryCard(profile: PublicProfile): HomeDiscoveryCard {
  return {
    id: `${profile.role}:${profile.slug}`,
    href: getProfileHref(profile),
    contentKind: "profile",
    badge: getRoleLabel(profile.role),
    title: profile.name,
    description: profile.discoveryContext || profile.tagline,
    meta: buildDiscoveryMeta(profile.city, profile.shootingFocus),
    assetRef:
      profile.heroAsset ??
      getProfileHeroAssetRef(profile.role, profile.slug),
  };
}

export function adaptOpportunityPostToHomeDiscoveryCard(
  opportunityPost: PublicOpportunityPost
): HomeDiscoveryCard {
  return {
    id: opportunityPost.id,
    href: `/opportunities/${opportunityPost.id}`,
    contentKind: "opportunity",
    badge: getOpportunityOwnerLabel(opportunityPost.ownerRole),
    title: opportunityPost.title,
    description: opportunityPost.summary,
    meta: opportunityPost.ownerName,
    assetRef: opportunityPost.coverAsset,
    visualDescription: getOpportunityVisualDescription(
      opportunityPost.city,
      opportunityPost.schedule,
    ),
  };
}
