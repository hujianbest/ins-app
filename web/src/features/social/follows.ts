import type { CommunityRole } from "@/features/community/types";
import { getDefaultCommunityRepositoryBundle } from "@/features/community/runtime";
import type { CommunityRepositoryBundle } from "@/features/community/types";

type ToggleProfileFollowResult = {
  profileId: string;
  following: boolean;
};

async function resolveTargetProfile(
  role: CommunityRole,
  slug: string,
  bundle: CommunityRepositoryBundle,
) {
  const profile = await bundle.profiles.getByRoleAndSlug(role, slug);

  if (!profile) {
    throw new Error(`Creator profile not found: ${role}/${slug}`);
  }

  return profile;
}

export async function isProfileFollowedByViewer(
  accountId: string | null,
  role: CommunityRole,
  slug: string,
  bundle: CommunityRepositoryBundle = getDefaultCommunityRepositoryBundle(),
) {
  if (!accountId) {
    return false;
  }

  const profile = await resolveTargetProfile(role, slug, bundle);

  return bundle.follows.isFollowing(accountId, profile.id);
}

export async function toggleProfileFollowForViewer(
  accountId: string,
  role: CommunityRole,
  slug: string,
  bundle: CommunityRepositoryBundle = getDefaultCommunityRepositoryBundle(),
): Promise<ToggleProfileFollowResult> {
  const profile = await resolveTargetProfile(role, slug, bundle);
  const currentlyFollowing = await bundle.follows.isFollowing(accountId, profile.id);

  if (currentlyFollowing) {
    await bundle.follows.unfollow(accountId, profile.id);
    return {
      profileId: profile.id,
      following: false,
    };
  }

  await bundle.follows.follow(accountId, profile.id);
  return {
    profileId: profile.id,
    following: true,
  };
}
