import { expect, test, vi } from "vitest";

const { cookiesMock, redirectMock, getSessionRoleMock, cookieStore } = vi.hoisted(() => ({
  cookiesMock: vi.fn(),
  redirectMock: vi.fn(),
  getSessionRoleMock: vi.fn(),
  cookieStore: {
    get: vi.fn(),
    set: vi.fn(),
  },
}));

vi.mock("next/headers", () => ({
  cookies: cookiesMock,
}));

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

vi.mock("@/features/auth/session", () => ({
  getSessionRole: getSessionRoleMock,
}));

import { startContactThreadAction } from "./actions";
import { contactThreadsCookieName } from "./state";

test("startContactThreadAction redirects guests to login", async () => {
  getSessionRoleMock.mockResolvedValue(null);

  await startContactThreadAction("photographer", "sample-photographer", "profile", "sample-photographer");

  expect(redirectMock).toHaveBeenCalledWith("/login");
});

test("startContactThreadAction stores a thread and redirects to inbox", async () => {
  redirectMock.mockReset();
  cookieStore.get.mockReset();
  cookieStore.set.mockReset();
  cookiesMock.mockResolvedValue(cookieStore);
  getSessionRoleMock.mockResolvedValue("model");
  cookieStore.get.mockReturnValue(undefined);

  await startContactThreadAction("photographer", "sample-photographer", "work", "neon-portrait-study");

  expect(cookieStore.set).toHaveBeenCalledWith(
    expect.objectContaining({
      name: contactThreadsCookieName,
      value: expect.stringContaining("neon-portrait-study"),
    })
  );
  expect(redirectMock).toHaveBeenCalledWith("/inbox");
});
