"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getSessionContext } from "@/features/auth/session";
import { wrapServerAction } from "@/features/observability/server-boundary";

import { saveWorkCommentForViewer } from "./comments";

async function addWorkCommentActionImpl(
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

export const addWorkCommentAction = wrapServerAction(
  "social/addWorkCommentAction",
  addWorkCommentActionImpl,
);
