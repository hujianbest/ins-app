import { cookies } from "next/headers";

import type { AuthRole } from "./types";

export const authSessionCookieName = "lens-archive-role";

export function isAuthRole(value: string | undefined): value is AuthRole {
  return value === "photographer" || value === "model";
}

export async function getSessionRole(): Promise<AuthRole | null> {
  const cookieStore = await cookies();
  const sessionRole = cookieStore.get(authSessionCookieName)?.value;

  return isAuthRole(sessionRole) ? sessionRole : null;
}
