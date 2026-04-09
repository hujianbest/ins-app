import { cookies } from "next/headers";

import type { AuthRole, SessionAccountId, SessionContext } from "./types";

export const authSessionCookieName = "lens-archive-role";
export const authSessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
};

export function isAuthRole(value: string | undefined): value is AuthRole {
  return value === "photographer" || value === "model";
}

export function buildSessionAccountId(role: AuthRole): SessionAccountId {
  return `demo-account:${role}`;
}

export function resolveSessionContext(
  sessionRole: string | undefined,
): SessionContext {
  if (!isAuthRole(sessionRole)) {
    return {
      status: "guest",
      isAuthenticated: false,
      accountId: null,
      primaryRole: null,
    };
  }

  return {
    status: "authenticated",
    isAuthenticated: true,
    accountId: buildSessionAccountId(sessionRole),
    primaryRole: sessionRole,
  };
}

export async function getSessionContext(): Promise<SessionContext> {
  const cookieStore = await cookies();

  return resolveSessionContext(
    cookieStore.get(authSessionCookieName)?.value,
  );
}

export async function getSessionRole(): Promise<AuthRole | null> {
  const session = await getSessionContext();

  return session.primaryRole;
}
