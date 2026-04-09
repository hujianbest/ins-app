import { render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";

import type { AccessControl } from "@/features/auth/types";
import type { StudioManagedWork } from "@/features/community/work-editor";

const {
  redirectMock,
  getRequestAccessControlMock,
  getStudioWorksEditorModelMock,
  saveStudioWorkActionMock,
} = vi.hoisted(() => ({
  redirectMock: vi.fn(),
  getRequestAccessControlMock: vi.fn(),
  getStudioWorksEditorModelMock: vi.fn(),
  saveStudioWorkActionMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

vi.mock("@/features/auth/access-control", () => ({
  getRequestAccessControl: getRequestAccessControlMock,
}));

vi.mock("@/features/community/work-editor", () => ({
  getStudioWorksEditorModel: getStudioWorksEditorModelMock,
}));

vi.mock("@/features/community/work-actions", () => ({
  saveStudioWorkAction: saveStudioWorkActionMock,
}));

import StudioWorksPage from "./page";

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

test("studio works page renders the signed-in creator work list", async () => {
  redirectMock.mockReset();
  getRequestAccessControlMock.mockResolvedValue(
    createAuthenticatedAccessControl("photographer"),
  );
  getStudioWorksEditorModelMock.mockResolvedValue([
    {
      id: "repo-draft",
      title: "Repository Draft Work",
      category: "概念人像",
      description: "Draft description",
      detailNote: "Draft note",
      coverAsset: "work:repo-draft:cover",
      status: "draft",
    },
    {
      id: "repo-published",
      title: "Repository Published Work",
      category: "编辑人像",
      description: "Published description",
      detailNote: "Published note",
      coverAsset: "work:repo-published:cover",
      status: "published",
      publishedAt: "2026-04-09T09:00:00Z",
    },
  ] satisfies StudioManagedWork[]);

  const page = await StudioWorksPage();

  render(page);

  expect(
    screen.getByRole("heading", {
      level: 1,
      name: /管理作品/,
    })
  ).toBeDefined();
  expect(screen.getByDisplayValue("Repository Draft Work")).toBeDefined();
  expect(screen.getByDisplayValue("Repository Published Work")).toBeDefined();
  expect(screen.getAllByText(/草稿/).length).toBeGreaterThan(0);
  expect(screen.getAllByText(/已发布/).length).toBeGreaterThan(0);
  expect(screen.getAllByRole("button", { name: /保存为草稿/ }).length).toBeGreaterThan(0);
  expect(screen.getAllByRole("button", { name: /发布作品/ }).length).toBeGreaterThan(0);
  expect(screen.getAllByRole("button", { name: /保存更改/ }).length).toBeGreaterThan(0);
});

test("studio works page redirects unauthenticated visitors to login", async () => {
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

  await StudioWorksPage();

  expect(redirectMock).toHaveBeenCalledWith("/login");
});
