import { type AuthRole } from "@/features/auth/types";

import { getDefaultCommunityRepositoryBundle } from "./runtime";
import type { CommunityRepositoryBundle, CommunityWorkRecord } from "./types";

export type StudioManagedWork = Pick<
  CommunityWorkRecord,
  | "id"
  | "title"
  | "category"
  | "description"
  | "detailNote"
  | "coverAsset"
  | "status"
  | "publishedAt"
>;

export type StudioWorkSaveIntent =
  | "save_draft"
  | "publish"
  | "revert_to_draft";

export type StudioWorkEditorInput = {
  workId?: string;
  title: string;
  category: string;
  description: string;
  detailNote: string;
  coverAsset: string;
  intent: StudioWorkSaveIntent;
};

function normalizeStudioWorkInput(
  input: StudioWorkEditorInput,
): StudioWorkEditorInput {
  return {
    ...input,
    title: input.title.trim(),
    category: input.category.trim(),
    description: input.description.trim(),
    detailNote: input.detailNote.trim(),
    coverAsset: input.coverAsset.trim(),
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

function toStudioManagedWork(work: CommunityWorkRecord): StudioManagedWork {
  return {
    id: work.id,
    title: work.title,
    category: work.category,
    description: work.description,
    detailNote: work.detailNote,
    coverAsset: work.coverAsset,
    status: work.status,
    publishedAt: work.publishedAt,
  };
}

function slugifyWorkId(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function createUniqueWorkId(
  title: string,
  bundle: CommunityRepositoryBundle,
) {
  const baseId = slugifyWorkId(title) || "untitled-work";
  let candidate = baseId;
  let suffix = 2;

  while (await bundle.works.getById(candidate)) {
    candidate = `${baseId}-${suffix}`;
    suffix += 1;
  }

  return candidate;
}

function resolveNextVisibility(
  currentWork: CommunityWorkRecord | null,
  intent: StudioWorkSaveIntent,
) {
  if (intent === "revert_to_draft") {
    return {
      status: "draft" as const,
      publishedAt: undefined,
    };
  }

  if (intent === "publish") {
    return {
      status: "published" as const,
      publishedAt: currentWork?.publishedAt ?? new Date().toISOString(),
    };
  }

  if (intent === "save_draft" && currentWork?.status === "published") {
    return {
      status: "published" as const,
      publishedAt: currentWork.publishedAt,
    };
  }

  return {
    status: "draft" as const,
    publishedAt: undefined,
  };
}

export async function getStudioWorksEditorModel(
  role: AuthRole,
  bundle: CommunityRepositoryBundle = getDefaultCommunityRepositoryBundle(),
): Promise<StudioManagedWork[]> {
  const profile = await resolveEditableProfileForRole(role, bundle);
  const works = await bundle.works.listByOwnerProfileId(profile.id);

  return works.map(toStudioManagedWork);
}

export async function saveCreatorWorkForRole(
  role: AuthRole,
  input: StudioWorkEditorInput,
  bundle: CommunityRepositoryBundle = getDefaultCommunityRepositoryBundle(),
) {
  const profile = await resolveEditableProfileForRole(role, bundle);
  const normalizedInput = normalizeStudioWorkInput(input);
  const existingWork = normalizedInput.workId
    ? await bundle.works.getById(normalizedInput.workId)
    : null;

  if (normalizedInput.workId && (!existingWork || existingWork.ownerProfileId !== profile.id)) {
    throw new Error(`Unable to resolve managed work: ${normalizedInput.workId}`);
  }

  const nextVisibility = resolveNextVisibility(existingWork, normalizedInput.intent);
  const workId =
    existingWork?.id ??
    (await createUniqueWorkId(normalizedInput.title, bundle));

  return bundle.works.save({
    id: workId,
    ownerProfileId: profile.id,
    ownerRole: profile.role,
    ownerSlug: profile.slug,
    ownerName: profile.name,
    status: nextVisibility.status,
    title: normalizedInput.title,
    category: normalizedInput.category,
    description: normalizedInput.description,
    detailNote: normalizedInput.detailNote,
    coverAsset: normalizedInput.coverAsset,
    publishedAt: nextVisibility.publishedAt,
    updatedAt: new Date().toISOString(),
  });
}
