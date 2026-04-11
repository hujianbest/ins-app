"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getSessionContext } from "@/features/auth/session";
import {
  buildDiscoveryProfileTargetId,
  recordDiscoveryEvent,
} from "@/features/discovery/events";

import {
  buildContactThread,
  contactThreadsCookieName,
  type ContactSourceType,
  parseContactThreads,
  serializeContactThreads,
  upsertContactThread,
} from "./state";

export async function startContactThreadAction(
  recipientRole: "photographer" | "model",
  recipientSlug: string,
  sourceType: ContactSourceType,
  sourceId: string
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

  const cookieStore = await cookies();
  const currentThreads = parseContactThreads(cookieStore.get(contactThreadsCookieName)?.value);
  const nextThread = buildContactThread(
    session.primaryRole,
    recipientRole,
    recipientSlug,
    sourceType,
    sourceId,
  );

  cookieStore.set({
    name: contactThreadsCookieName,
    value: serializeContactThreads(upsertContactThread(currentThreads, nextThread)),
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });

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

  redirect("/inbox");
}
