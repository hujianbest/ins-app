"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  authenticateAuthAccount,
  createAuthSession,
  registerAuthAccount,
  revokeAuthSession,
} from "./auth-store";
import {
  authSessionCookieName,
  getAuthSessionCookieOptions,
  isAuthRole,
} from "./session";

function readCredentials(formData: FormData) {
  const email = formData.get("email");
  const password = formData.get("password");

  if (typeof email !== "string" || typeof password !== "string") {
    throw new Error("missing_fields");
  }

  const normalizedEmail = email.trim();
  const normalizedPassword = password.trim();

  if (!normalizedEmail || !normalizedPassword) {
    throw new Error("missing_fields");
  }

  return {
    email: normalizedEmail,
    password: normalizedPassword,
  };
}

function redirectWithError(pathname: "/login" | "/register", error: unknown) {
  const errorCode = error instanceof Error ? error.message : "unknown_error";

  redirect(`${pathname}?error=${encodeURIComponent(errorCode)}`);
}

export async function loginAccountAction(formData: FormData) {
  const cookieStore = await cookies();

  let sessionToken: string;

  try {
    const credentials = readCredentials(formData);
    const account = authenticateAuthAccount(credentials);

    if (!account) {
      throw new Error("invalid_credentials");
    }

    sessionToken = createAuthSession(account).token;
  } catch (error) {
    redirectWithError("/login", error);
    return;
  }

  cookieStore.set({
    name: authSessionCookieName,
    value: sessionToken,
    ...getAuthSessionCookieOptions(),
  });

  redirect("/studio");
}

export async function registerAccountAction(formData: FormData) {
  const cookieStore = await cookies();

  let sessionToken: string;

  try {
    const credentials = readCredentials(formData);
    const primaryRole = formData.get("primaryRole");

    if (typeof primaryRole !== "string" || !isAuthRole(primaryRole)) {
      throw new Error("missing_fields");
    }

    const account = registerAuthAccount({
      ...credentials,
      primaryRole,
    });

    sessionToken = createAuthSession(account).token;
  } catch (error) {
    redirectWithError("/register", error);
    return;
  }

  cookieStore.set({
    name: authSessionCookieName,
    value: sessionToken,
    ...getAuthSessionCookieOptions(),
  });

  redirect("/studio");
}

export async function logoutAction() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(authSessionCookieName)?.value;

  if (sessionToken) {
    revokeAuthSession(sessionToken);
  }

  cookieStore.delete(authSessionCookieName);
  redirect("/");
}
