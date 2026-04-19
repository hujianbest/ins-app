import { render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";

import type { AccessControl } from "@/features/auth/types";

const {
  redirectMock,
  getRequestAccessControlMock,
  getAdminAccountEmailsMock,
} = vi.hoisted(() => ({
  redirectMock: vi.fn(),
  getRequestAccessControlMock: vi.fn(),
  getAdminAccountEmailsMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({ redirect: redirectMock }));
vi.mock("@/features/auth/access-control", () => ({
  getRequestAccessControl: getRequestAccessControlMock,
}));
vi.mock("@/config/env", () => ({
  getAdminAccountEmails: getAdminAccountEmailsMock,
}));

import AdminDashboardPage from "./page";

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

test("admin dashboard redirects guest to /login", async () => {
  redirectMock.mockReset();
  getRequestAccessControlMock.mockResolvedValue({
    session: { status: "guest", isAuthenticated: false, accountId: null, primaryRole: null },
    creatorCapability: { isCreator: false, canManageCreatorProfile: false, canPublishWorks: false },
    studioGuard: { allowed: false, redirectTo: "/login", reason: "unauthenticated" },
    adminCapability: { isAdmin: false, email: null },
    adminGuard: { allowed: false, redirectTo: "/login", reason: "unauthenticated" },
  } satisfies AccessControl);
  getAdminAccountEmailsMock.mockReturnValue(new Set());
  redirectMock.mockImplementation(() => { throw new Error("redirected"); });

  await expect(AdminDashboardPage()).rejects.toThrow("redirected");
  expect(redirectMock).toHaveBeenCalledWith("/login");
});

test("admin dashboard redirects non-admin to /studio", async () => {
  redirectMock.mockReset();
  getRequestAccessControlMock.mockResolvedValue({
    session: {
      status: "authenticated",
      isAuthenticated: true,
      accountId: "account:user",
      primaryRole: "photographer",
      email: "user@example.com",
    },
    creatorCapability: { isCreator: true, canManageCreatorProfile: true, canPublishWorks: true },
    studioGuard: { allowed: true, redirectTo: null, reason: "allowed" },
    adminCapability: { isAdmin: false, email: null },
    adminGuard: { allowed: false, redirectTo: "/studio", reason: "not_admin" },
  } satisfies AccessControl);
  getAdminAccountEmailsMock.mockReturnValue(new Set(["admin@example.com"]));
  redirectMock.mockImplementation(() => { throw new Error("redirected"); });

  await expect(AdminDashboardPage()).rejects.toThrow("redirected");
  expect(redirectMock).toHaveBeenCalledWith("/studio");
});

test("admin dashboard renders three entry cards + admin email + allowlist size", async () => {
  redirectMock.mockReset();
  getRequestAccessControlMock.mockResolvedValue(adminAccess());
  getAdminAccountEmailsMock.mockReturnValue(
    new Set(["admin@example.com", "co-admin@example.com"]),
  );

  const page = await AdminDashboardPage();
  render(page);

  expect(
    screen.getByRole("heading", { level: 1, name: /总览/ }),
  ).toBeDefined();
  expect(screen.getByText("admin@example.com")).toBeDefined();
  expect(screen.getByText(/admin 名单大小：2/)).toBeDefined();

  const cards = [
    "/studio/admin/curation",
    "/studio/admin/works",
    "/studio/admin/audit",
  ];
  for (const href of cards) {
    expect(
      Array.from(document.querySelectorAll("a")).some(
        (a) => a.getAttribute("href") === href,
      ),
    ).toBe(true);
  }
});
