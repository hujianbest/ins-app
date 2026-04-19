"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getRequestAccessControl } from "@/features/auth/access-control";
import { AppError } from "@/features/observability/errors";
import { wrapServerAction } from "@/features/observability/server-boundary";

import {
  saveCreatorWorkForRole,
  type StudioWorkEditorInput,
  type StudioWorkSaveIntent,
} from "./work-editor";

function readRequiredField(
  formData: FormData,
  field: Exclude<keyof StudioWorkEditorInput, "workId" | "intent">,
) {
  const value = formData.get(field);

  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`Missing work field: ${field}`);
  }

  return value;
}

function readIntent(formData: FormData): StudioWorkSaveIntent {
  const value = formData.get("intent");

  if (value === "save_draft" || value === "publish" || value === "revert_to_draft") {
    return value;
  }

  throw new Error("Missing work intent");
}

async function saveStudioWorkActionImpl(formData: FormData) {
  const accessControl = await getRequestAccessControl();
  const session = accessControl.session;

  if (session.status !== "authenticated" || !accessControl.studioGuard.allowed) {
    redirect(accessControl.studioGuard.redirectTo ?? "/login");
    return;
  }

  let updatedWork;
  try {
    updatedWork = await saveCreatorWorkForRole(session.primaryRole, {
      workId: typeof formData.get("workId") === "string" ? String(formData.get("workId")) : undefined,
      title: readRequiredField(formData, "title"),
      category: readRequiredField(formData, "category"),
      description: readRequiredField(formData, "description"),
      detailNote: readRequiredField(formData, "detailNote"),
      coverAsset: readRequiredField(formData, "coverAsset"),
      intent: readIntent(formData),
    });
  } catch (error) {
    // Phase 2 — Ops Back Office V1 (FR-004 #6 / I-14):
    // Owner attempted to mutate a moderated work; surface the error
    // back to /studio/works as a URL-bound alert without leaking
    // internals to the page boundary.
    if (
      error instanceof AppError &&
      error.code === "moderated_work_owner_locked"
    ) {
      redirect("/studio/works?error=moderated_work_owner_locked");
    }
    throw error;
  }

  revalidatePath("/studio/works");
  revalidatePath("/");
  revalidatePath("/discover");
  revalidatePath(
    updatedWork.ownerRole === "photographer"
      ? `/photographers/${updatedWork.ownerSlug}`
      : `/models/${updatedWork.ownerSlug}`,
  );
  revalidatePath(`/works/${updatedWork.id}`);
}

export const saveStudioWorkAction = wrapServerAction(
  "community/saveStudioWorkAction",
  saveStudioWorkActionImpl,
);
