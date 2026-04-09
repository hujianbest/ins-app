import { type AuthRole } from "@/features/auth/types";

import { getDefaultSqliteCommunityRepositoryBundle } from "./sqlite";
import type {
  CommunityRepositoryBundle,
  CreatorProfileRecord,
} from "./types";

export type StudioProfileEditorModel = Pick<
  CreatorProfileRecord,
  "id" | "role" | "slug" | "name" | "city" | "tagline" | "bio"
>;

export type StudioProfileEditorInput = Pick<
  CreatorProfileRecord,
  "name" | "city" | "tagline" | "bio"
>;

function normalizeStudioProfileInput(
  input: StudioProfileEditorInput,
): StudioProfileEditorInput {
  return {
    name: input.name.trim(),
    city: input.city.trim(),
    tagline: input.tagline.trim(),
    bio: input.bio.trim(),
  };
}

async function resolveEditableProfileForRole(
  role: AuthRole,
  bundle: CommunityRepositoryBundle,
) {
  const profiles = await bundle.profiles.listPublicProfiles();
  const roleProfiles = profiles.filter((profile) => profile.role === role);

  if (roleProfiles.length !== 1) {
    throw new Error(`Unable to resolve creator profile for role: ${role}`);
  }

  return roleProfiles[0];
}

export async function getStudioProfileEditorModel(
  role: AuthRole,
  bundle: CommunityRepositoryBundle = getDefaultSqliteCommunityRepositoryBundle(),
): Promise<StudioProfileEditorModel> {
  const profile = await resolveEditableProfileForRole(role, bundle);

  return {
    id: profile.id,
    role: profile.role,
    slug: profile.slug,
    name: profile.name,
    city: profile.city,
    tagline: profile.tagline,
    bio: profile.bio,
  };
}

export async function saveCreatorProfileForRole(
  role: AuthRole,
  input: StudioProfileEditorInput,
  bundle: CommunityRepositoryBundle = getDefaultSqliteCommunityRepositoryBundle(),
) {
  const targetProfile = await resolveEditableProfileForRole(role, bundle);
  const normalizedInput = normalizeStudioProfileInput(input);

  return bundle.profiles.updateById(targetProfile.id, {
    ...normalizedInput,
    updatedAt: new Date().toISOString(),
  });
}
