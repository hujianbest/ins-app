import { type AuthRole } from "@/features/auth/types";
import { getStudioProfileSlugForRole } from "@/features/showcase/sample-data";

import { getDefaultCommunityRepositoryBundle } from "./runtime";
import type {
  CommunityRepositoryBundle,
  CreatorProfileRecord,
} from "./types";

export type StudioProfileEditorModel = Pick<
  CreatorProfileRecord,
  | "id"
  | "role"
  | "slug"
  | "name"
  | "city"
  | "shootingFocus"
  | "discoveryContext"
  | "tagline"
  | "bio"
  | "externalHandoffUrl"
>;

export type StudioProfileEditorInput = Pick<
  CreatorProfileRecord,
  | "name"
  | "city"
  | "shootingFocus"
  | "discoveryContext"
  | "tagline"
  | "bio"
  | "externalHandoffUrl"
>;

function normalizeExternalHandoffUrl(value: string) {
  const normalizedValue = value.trim();

  if (!normalizedValue) {
    return "";
  }

  let parsedUrl: URL;

  try {
    parsedUrl = new URL(normalizedValue);
  } catch {
    throw new Error("Invalid external handoff url");
  }

  if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
    throw new Error("Invalid external handoff url");
  }

  return normalizedValue;
}

function normalizeStudioProfileInput(
  input: StudioProfileEditorInput,
): StudioProfileEditorInput {
  return {
    name: input.name.trim(),
    city: input.city.trim(),
    shootingFocus: input.shootingFocus.trim(),
    discoveryContext: input.discoveryContext.trim(),
    tagline: input.tagline.trim(),
    bio: input.bio.trim(),
    externalHandoffUrl: normalizeExternalHandoffUrl(input.externalHandoffUrl),
  };
}

async function resolveEditableProfileForRole(
  role: AuthRole,
  bundle: CommunityRepositoryBundle,
) {
  const preferredProfile = await bundle.profiles.getByRoleAndSlug(
    role,
    getStudioProfileSlugForRole(role),
  );

  if (preferredProfile) {
    return preferredProfile;
  }

  const profiles = await bundle.profiles.listPublicProfiles();
  const roleProfiles = profiles.filter((profile) => profile.role === role);

  if (roleProfiles.length !== 1) {
    throw new Error(`Unable to resolve creator profile for role: ${role}`);
  }

  return roleProfiles[0];
}

export async function getStudioProfileEditorModel(
  role: AuthRole,
  bundle: CommunityRepositoryBundle = getDefaultCommunityRepositoryBundle(),
): Promise<StudioProfileEditorModel> {
  const profile = await resolveEditableProfileForRole(role, bundle);

  return {
    id: profile.id,
    role: profile.role,
    slug: profile.slug,
    name: profile.name,
    city: profile.city,
    shootingFocus: profile.shootingFocus,
    discoveryContext: profile.discoveryContext,
    tagline: profile.tagline,
    bio: profile.bio,
    externalHandoffUrl: profile.externalHandoffUrl,
  };
}

export async function saveCreatorProfileForRole(
  role: AuthRole,
  input: StudioProfileEditorInput,
  bundle: CommunityRepositoryBundle = getDefaultCommunityRepositoryBundle(),
) {
  const targetProfile = await resolveEditableProfileForRole(role, bundle);
  const normalizedInput = normalizeStudioProfileInput(input);

  return bundle.profiles.updateById(targetProfile.id, {
    ...normalizedInput,
    updatedAt: new Date().toISOString(),
  });
}
