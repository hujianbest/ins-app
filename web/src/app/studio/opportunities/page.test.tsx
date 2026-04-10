import { render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";

import type { AccessControl } from "@/features/auth/types";
import { resolveSeedVisualAsset } from "@/features/showcase/sample-data";

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

import StudioOpportunitiesPage from "./page";

function createAuthenticatedAccessControl(
  primaryRole: "photographer" | "model",
): AccessControl {
  return {
    session: {
      status: "authenticated",
      isAuthenticated: true,
      accountId: `demo-account:${primaryRole}`,
      primaryRole,
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
  };
}

test("studio opportunities page renders request management fields for the signed-in creator", async () => {
  redirectMock.mockReset();
  getRequestAccessControlMock.mockResolvedValue(
    createAuthenticatedAccessControl("photographer"),
  );
  const firstManagedPostAsset = resolveSeedVisualAsset("seed:night-editorial-brief");

  const page = await StudioOpportunitiesPage();

  render(page);

  expect(
    screen.getByRole("heading", {
      level: 1,
      name: /管理诉求/,
    })
  ).toBeDefined();
  expect(screen.getByDisplayValue(/^上海$/)).toBeDefined();
  expect(screen.getByDisplayValue(/^2026-04-20 晚间$/)).toBeDefined();
  expect(screen.getByRole("button", { name: /^发布$/ })).toBeDefined();
  expect(screen.getByText(/上海夜景编辑拍摄招募/)).toBeDefined();
  expect(screen.getAllByText(/摄影师诉求/).length).toBeGreaterThan(0);
  expect(screen.getByText("上海 · 2026-04-20 晚间")).toBeDefined();
  expect(screen.getAllByText("Avery Vale").length).toBeGreaterThan(0);
  expect(screen.getAllByAltText(firstManagedPostAsset?.alt ?? "").length).toBeGreaterThan(0);
});

test("studio opportunities page redirects unauthenticated visitors to login", async () => {
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
  } satisfies AccessControl);

  await StudioOpportunitiesPage();

  expect(redirectMock).toHaveBeenCalledWith("/login");
});
