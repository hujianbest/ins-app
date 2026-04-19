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
    adminCapability: { isAdmin: false, email: null },
    adminGuard: {
      allowed: false,
      redirectTo: "/studio",
      reason: "not_admin",
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

  const page = await StudioWorksPage({});

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
  expect(screen.getAllByRole("button", { name: /存草稿/ }).length).toBeGreaterThan(0);
  expect(screen.getAllByRole("button", { name: /^发布$/ }).length).toBeGreaterThan(0);
  expect(screen.getAllByRole("button", { name: /^保存$/ }).length).toBeGreaterThan(0);
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
    adminCapability: { isAdmin: false, email: null },
    adminGuard: {
      allowed: false,
      redirectTo: "/login",
      reason: "unauthenticated",
    },
  } satisfies AccessControl);

  await StudioWorksPage({});

  expect(redirectMock).toHaveBeenCalledWith("/login");
});

test("studio works page renders moderated works as read-only with the appeal copy and no submit buttons (Phase 2 §3.2 FR-004 #6)", async () => {
  redirectMock.mockReset();
  getRequestAccessControlMock.mockResolvedValue(
    createAuthenticatedAccessControl("photographer"),
  );
  getStudioWorksEditorModelMock.mockResolvedValue([
    {
      id: "moderated-one",
      title: "Hidden by Ops",
      category: "编辑人像",
      description: "Hidden description",
      detailNote: "Hidden detail",
      coverAsset: "work:moderated:cover",
      status: "moderated",
      publishedAt: "2026-04-01T00:00:00Z",
    },
  ] satisfies StudioManagedWork[]);

  const page = await StudioWorksPage({});
  const { container } = render(page);

  expect(screen.getByText("Hidden by Ops")).toBeDefined();
  expect(screen.getByText(/已隐藏（运营处置）/)).toBeDefined();
  expect(screen.getByText(/请联系管理员/)).toBeDefined();
  // moderated row must NOT render publish / save_draft / revert_to_draft buttons
  const intentButtons = Array.from(container.querySelectorAll("button[name='intent']"));
  // Only the top "新建" form should still have submit buttons; the moderated work row should not add any.
  const hiddenWorkSection = Array.from(container.querySelectorAll("article")).find((el) =>
    el.textContent?.includes("Hidden by Ops"),
  );
  expect(hiddenWorkSection).toBeDefined();
  expect(hiddenWorkSection?.querySelectorAll("button").length).toBe(0);
  // top-of-page "新建" form still has its 2 intent buttons
  expect(intentButtons.length).toBe(2);
});

test("studio works page surfaces moderated_work_owner_locked alert when ?error= is set", async () => {
  redirectMock.mockReset();
  getRequestAccessControlMock.mockResolvedValue(
    createAuthenticatedAccessControl("photographer"),
  );
  getStudioWorksEditorModelMock.mockResolvedValue([] satisfies StudioManagedWork[]);

  const page = await StudioWorksPage({
    searchParams: Promise.resolve({ error: "moderated_work_owner_locked" }),
  });
  render(page);

  const alert = screen.getByRole("alert");
  expect(alert.textContent).toContain("该作品已被运营隐藏");
  expect(alert.textContent).toContain("moderated_work_owner_locked");
});
