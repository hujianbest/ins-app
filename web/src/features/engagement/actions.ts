"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getSessionRole } from "@/features/auth/session";

import {
  parseCookieList,
  profileFavoritesCookieName,
  serializeCookieList,
  toggleListValue,
  workLikesCookieName,
} from "./state";

async function toggleCookieValue(cookieName: string, value: string) {
  const cookieStore = await cookies();
  const currentValues = parseCookieList(cookieStore.get(cookieName)?.value);
  const nextValues = toggleListValue(currentValues, value);

  cookieStore.set({
    name: cookieName,
    value: serializeCookieList(nextValues),
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });
}

export async function toggleWorkLikeAction(workId: string, returnTo: string) {
  const sessionRole = await getSessionRole();

  if (!sessionRole) {
    redirect("/login");
    return;
  }

  await toggleCookieValue(workLikesCookieName, workId);
  redirect(returnTo);
}

export async function toggleProfileFavoriteAction(profileSlug: string, returnTo: string) {
  const sessionRole = await getSessionRole();

  if (!sessionRole) {
    redirect("/login");
    return;
  }

  await toggleCookieValue(profileFavoritesCookieName, profileSlug);
  redirect(returnTo);
}
