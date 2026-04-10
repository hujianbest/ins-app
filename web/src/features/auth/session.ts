import { cookies } from "next/headers";

import { getAppConfig } from "@/config/env";

import { resolveAuthSession } from "./auth-store";
import type { AuthRole, SessionAccountId, SessionContext } from "./types";

export const authSessionCookieName = "lens-archive-session";
export const authSessionMaxAgeSeconds = 60 * 60 * 24 * 30;

export function isAuthRole(value: string | undefined): value is AuthRole {
  return value === "photographer" || value === "model";
}

export function getAuthSessionCookieOptions() {
  const config = getAppConfig();

  return {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    secure: config.sessionCookieSecure,
    maxAge: authSessionMaxAgeSeconds,
  };
}

export function buildSessionAccountId(
  role: AuthRole,
  seed = "local",
): SessionAccountId {
  return `account:${seed}:${role}`;
}

export function createAuthenticatedSessionContext(
  accountId: SessionAccountId,
  primaryRole: AuthRole,
): SessionContext {
  return {
    status: "authenticated",
    isAuthenticated: true,
    accountId,
    primaryRole,
  };
}

function createGuestSessionContext(): SessionContext {
  return {
    status: "guest",
    isAuthenticated: false,
    accountId: null,
    primaryRole: null,
  };
}

export function resolveSessionContext(sessionRole: string | undefined): SessionContext {
  if (!isAuthRole(sessionRole)) {
    return createGuestSessionContext();
  }

  return createAuthenticatedSessionContext(
    buildSessionAccountId(sessionRole, "test"),
    sessionRole,
  );
}

export async function getSessionContext(): Promise<SessionContext> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(authSessionCookieName)?.value;

  if (!sessionToken) {
    return createGuestSessionContext();
  }

  const resolvedSession = resolveAuthSession(sessionToken);

  if (!resolvedSession) {
    return createGuestSessionContext();
  }

  if (!isAuthRole(resolvedSession.primaryRole)) {
    return createGuestSessionContext();
  }

  return createAuthenticatedSessionContext(
    resolvedSession.accountId,
    resolvedSession.primaryRole,
  );
}

export async function getSessionRole(): Promise<AuthRole | null> {
  const session = await getSessionContext();

  return session.primaryRole;
}
