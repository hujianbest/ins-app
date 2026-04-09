"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  authSessionCookieName,
  authSessionCookieOptions,
  isAuthRole,
} from "./session";

export async function startDemoSession(formData: FormData) {
  const role = formData.get("role");

  if (typeof role !== "string" || !isAuthRole(role)) {
    redirect("/login");
  }

  const cookieStore = await cookies();

  cookieStore.set({
    name: authSessionCookieName,
    value: role,
    ...authSessionCookieOptions,
  });

  redirect("/studio");
}
