import { render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";

import type { AccessControl } from "@/features/auth/types";
import type { CommunityRepositoryBundle } from "@/features/community/types";
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

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

vi.mock("@/features/auth/access-control", () => ({
  getRequestAccessControl: getRequestAccessControlMock,
}));

vi.mock("@/features/community/runtime", () => ({
  getDefaultCommunityRepositoryBundle: getDefaultCommunityRepositoryBundleMock,
}));

import AdminCurationPage from "./page";

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
  return {
    session: {
      status: "authenticated",
      isAuthenticated: true,
      accountId: "account:photographer",
      primaryRole: "photographer",
      email: "user@example.com",
    },
    creatorCapability: {
      isCreator: true,
      canManageCreatorProfile: true,
      canPublishWorks: true,
    },
    studioGuard: { allowed: true, redirectTo: null, reason: "allowed" },
    adminCapability: { isAdmin: false, email: null },
    adminGuard: { allowed: false, redirectTo: "/studio", reason: "not_admin" },
  };
}

function guestAccess(): AccessControl {
  return {
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
    studioGuard: { allowed: false, redirectTo: "/login", reason: "unauthenticated" },
    adminCapability: { isAdmin: false, email: null },
    adminGuard: { allowed: false, redirectTo: "/login", reason: "unauthenticated" },
  };
}

function bundleWithSlots(slots: Parameters<typeof createInMemoryCommunityRepositoryBundle>[0]["curation"] = []): CommunityRepositoryBundle {
  return createInMemoryCommunityRepositoryBundle({
    profiles: [],
    works: [],
    curation: slots ?? [],
  });
}

test("admin curation page redirects guest to /login", async () => {
  redirectMock.mockReset();
  getRequestAccessControlMock.mockResolvedValue(guestAccess());
  getDefaultCommunityRepositoryBundleMock.mockReturnValue(bundleWithSlots());
  redirectMock.mockImplementation(() => {
    throw new Error("redirected");
  });

  await expect(AdminCurationPage({ searchParams: Promise.resolve({}) })).rejects.toThrow("redirected");
  expect(redirectMock).toHaveBeenCalledWith("/login");
});

test("admin curation page redirects non-admin to /studio", async () => {
  redirectMock.mockReset();
  getRequestAccessControlMock.mockResolvedValue(nonAdminAccess());
  getDefaultCommunityRepositoryBundleMock.mockReturnValue(bundleWithSlots());
  redirectMock.mockImplementation(() => {
    throw new Error("redirected");
  });

  await expect(AdminCurationPage({ searchParams: Promise.resolve({}) })).rejects.toThrow("redirected");
  expect(redirectMock).toHaveBeenCalledWith("/studio");
});

test("admin curation page renders empty state for both surfaces when no slots exist", async () => {
  redirectMock.mockReset();
  getRequestAccessControlMock.mockResolvedValue(adminAccess());
  getDefaultCommunityRepositoryBundleMock.mockReturnValue(bundleWithSlots());

  const page = await AdminCurationPage({ searchParams: Promise.resolve({}) });
  render(page);

  expect(
    screen.getByRole("heading", { level: 1, name: /精选位编排/ }),
  ).toBeDefined();
  expect(
    screen.getAllByText(/该 surface 暂无精选 slot/).length,
  ).toBe(2);
  expect(
    screen.getByRole("heading", { level: 2, name: /首页 \(home\)/ }),
  ).toBeDefined();
  expect(
    screen.getByRole("heading", { level: 2, name: /发现页 \(discover\)/ }),
  ).toBeDefined();
});

test("admin curation page renders existing slots in a table with reorder/remove buttons", async () => {
  redirectMock.mockReset();
  getRequestAccessControlMock.mockResolvedValue(adminAccess());
  getDefaultCommunityRepositoryBundleMock.mockReturnValue(
    bundleWithSlots([
      {
        surface: "home",
        sectionKind: "works",
        targetType: "work",
        targetKey: "missing-work",
        order: 1,
      },
    ]),
  );

  const page = await AdminCurationPage({ searchParams: Promise.resolve({}) });
  const { container } = render(page);

  expect(screen.getByText("missing-work")).toBeDefined();
  expect(screen.getByText(/目标不存在 \/ 已下架/)).toBeDefined();
  expect(container.querySelectorAll("button[type='submit']").length).toBeGreaterThan(0);
});

test("admin curation page renders ?error= alert with mapped Chinese copy", async () => {
  redirectMock.mockReset();
  getRequestAccessControlMock.mockResolvedValue(adminAccess());
  getDefaultCommunityRepositoryBundleMock.mockReturnValue(bundleWithSlots());

  const page = await AdminCurationPage({
    searchParams: Promise.resolve({ error: "invalid_curation_input" }),
  });
  render(page);

  expect(screen.getByRole("alert")).toBeDefined();
  expect(
    screen.getByText(/输入字段不合法/),
  ).toBeDefined();
});
