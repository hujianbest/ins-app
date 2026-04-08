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

import {
  toggleProfileFavoriteAction,
  toggleWorkLikeAction,
} from "./actions";
import { profileFavoritesCookieName, workLikesCookieName } from "./state";

test("toggleWorkLikeAction redirects unauthenticated users to login", async () => {
  getSessionRoleMock.mockResolvedValue(null);

  await toggleWorkLikeAction("neon-portrait-study", "/works/neon-portrait-study");

  expect(redirectMock).toHaveBeenCalledWith("/login");
});

test("toggleWorkLikeAction stores a liked work id for authenticated users", async () => {
  redirectMock.mockReset();
  cookieStore.get.mockReset();
  cookieStore.set.mockReset();
  cookiesMock.mockResolvedValue(cookieStore);
  getSessionRoleMock.mockResolvedValue("photographer");
  cookieStore.get.mockReturnValue(undefined);

  await toggleWorkLikeAction("neon-portrait-study", "/works/neon-portrait-study");

  expect(cookieStore.set).toHaveBeenCalledWith({
    name: workLikesCookieName,
    value: "neon-portrait-study",
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });
  expect(redirectMock).toHaveBeenCalledWith("/works/neon-portrait-study");
});

test("toggleProfileFavoriteAction removes an existing profile favorite", async () => {
  redirectMock.mockReset();
  cookieStore.get.mockReset();
  cookieStore.set.mockReset();
  cookiesMock.mockResolvedValue(cookieStore);
  getSessionRoleMock.mockResolvedValue("model");
  cookieStore.get.mockReturnValue({ value: "sample-photographer" });

  await toggleProfileFavoriteAction("sample-photographer", "/photographers/sample-photographer");

  expect(cookieStore.set).toHaveBeenCalledWith({
    name: profileFavoritesCookieName,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });
  expect(redirectMock).toHaveBeenCalledWith("/photographers/sample-photographer");
});
