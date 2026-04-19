import { render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";

import type { AccessControl } from "@/features/auth/types";
import type { AuditLogEntry } from "@/features/community/types";
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

import AdminAuditPage from "./page";

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

function bundleWith(audit: AuditLogEntry[]) {
  return createInMemoryCommunityRepositoryBundle({
    profiles: [],
    works: [],
    curation: [],
    audit,
  });
}

test("admin audit page redirects guest", async () => {
  redirectMock.mockReset();
  getRequestAccessControlMock.mockResolvedValue({
    session: { status: "guest", isAuthenticated: false, accountId: null, primaryRole: null },
    creatorCapability: { isCreator: false, canManageCreatorProfile: false, canPublishWorks: false },
    studioGuard: { allowed: false, redirectTo: "/login", reason: "unauthenticated" },
    adminCapability: { isAdmin: false, email: null },
    adminGuard: { allowed: false, redirectTo: "/login", reason: "unauthenticated" },
  } satisfies AccessControl);
  getDefaultCommunityRepositoryBundleMock.mockReturnValue(bundleWith([]));
  redirectMock.mockImplementation(() => { throw new Error("redirected"); });

  await expect(AdminAuditPage()).rejects.toThrow("redirected");
  expect(redirectMock).toHaveBeenCalledWith("/login");
});

test("admin audit page renders empty-state when no audit entries", async () => {
  redirectMock.mockReset();
  getRequestAccessControlMock.mockResolvedValue(adminAccess());
  getDefaultCommunityRepositoryBundleMock.mockReturnValue(bundleWith([]));

  const page = await AdminAuditPage();
  render(page);

  expect(screen.getByText(/暂无审计记录/)).toBeDefined();
});

test("admin audit page renders the latest entries newest-first", async () => {
  redirectMock.mockReset();
  getRequestAccessControlMock.mockResolvedValue(adminAccess());
  getDefaultCommunityRepositoryBundleMock.mockReturnValue(
    bundleWith([
      {
        id: "a",
        createdAt: "2026-04-19T01:00:00.000Z",
        actorAccountId: "account:admin",
        actorEmail: "admin@example.com",
        action: "curation.upsert",
        targetKind: "curation_slot",
        targetId: "home:works:work-1",
      },
      {
        id: "b",
        createdAt: "2026-04-19T02:00:00.000Z",
        actorAccountId: "account:admin",
        actorEmail: "admin@example.com",
        action: "work_moderation.hide",
        targetKind: "work",
        targetId: "work-2",
      },
    ]),
  );

  const page = await AdminAuditPage();
  const { container } = render(page);

  const items = container.querySelectorAll("li");
  expect(items.length).toBe(2);
  // Newest first: hide (02:00) before upsert (01:00)
  expect(items[0].textContent).toContain("隐藏作品");
  expect(items[0].textContent).toContain("work-2");
  expect(items[1].textContent).toContain("新增 / 更新精选位");
  expect(items[1].textContent).toContain("home:works:work-1");

  // actor email shown in the timestamp line
  expect(screen.getAllByText(/admin@example\.com/).length).toBe(2);
});
