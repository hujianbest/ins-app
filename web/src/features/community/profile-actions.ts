"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getRequestAccessControl } from "@/features/auth/access-control";

import {
  saveCreatorProfileForRole,
  type StudioProfileEditorInput,
} from "./profile-editor";

function readRequiredField(
  formData: FormData,
  field: keyof StudioProfileEditorInput,
) {
  const value = formData.get(field);

  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`Missing profile field: ${field}`);
  }

  return value;
}

export async function saveStudioProfileAction(formData: FormData) {
  const accessControl = await getRequestAccessControl();
  const session = accessControl.session;

  if (session.status !== "authenticated" || !accessControl.studioGuard.allowed) {
    redirect(accessControl.studioGuard.redirectTo ?? "/login");
    return;
  }

  const updatedProfile = await saveCreatorProfileForRole(session.primaryRole, {
    name: readRequiredField(formData, "name"),
    city: readRequiredField(formData, "city"),
    tagline: readRequiredField(formData, "tagline"),
    bio: readRequiredField(formData, "bio"),
  });

  revalidatePath("/studio/profile");
  revalidatePath("/");
  revalidatePath("/discover");
  revalidatePath(
    updatedProfile.role === "photographer"
      ? `/photographers/${updatedProfile.slug}`
      : `/models/${updatedProfile.slug}`,
  );
}
