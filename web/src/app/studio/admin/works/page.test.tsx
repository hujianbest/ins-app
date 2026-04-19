import { render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";

import type { AccessControl } from "@/features/auth/types";
import type { CommunityWorkRecord } from "@/features/community/types";
import { createInMemoryCommunityRepositoryBundle } from "@/features/community/test-support";

const {
  redirectMock,
  getRequestAccessControlMock,
  getDefaultCommunityRepositoryBundleMock,
} = vi.hoisted(() => ({
  redirectMock: vi.fn(),
  getRequestAccessControlMock: vi.fn(),
  getDefaultCommunityRepositoryBundleMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({ redirect: redirectMock }));
vi.mock("@/features/auth/access-control", () => ({
  getRequestAccessControl: getRequestAccessControlMock,
}));
vi.mock("@/features/community/runtime", () => ({
  getDefaultCommunityRepositoryBundle: getDefaultCommunityRepositoryBundleMock,
}));

import AdminWorksPage from "./page";

function adminAccess(): AccessControl {
  return {
    session: {
      status: "authenticated",
      isAuthenticated: true,
      accountId: "account:admin:photographer",
      primaryRole: "photographer",
      email: "admin@example.com",
    },
    creatorCapability: {
      isCreator: true,
      canManageCreatorProfile: true,
      canPublishWorks: true,
    },
    studioGuard: { allowed: true, redirectTo: null, reason: "allowed" },
    adminCapability: { isAdmin: true, email: "admin@example.com" },
    adminGuard: { allowed: true, redirectTo: null, reason: "allowed" },
  };
}

function nonAdminAccess(): AccessControl {
  const a = adminAccess();
  return {
    ...a,
    session: { ...a.session, email: "user@example.com" } as never,
    adminCapability: { isAdmin: false, email: null },
    adminGuard: { allowed: false, redirectTo: "/studio", reason: "not_admin" },
  };
}

function makeWork(overrides: Partial<CommunityWorkRecord> & { id: string }): CommunityWorkRecord {
  return {
    ownerProfileId: "photographer:owner",
    ownerRole: "photographer",
    ownerSlug: "owner",
    ownerName: "Owner",
    status: "published",
    title: `Work ${overrides.id}`,
    category: "portrait",
    description: "",
    detailNote: "",
    coverAsset: "",
    publishedAt: "2026-04-19T00:00:00.000Z",
    updatedAt: "2026-04-19T00:00:00.000Z",
    ...overrides,
  };
}

function bundleWith(works: CommunityWorkRecord[]) {
  return createInMemoryCommunityRepositoryBundle({
    profiles: [],
    works,
    curation: [],
  });
}

test("admin works page redirects non-admin to /studio", async () => {
  redirectMock.mockReset();
  getRequestAccessControlMock.mockResolvedValue(nonAdminAccess());
  getDefaultCommunityRepositoryBundleMock.mockReturnValue(bundleWith([]));
  redirectMock.mockImplementation(() => {
    throw new Error("redirected");
  });

  await expect(AdminWorksPage({ searchParams: Promise.resolve({}) })).rejects.toThrow("redirected");
  expect(redirectMock).toHaveBeenCalledWith("/studio");
});

test("admin works page renders empty state when no works", async () => {
  redirectMock.mockReset();
  getRequestAccessControlMock.mockResolvedValue(adminAccess());
  getDefaultCommunityRepositoryBundleMock.mockReturnValue(bundleWith([]));

  const page = await AdminWorksPage({ searchParams: Promise.resolve({}) });
  render(page);

  expect(screen.getByText(/全库暂无作品/)).toBeDefined();
});

test("admin works page renders all works with status-specific buttons", async () => {
  redirectMock.mockReset();
  getRequestAccessControlMock.mockResolvedValue(adminAccess());
  getDefaultCommunityRepositoryBundleMock.mockReturnValue(
    bundleWith([
      makeWork({ id: "w-pub", status: "published", title: "Pub" }),
      makeWork({ id: "w-mod", status: "moderated", title: "Mod" }),
      makeWork({ id: "w-draft", status: "draft", title: "Draft" }),
    ]),
  );

  const page = await AdminWorksPage({ searchParams: Promise.resolve({}) });
  render(page);

  expect(screen.getByText("Pub")).toBeDefined();
  expect(screen.getByText("Mod")).toBeDefined();
  expect(screen.getByText("Draft")).toBeDefined();
  expect(screen.getByText("已发布")).toBeDefined();
  expect(screen.getByText("已隐藏")).toBeDefined();
  expect(screen.getByText("草稿")).toBeDefined();

  // published → 隐藏 button; moderated → 恢复 button; draft → no submit
  expect(screen.getByRole("button", { name: "隐藏" })).toBeDefined();
  expect(screen.getByRole("button", { name: "恢复" })).toBeDefined();
});

test("admin works page renders ?error= alert mapped to Chinese copy", async () => {
  redirectMock.mockReset();
  getRequestAccessControlMock.mockResolvedValue(adminAccess());
  getDefaultCommunityRepositoryBundleMock.mockReturnValue(bundleWith([]));

  const page = await AdminWorksPage({
    searchParams: Promise.resolve({ error: "work_not_found" }),
  });
  render(page);

  expect(screen.getByRole("alert")).toBeDefined();
  expect(screen.getByText(/未找到对应作品/)).toBeDefined();
});
