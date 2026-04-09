"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getSessionContext } from "@/features/auth/session";
import type { CommunityRole } from "@/features/community/types";

import { toggleProfileFollowForViewer } from "./follows";

export async function toggleProfileFollowAction(
  role: CommunityRole,
  slug: string,
  returnPath: string,
) {
  const session = await getSessionContext();

  if (session.status !== "authenticated") {
    redirect("/login");
    return;
  }

  await toggleProfileFollowForViewer(session.accountId, role, slug);

  revalidatePath(returnPath);
  revalidatePath("/discover");
}
