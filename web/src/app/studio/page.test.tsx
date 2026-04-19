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
