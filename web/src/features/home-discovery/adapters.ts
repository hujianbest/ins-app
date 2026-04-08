import type {
  PublicOpportunityPost,
  PublicProfile,
  PublicWork,
} from "@/features/showcase/types";

import type { HomeDiscoveryCard } from "./types";

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
    meta: `${work.ownerName} · ${work.ownerRole}`,
  };
}

export function adaptProfileToHomeDiscoveryCard(profile: PublicProfile): HomeDiscoveryCard {
  return {
    id: `${profile.role}:${profile.slug}`,
    href: getProfileHref(profile),
    badge: profile.role === "photographer" ? "Photographer" : "Model",
    title: profile.name,
    description: profile.tagline,
    meta: profile.city,
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
  };
}
