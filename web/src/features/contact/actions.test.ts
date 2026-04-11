import { expect, test, vi } from "vitest";

const {
  cookiesMock,
  redirectMock,
  getSessionContextMock,
  recordDiscoveryEventMock,
  cookieStore,
} = vi.hoisted(() => ({
  cookiesMock: vi.fn(),
  redirectMock: vi.fn(),
  getSessionContextMock: vi.fn(),
  recordDiscoveryEventMock: vi.fn(),
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
  getSessionContext: getSessionContextMock,
}));

vi.mock("@/features/discovery/events", () => ({
  buildDiscoveryProfileTargetId: vi.fn(
    (role: string, slug: string) => `${role}:${slug}`,
  ),
  recordDiscoveryEvent: recordDiscoveryEventMock,
}));

import { startContactThreadAction } from "./actions";
import { contactThreadsCookieName } from "./state";

test("startContactThreadAction redirects guests to login", async () => {
  getSessionContextMock.mockResolvedValue({
    status: "guest",
    isAuthenticated: false,
    accountId: null,
    primaryRole: null,
  });

  await startContactThreadAction("photographer", "sample-photographer", "profile", "sample-photographer");

  expect(recordDiscoveryEventMock).toHaveBeenCalledWith(
    expect.objectContaining({
      eventType: "contact_start",
      success: false,
      failureReason: "unauthenticated",
    }),
  );
  expect(redirectMock).toHaveBeenCalledWith("/login");
});

test("startContactThreadAction stores a thread and redirects to inbox", async () => {
  redirectMock.mockReset();
  cookieStore.get.mockReset();
  cookieStore.set.mockReset();
  recordDiscoveryEventMock.mockReset();
  cookiesMock.mockResolvedValue(cookieStore);
  getSessionContextMock.mockResolvedValue({
    status: "authenticated",
    isAuthenticated: true,
    accountId: "account:test:model",
    primaryRole: "model",
  });
  cookieStore.get.mockReturnValue(undefined);

  await startContactThreadAction("photographer", "sample-photographer", "work", "neon-portrait-study");

  expect(cookieStore.set).toHaveBeenCalledWith(
    expect.objectContaining({
      name: contactThreadsCookieName,
      value: expect.stringContaining("neon-portrait-study"),
    })
  );
  expect(recordDiscoveryEventMock).toHaveBeenCalledWith(
    expect.objectContaining({
      eventType: "contact_start",
      actorAccountId: "account:test:model",
      success: true,
    }),
  );
  expect(redirectMock).toHaveBeenCalledWith("/inbox");
});
