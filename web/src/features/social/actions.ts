"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getSessionContext } from "@/features/auth/session";
import type { CommunityRole } from "@/features/community/types";
import {
  buildDiscoveryProfileTargetId,
  recordDiscoveryEvent,
} from "@/features/discovery/events";
import { wrapServerAction } from "@/features/observability/server-boundary";

import { toggleProfileFollowForViewer } from "./follows";

async function toggleProfileFollowActionImpl(
  role: CommunityRole,
  slug: string,
  returnPath: string,
) {
  const session = await getSessionContext();
  const targetProfileId = buildDiscoveryProfileTargetId(role, slug);

  if (session.status !== "authenticated") {
    await recordDiscoveryEvent({
      eventType: "follow",
      actorAccountId: null,
      targetType: "profile",
      targetId: targetProfileId,
      targetProfileId,
      surface: returnPath,
      query: "",
      success: false,
      failureReason: "unauthenticated",
    });
    redirect("/login");
    return;
  }

  const result = await toggleProfileFollowForViewer(session.accountId, role, slug);

  if (result.following) {
    await recordDiscoveryEvent({
      eventType: "follow",
      actorAccountId: session.accountId,
      targetType: "profile",
      targetId: result.profileId,
      targetProfileId: result.profileId,
      surface: returnPath,
      query: "",
      success: true,
    });
  }

  revalidatePath(returnPath);
  revalidatePath("/discover");
}

export const toggleProfileFollowAction = wrapServerAction(
  "social/toggleProfileFollowAction",
  toggleProfileFollowActionImpl,
);
