import { expect, test, vi } from "vitest";

import type { SessionContext } from "@/features/auth/types";

const {
  revalidatePathMock,
  redirectMock,
  getSessionContextMock,
  toggleProfileFollowForViewerMock,
} = vi.hoisted(() => ({
  revalidatePathMock: vi.fn(),
  redirectMock: vi.fn(),
  getSessionContextMock: vi.fn(),
  toggleProfileFollowForViewerMock: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: revalidatePathMock,
}));

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

vi.mock("@/features/auth/session", () => ({
  getSessionContext: getSessionContextMock,
}));

vi.mock("./follows", () => ({
  toggleProfileFollowForViewer: toggleProfileFollowForViewerMock,
}));

import { toggleProfileFollowAction } from "./actions";

test("toggleProfileFollowAction redirects guests to login", async () => {
  getSessionContextMock.mockResolvedValue({
    status: "guest",
    isAuthenticated: false,
    accountId: null,
    primaryRole: null,
  } satisfies SessionContext);

  await toggleProfileFollowAction("photographer", "sample-photographer", "/photographers/sample-photographer");

  expect(redirectMock).toHaveBeenCalledWith("/login");
  expect(toggleProfileFollowForViewerMock).not.toHaveBeenCalled();
});

test("toggleProfileFollowAction toggles follow state and revalidates profile and discover paths", async () => {
  redirectMock.mockReset();
  revalidatePathMock.mockReset();
  getSessionContextMock.mockResolvedValue({
    status: "authenticated",
    isAuthenticated: true,
    accountId: "demo-account:model",
    primaryRole: "model",
  } satisfies SessionContext);
  toggleProfileFollowForViewerMock.mockResolvedValue({
    profileId: "photographer:sample-photographer",
    following: true,
  });

  await toggleProfileFollowAction(
    "photographer",
    "sample-photographer",
    "/photographers/sample-photographer",
  );

  expect(toggleProfileFollowForViewerMock).toHaveBeenCalledWith(
    "demo-account:model",
    "photographer",
    "sample-photographer",
  );
  expect(revalidatePathMock).toHaveBeenCalledWith(
    "/photographers/sample-photographer",
  );
  expect(revalidatePathMock).toHaveBeenCalledWith("/discover");
});
