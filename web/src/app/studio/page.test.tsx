import { render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";

import type { AccessControl } from "@/features/auth/types";

const { redirectMock, getRequestAccessControlMock } = vi.hoisted(() => ({
  redirectMock: vi.fn(),
  getRequestAccessControlMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

vi.mock("@/features/auth/access-control", () => ({
  getRequestAccessControl: getRequestAccessControlMock,
}));

import StudioPage from "./page";

function createAuthenticatedAccessControl(
  primaryRole: "photographer" | "model",
): AccessControl {
  return {
    session: {
      status: "authenticated",
      isAuthenticated: true,
      accountId: `demo-account:${primaryRole}`,
      primaryRole,
      email: `${primaryRole}@test.lens-archive.local`,
    },
    creatorCapability: {
      isCreator: true,
      canManageCreatorProfile: true,
      canPublishWorks: true,
    },
    studioGuard: {
      allowed: true,
      redirectTo: null,
      reason: "allowed",
    },
    adminCapability: {
      isAdmin: false,
      email: null,
    },
    adminGuard: {
      allowed: false,
      redirectTo: "/studio",
      reason: "not_admin",
    },
  };
}

test("studio page renders the model studio landing view through shared access control", async () => {
  redirectMock.mockReset();
  getRequestAccessControlMock.mockResolvedValue(
    createAuthenticatedAccessControl("model"),
  );

  const page = await StudioPage();

  render(page);

  expect(
    screen.getByRole("heading", {
      level: 1,
      name: /模特工作台/,
    })
  ).toBeDefined();
  expect(screen.getByRole("link", { name: /打开收件箱/ }).getAttribute("href")).toBe("/inbox");
  // Phase 2 §3.2: non-admin users must NOT see the admin entry card (FR-002 #5)
  expect(screen.queryByRole("link", { name: /进入运营后台/ })).toBeNull();
});

test("studio page renders the admin entry card for admin users (Phase 2 §3.2 FR-002)", async () => {
  redirectMock.mockReset();
  const access = createAuthenticatedAccessControl("photographer");
  access.adminCapability = { isAdmin: true, email: "admin@example.com" };
  access.adminGuard = { allowed: true, redirectTo: null, reason: "allowed" };
  getRequestAccessControlMock.mockResolvedValue(access);

  const page = await StudioPage();
  render(page);

  expect(
    screen.getByRole("link", { name: /进入运营后台/ }).getAttribute("href"),
  ).toBe("/studio/admin");
});

test("studio page redirects unauthenticated visitors to login", async () => {
  redirectMock.mockReset();
  getRequestAccessControlMock.mockResolvedValue({
    session: {
      status: "guest",
      isAuthenticated: false,
      accountId: null,
      primaryRole: null,
    },
    creatorCapability: {
      isCreator: false,
      canManageCreatorProfile: false,
      canPublishWorks: false,
    },
    studioGuard: {
      allowed: false,
      redirectTo: "/login",
      reason: "unauthenticated",
    },
    adminCapability: { isAdmin: false, email: null },
    adminGuard: {
      allowed: false,
      redirectTo: "/login",
      reason: "unauthenticated",
    },
  } satisfies AccessControl);

  await StudioPage();

  expect(redirectMock).toHaveBeenCalledWith("/login");
});
