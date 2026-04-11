import { expect, test, vi } from "vitest";

const {
  revalidatePathMock,
  redirectMock,
  getSessionContextMock,
  toggleProfileFollowForViewerMock,
  recordDiscoveryEventMock,
} = vi.hoisted(() => ({
  revalidatePathMock: vi.fn(),
  redirectMock: vi.fn(),
  getSessionContextMock: vi.fn(),
  toggleProfileFollowForViewerMock: vi.fn(),
  recordDiscoveryEventMock: vi.fn(),
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

vi.mock("@/features/discovery/events", () => ({
  buildDiscoveryProfileTargetId: vi.fn(
    (role: string, slug: string) => `${role}:${slug}`,
  ),
  recordDiscoveryEvent: recordDiscoveryEventMock,
}));

import { toggleProfileFollowAction } from "./actions";

test("toggleProfileFollowAction redirects guests and logs a failed follow event", async () => {
  getSessionContextMock.mockResolvedValue({
    status: "guest",
    isAuthenticated: false,
    accountId: null,
    primaryRole: null,
  });

  await toggleProfileFollowAction("photographer", "sample-photographer", "/discover");

  expect(recordDiscoveryEventMock).toHaveBeenCalledWith(
    expect.objectContaining({
      eventType: "follow",
      targetId: "photographer:sample-photographer",
      success: false,
      failureReason: "unauthenticated",
    }),
  );
  expect(redirectMock).toHaveBeenCalledWith("/login");
});

test("toggleProfileFollowAction logs a success event when follow is created", async () => {
  getSessionContextMock.mockResolvedValue({
    status: "authenticated",
    isAuthenticated: true,
    accountId: "account:test:model",
    primaryRole: "model",
  });
  toggleProfileFollowForViewerMock.mockResolvedValue({
    profileId: "photographer:sample-photographer",
    following: true,
  });

  await toggleProfileFollowAction("photographer", "sample-photographer", "/discover");

  expect(recordDiscoveryEventMock).toHaveBeenCalledWith(
    expect.objectContaining({
      eventType: "follow",
      actorAccountId: "account:test:model",
      targetId: "photographer:sample-photographer",
      success: true,
    }),
  );
  expect(revalidatePathMock).toHaveBeenCalledWith("/discover");
});

test("toggleProfileFollowAction does not log a success event when viewer unfollows", async () => {
  recordDiscoveryEventMock.mockReset();
  getSessionContextMock.mockResolvedValue({
    status: "authenticated",
    isAuthenticated: true,
    accountId: "account:test:model",
    primaryRole: "model",
  });
  toggleProfileFollowForViewerMock.mockResolvedValue({
    profileId: "photographer:sample-photographer",
    following: false,
  });

  await toggleProfileFollowAction("photographer", "sample-photographer", "/discover");

  expect(recordDiscoveryEventMock).not.toHaveBeenCalled();
});
