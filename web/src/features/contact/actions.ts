"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getSessionRole } from "@/features/auth/session";

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
  const sessionRole = await getSessionRole();

  if (!sessionRole) {
    redirect("/login");
    return;
  }

  const cookieStore = await cookies();
  const currentThreads = parseContactThreads(cookieStore.get(contactThreadsCookieName)?.value);
  const nextThread = buildContactThread(sessionRole, recipientRole, recipientSlug, sourceType, sourceId);

  cookieStore.set({
    name: contactThreadsCookieName,
    value: serializeContactThreads(upsertContactThread(currentThreads, nextThread)),
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });

  redirect("/inbox");
}
