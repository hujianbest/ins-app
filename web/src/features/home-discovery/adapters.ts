import type {
  PublicOpportunityPost,
  PublicProfile,
  PublicWork,
} from "@/features/showcase/types";
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

export function adaptWorkToHomeDiscoveryCard(work: PublicWork): HomeDiscoveryCard {
  return {
    id: work.id,
    href: `/works/${work.id}`,
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
    badge: getRoleLabel(profile.role),
    title: profile.name,
    description: profile.tagline,
    meta: profile.city,
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
    badge: opportunityPost.city,
    title: opportunityPost.title,
    description: opportunityPost.summary,
    meta: opportunityPost.schedule,
    assetRef: opportunityPost.coverAsset,
  };
}
