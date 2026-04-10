import { getDefaultCommunityRepositoryBundle } from "@/features/community/runtime";
import type {
  CommunityRepositoryBundle,
  CommunityWorkRecord,
  CreatorProfileRecord,
} from "@/features/community/types";
import {
  getOpportunityOwnerLabel,
  getOpportunityVisualDescription,
} from "@/features/opportunities/opportunity-card";
import {
  getProfileHeroAssetRef,
  opportunityPosts,
} from "@/features/showcase/sample-data";

export type SearchResultItem = {
  id: string;
  href: string;
  kind: "work" | "profile" | "opportunity";
  badge: string;
  title: string;
  description: string;
  meta: string;
  assetRef?: string;
  visualDescription?: string;
};

export type SearchResults = {
  query: string;
  works: SearchResultItem[];
  profiles: SearchResultItem[];
  opportunities: SearchResultItem[];
  total: number;
};

function normalizeQuery(query: string) {
  return query.trim().toLowerCase();
}

function includesQuery(query: string, values: Array<string | undefined>) {
  return values.some((value) => value?.toLowerCase().includes(query));
}

function getProfileHref(profile: CreatorProfileRecord) {
  return profile.role === "photographer"
    ? `/photographers/${profile.slug}`
    : `/models/${profile.slug}`;
}

function toProfileResult(profile: CreatorProfileRecord): SearchResultItem {
  return {
    id: profile.id,
    href: getProfileHref(profile),
    kind: "profile",
    badge: profile.role === "photographer" ? "摄影师" : "模特",
    title: profile.name,
    description: profile.tagline,
    meta: profile.city,
    assetRef: getProfileHeroAssetRef(profile.role, profile.slug),
  };
}

function toWorkResult(work: CommunityWorkRecord): SearchResultItem {
  return {
    id: work.id,
    href: `/works/${work.id}`,
    kind: "work",
    badge: work.category,
    title: work.title,
    description: work.description,
    meta: `${work.ownerName} · ${work.ownerRole === "photographer" ? "摄影师" : "模特"}`,
    assetRef: work.coverAsset,
  };
}

export async function searchCatalog(
  query: string,
  bundle: CommunityRepositoryBundle = getDefaultCommunityRepositoryBundle(),
): Promise<SearchResults> {
  const normalizedQuery = normalizeQuery(query);

  if (!normalizedQuery) {
    return {
      query: query.trim(),
      works: [],
      profiles: [],
      opportunities: [],
      total: 0,
    };
  }

  const [profiles, works] = await Promise.all([
    bundle.profiles.listPublicProfiles(),
    bundle.works.listPublicWorks(),
  ]);

  const matchedProfiles = profiles
    .filter((profile) =>
      includesQuery(normalizedQuery, [
        profile.name,
        profile.city,
        profile.tagline,
        profile.bio,
      ]),
    )
    .map(toProfileResult);

  const matchedWorks = works
    .filter((work) =>
      includesQuery(normalizedQuery, [
        work.title,
        work.category,
        work.description,
        work.detailNote,
        work.ownerName,
      ]),
    )
    .map(toWorkResult);

  const matchedOpportunities = opportunityPosts
    .filter((post) =>
      includesQuery(normalizedQuery, [
        post.title,
        post.city,
        post.schedule,
        post.summary,
        post.ownerName,
      ]),
    )
    .map<SearchResultItem>((post) => ({
      id: post.id,
      href: `/opportunities/${post.id}`,
      kind: "opportunity",
      badge: getOpportunityOwnerLabel(post.ownerRole),
      title: post.title,
      description: post.summary,
      meta: post.ownerName,
      assetRef: post.coverAsset,
      visualDescription: getOpportunityVisualDescription(
        post.city,
        post.schedule,
      ),
    }));

  return {
    query: query.trim(),
    works: matchedWorks,
    profiles: matchedProfiles,
    opportunities: matchedOpportunities,
    total:
      matchedWorks.length +
      matchedProfiles.length +
      matchedOpportunities.length,
  };
}
