"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getSessionContext } from "@/features/auth/session";

import { saveWorkCommentForViewer } from "./comments";

export async function addWorkCommentAction(
  workId: string,
  returnPath: string,
  formData: FormData,
) {
  const session = await getSessionContext();

  if (session.status !== "authenticated") {
    redirect("/login");
    return;
  }

  const body = formData.get("body");

  if (typeof body !== "string") {
    throw new Error("Missing comment body");
  }

  await saveWorkCommentForViewer(session.accountId, workId, body);
  revalidatePath(returnPath);
}
