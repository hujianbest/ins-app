import { expect, test, vi } from "vitest";

const {
  authenticateAuthAccountMock,
  createAuthSessionMock,
  cookiesMock,
  cookieStore,
  redirectMock,
  registerAuthAccountMock,
  revokeAuthSessionMock,
} = vi.hoisted(() => ({
  authenticateAuthAccountMock: vi.fn(),
  createAuthSessionMock: vi.fn(),
  cookiesMock: vi.fn(),
  cookieStore: {
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
  },
  redirectMock: vi.fn(),
  registerAuthAccountMock: vi.fn(),
  revokeAuthSessionMock: vi.fn(),
}));

vi.mock("next/headers", () => ({
  cookies: cookiesMock,
}));

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

vi.mock("./auth-store", () => ({
  authenticateAuthAccount: authenticateAuthAccountMock,
  createAuthSession: createAuthSessionMock,
  registerAuthAccount: registerAuthAccountMock,
  revokeAuthSession: revokeAuthSessionMock,
}));

vi.mock("./session", () => ({
  authSessionCookieName: "lens-archive-session",
  getAuthSessionCookieOptions: () => ({
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  }),
  isAuthRole: (value: string | undefined) =>
    value === "photographer" || value === "model",
}));

import {
  loginAccountAction,
  logoutAction,
  registerAccountAction,
} from "./actions";

test("loginAccountAction redirects back to login when credentials are invalid", async () => {
  cookiesMock.mockResolvedValue(cookieStore);
  authenticateAuthAccountMock.mockReturnValue(null);

  const formData = new FormData();
  formData.set("email", "creator@example.com");
  formData.set("password", "wrong-password");

  await loginAccountAction(formData);

  expect(redirectMock).toHaveBeenCalledWith("/login?error=invalid_credentials");
});

test("registerAccountAction stores session cookie and redirects to studio", async () => {
  redirectMock.mockReset();
  cookieStore.set.mockReset();
  cookiesMock.mockResolvedValue(cookieStore);
  registerAuthAccountMock.mockReturnValue({
    id: "account:test:photographer",
    email: "creator@example.com",
    primaryRole: "photographer",
    createdAt: "2026-04-09T00:00:00Z",
  });
  createAuthSessionMock.mockReturnValue({
    token: "session-token",
    accountId: "account:test:photographer",
    primaryRole: "photographer",
    expiresAt: "2026-05-09T00:00:00Z",
  });

  const formData = new FormData();
  formData.set("email", "creator@example.com");
  formData.set("password", "strong-pass-123");
  formData.set("primaryRole", "photographer");

  await registerAccountAction(formData);

  expect(cookieStore.set).toHaveBeenCalledWith(
    expect.objectContaining({
      name: "lens-archive-session",
      value: "session-token",
    }),
  );
  expect(redirectMock).toHaveBeenCalledWith("/studio");
});

test("logoutAction clears the current session", async () => {
  redirectMock.mockReset();
  cookieStore.get.mockReset();
  cookieStore.delete.mockReset();
  cookiesMock.mockResolvedValue(cookieStore);
  cookieStore.get.mockReturnValue({ value: "session-token" });

  await logoutAction();

  expect(revokeAuthSessionMock).toHaveBeenCalledWith("session-token");
  expect(cookieStore.delete).toHaveBeenCalledWith("lens-archive-session");
  expect(redirectMock).toHaveBeenCalledWith("/");
});
