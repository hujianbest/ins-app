"use server";

import { redirect } from "next/navigation";

import { getSessionContext } from "@/features/auth/session";
import { getDefaultCommunityRepositoryBundle } from "@/features/community/runtime";
import {
  buildDiscoveryProfileTargetId,
  recordDiscoveryEvent,
} from "@/features/discovery/events";
import { createOrFindDirectThread } from "@/features/messaging/thread-actions";
import { AppError } from "@/features/observability/errors";
import { wrapServerAction } from "@/features/observability/server-boundary";

import type { ContactSourceType } from "./state";

function buildContextRef(
  recipientRole: "photographer" | "model",
  recipientSlug: string,
  sourceType: ContactSourceType,
  sourceId: string,
): string {
  if (sourceType === "work") return `work:${sourceId}`;
  if (sourceType === "opportunity") return `opportunity:${sourceId}`;
  return `profile:${recipientRole}:${recipientSlug}`;
}

async function startContactThreadActionImpl(
  recipientRole: "photographer" | "model",
  recipientSlug: string,
  sourceType: ContactSourceType,
  sourceId: string,
) {
  const session = await getSessionContext();
  const targetProfileId = buildDiscoveryProfileTargetId(
    recipientRole,
    recipientSlug,
  );

  if (!session.primaryRole) {
    await recordDiscoveryEvent({
      eventType: "contact_start",
      actorAccountId: null,
      targetType: "profile",
      targetId: targetProfileId,
      targetProfileId,
      surface: `contact:${sourceType}`,
      query: "",
      success: false,
      failureReason: "unauthenticated",
    });
    redirect("/login");
    return;
  }

  const bundle = getDefaultCommunityRepositoryBundle();
  const recipientProfileId = `${recipientRole}:${recipientSlug}`;
  const recipient = await bundle.profiles.getById(recipientProfileId);
  if (!recipient) {
    await recordDiscoveryEvent({
      eventType: "contact_start",
      actorAccountId: session.accountId,
      targetType: "profile",
      targetId: targetProfileId,
      targetProfileId,
      surface: `contact:${sourceType}`,
      query: "",
      success: false,
      failureReason: "recipient_not_found",
    });
    redirect("/inbox?error=recipient_not_found");
    return;
  }

  const contextRef = buildContextRef(
    recipientRole,
    recipientSlug,
    sourceType,
    sourceId,
  );

  try {
    const { threadId } = await createOrFindDirectThread(
      recipientProfileId,
      contextRef,
    );
    await recordDiscoveryEvent({
      eventType: "contact_start",
      actorAccountId: session.accountId,
      targetType: "profile",
      targetId: targetProfileId,
      targetProfileId,
      surface: `contact:${sourceType}`,
      query: "",
      success: true,
    });
    redirect(`/inbox/${threadId}`);
  } catch (error) {
    if (error instanceof AppError && error.code === "invalid_self_thread") {
      redirect("/inbox?error=invalid_self_thread");
      return;
    }
    throw error;
  }
}

export const startContactThreadAction = wrapServerAction(
  "contact/startContactThreadAction",
  startContactThreadActionImpl,
);
