import { render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";

import type { AccessControl } from "@/features/auth/types";
import type { StudioProfileEditorModel } from "@/features/community/profile-editor";

const {
  redirectMock,
  getRequestAccessControlMock,
  getStudioProfileEditorModelMock,
  saveStudioProfileActionMock,
} = vi.hoisted(() => ({
  redirectMock: vi.fn(),
  getRequestAccessControlMock: vi.fn(),
  getStudioProfileEditorModelMock: vi.fn(),
  saveStudioProfileActionMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

vi.mock("@/features/auth/access-control", () => ({
  getRequestAccessControl: getRequestAccessControlMock,
}));

vi.mock("@/features/community/profile-editor", () => ({
  getStudioProfileEditorModel: getStudioProfileEditorModelMock,
}));

vi.mock("@/features/community/profile-actions", () => ({
  saveStudioProfileAction: saveStudioProfileActionMock,
}));

import StudioProfilePage from "./page";

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

test("studio profile page renders editable creator profile fields", async () => {
  redirectMock.mockReset();
  getRequestAccessControlMock.mockResolvedValue(
    createAuthenticatedAccessControl("photographer"),
  );
  getStudioProfileEditorModelMock.mockResolvedValue({
    id: "photographer:repo-avery",
    role: "photographer",
    slug: "repo-avery",
    name: "Repository Avery",
    city: "苏州",
    shootingFocus: "编辑人像",
    discoveryContext: "希望被华东品牌团队与固定合作模特看到",
    tagline: "repo-backed profile",
    bio: "Repo biography for studio editing.",
    externalHandoffUrl: "https://portfolio.example.com/repo-avery",
  } satisfies StudioProfileEditorModel);

  const page = await StudioProfilePage();

  render(page);

  expect(
    screen.getByRole("heading", {
      level: 1,
      name: /编辑主页/,
    })
  ).toBeDefined();
  expect(screen.getByDisplayValue(/repository avery/i)).toBeDefined();
  expect(screen.getByDisplayValue(/^苏州$/)).toBeDefined();
  expect(screen.getByDisplayValue(/^编辑人像$/)).toBeDefined();
  expect(
    screen.getByDisplayValue(/希望被华东品牌团队与固定合作模特看到/),
  ).toBeDefined();
  expect(screen.getByDisplayValue(/repo-backed profile/)).toBeDefined();
  expect(screen.getByDisplayValue(/Repo biography for studio editing\./)).toBeDefined();
  expect(
    screen.getByDisplayValue(/https:\/\/portfolio\.example\.com\/repo-avery/),
  ).toBeDefined();
  expect(screen.getByRole("button", { name: /^保存$/ })).toBeDefined();
});

test("studio profile page redirects unauthenticated visitors to login", async () => {
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

  await StudioProfilePage();

  expect(redirectMock).toHaveBeenCalledWith("/login");
});
