import { expect, test, vi } from "vitest";

const {
  redirectMock,
  getSessionContextMock,
  recordDiscoveryEventMock,
  getDefaultCommunityRepositoryBundleMock,
  createOrFindDirectThreadMock,
} = vi.hoisted(() => ({
  redirectMock: vi.fn(),
  getSessionContextMock: vi.fn(),
  recordDiscoveryEventMock: vi.fn().mockResolvedValue(undefined),
  getDefaultCommunityRepositoryBundleMock: vi.fn(),
  createOrFindDirectThreadMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({ redirect: redirectMock }));
vi.mock("@/features/auth/session", () => ({
  getSessionContext: getSessionContextMock,
}));
vi.mock("@/features/discovery/events", () => ({
  buildDiscoveryProfileTargetId: vi.fn(
    (role: string, slug: string) => `${role}:${slug}`,
  ),
  recordDiscoveryEvent: recordDiscoveryEventMock,
}));
vi.mock("@/features/community/runtime", () => ({
  getDefaultCommunityRepositoryBundle: getDefaultCommunityRepositoryBundleMock,
}));
vi.mock("@/features/messaging/thread-actions", () => ({
  createOrFindDirectThread: createOrFindDirectThreadMock,
}));

import { startContactThreadAction } from "./actions";
import { AppError } from "@/features/observability/errors";

function bundleWithProfile(present: boolean) {
  return {
    profiles: {
      getById: vi.fn(async () =>
        present
          ? {
              id: "photographer:sample-photographer",
              role: "photographer",
              slug: "sample-photographer",
              name: "Sample",
              city: "shanghai",
              shootingFocus: "portrait",
              discoveryContext: "",
              externalHandoffUrl: "",
              tagline: "",
              bio: "",
              publishedAt: "2026-04-19T00:00:00.000Z",
            }
          : null,
      ),
    },
  };
}

test("startContactThreadAction: guest → redirect /login + failed event", async () => {
  redirectMock.mockClear();
  recordDiscoveryEventMock.mockClear();
  getSessionContextMock.mockResolvedValue({
    status: "guest",
    isAuthenticated: false,
    accountId: null,
    primaryRole: null,
  });
  await startContactThreadAction(
    "photographer",
    "sample-photographer",
    "profile",
    "sample-photographer",
  );
  expect(recordDiscoveryEventMock).toHaveBeenCalledWith(
    expect.objectContaining({
      eventType: "contact_start",
      success: false,
      failureReason: "unauthenticated",
    }),
  );
  expect(redirectMock).toHaveBeenCalledWith("/login");
});

test("startContactThreadAction: recipient_not_found → redirect /inbox?error= + failed event, no thread create", async () => {
  redirectMock.mockClear();
  recordDiscoveryEventMock.mockClear();
  createOrFindDirectThreadMock.mockClear();
  getSessionContextMock.mockResolvedValue({
    status: "authenticated",
    isAuthenticated: true,
    accountId: "account:test:photographer",
    primaryRole: "photographer",
  });
  getDefaultCommunityRepositoryBundleMock.mockReturnValue(
    bundleWithProfile(false),
  );

  await startContactThreadAction("photographer", "ghost", "profile", "ghost");
  expect(recordDiscoveryEventMock).toHaveBeenCalledWith(
    expect.objectContaining({
      success: false,
      failureReason: "recipient_not_found",
    }),
  );
  expect(redirectMock).toHaveBeenCalledWith("/inbox?error=recipient_not_found");
  expect(createOrFindDirectThreadMock).not.toHaveBeenCalled();
});

test("startContactThreadAction: happy path → createOrFindDirectThread + success event + redirect /inbox/[threadId]", async () => {
  redirectMock.mockClear();
  recordDiscoveryEventMock.mockClear();
  createOrFindDirectThreadMock.mockClear();
  getSessionContextMock.mockResolvedValue({
    status: "authenticated",
    isAuthenticated: true,
    accountId: "account:test:photographer",
    primaryRole: "photographer",
  });
  getDefaultCommunityRepositoryBundleMock.mockReturnValue(
    bundleWithProfile(true),
  );
  createOrFindDirectThreadMock.mockResolvedValue({ threadId: "thread-xyz" });

  await startContactThreadAction(
    "photographer",
    "sample-photographer",
    "work",
    "neon-portrait-study",
  );
  expect(createOrFindDirectThreadMock).toHaveBeenCalledWith(
    "photographer:sample-photographer",
    "work:neon-portrait-study",
  );
  expect(recordDiscoveryEventMock).toHaveBeenCalledWith(
    expect.objectContaining({
      eventType: "contact_start",
      success: true,
    }),
  );
  expect(redirectMock).toHaveBeenCalledWith("/inbox/thread-xyz");
});

test("startContactThreadAction: invalid_self_thread → redirect /inbox?error=", async () => {
  redirectMock.mockClear();
  recordDiscoveryEventMock.mockClear();
  createOrFindDirectThreadMock.mockClear();
  getSessionContextMock.mockResolvedValue({
    status: "authenticated",
    isAuthenticated: true,
    accountId: "account:test:photographer",
    primaryRole: "photographer",
  });
  getDefaultCommunityRepositoryBundleMock.mockReturnValue(
    bundleWithProfile(true),
  );
  createOrFindDirectThreadMock.mockRejectedValue(
    new AppError({ code: "invalid_self_thread", status: 400 }),
  );

  await startContactThreadAction(
    "photographer",
    "sample-photographer",
    "profile",
    "sample-photographer",
  );
  expect(redirectMock).toHaveBeenCalledWith("/inbox?error=invalid_self_thread");
});
