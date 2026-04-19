import { expect, test, vi } from "vitest";

import type { AccessControl } from "@/features/auth/types";

const {
  revalidatePathMock,
  redirectMock,
  getRequestAccessControlMock,
  saveCreatorWorkForRoleMock,
} = vi.hoisted(() => ({
  revalidatePathMock: vi.fn(),
  redirectMock: vi.fn(),
  getRequestAccessControlMock: vi.fn(),
  saveCreatorWorkForRoleMock: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: revalidatePathMock,
}));

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

vi.mock("@/features/auth/access-control", () => ({
  getRequestAccessControl: getRequestAccessControlMock,
}));

vi.mock("./work-editor", () => ({
  saveCreatorWorkForRole: saveCreatorWorkForRoleMock,
}));

import { saveStudioWorkAction } from "./work-actions";

function createGuestAccessControl(): AccessControl {
  return {
    session: {
      status: "guest",
      isAuthenticated: false,
      accountId: null,
      primaryRole: null,
    },
    creatorCapability: {
      canManageStudio: false,
      reason: "guest",
    },
    studioGuard: {
      allowed: false,
      redirectTo: "/login",
    },
  };
}

function createAuthenticatedAccessControl(): AccessControl {
  return {
    session: {
      status: "authenticated",
      isAuthenticated: true,
      accountId: "account:photographer",
      primaryRole: "photographer",
      email: "photographer@test.lens-archive.local",
    },
    creatorCapability: {
      canManageStudio: true,
      reason: "role-supported",
    },
    studioGuard: {
      allowed: true,
      redirectTo: null,
    },
  };
}

function createWorkFormData() {
  const formData = new FormData();
  formData.set("title", "Action Saved Work");
  formData.set("category", "概念人像");
  formData.set("description", "Action description");
  formData.set("detailNote", "Action detail note");
  formData.set("coverAsset", "work:action-saved-work:cover");
  formData.set("intent", "publish");
  return formData;
}

test("saveStudioWorkAction redirects guests to login", async () => {
  getRequestAccessControlMock.mockResolvedValue(createGuestAccessControl());

  await saveStudioWorkAction(createWorkFormData());

  expect(redirectMock).toHaveBeenCalledWith("/login");
  expect(saveCreatorWorkForRoleMock).not.toHaveBeenCalled();
});

test("saveStudioWorkAction persists the work and revalidates related paths", async () => {
  redirectMock.mockReset();
  revalidatePathMock.mockReset();
  getRequestAccessControlMock.mockResolvedValue(createAuthenticatedAccessControl());
  saveCreatorWorkForRoleMock.mockResolvedValue({
    id: "action-saved-work",
    ownerRole: "photographer",
    ownerSlug: "sample-photographer",
  });

  await saveStudioWorkAction(createWorkFormData());

  expect(saveCreatorWorkForRoleMock).toHaveBeenCalledWith(
    "photographer",
    expect.objectContaining({
      title: "Action Saved Work",
      intent: "publish",
      coverAsset: "work:action-saved-work:cover",
    }),
  );
  expect(revalidatePathMock).toHaveBeenCalledWith("/studio/works");
  expect(revalidatePathMock).toHaveBeenCalledWith("/");
  expect(revalidatePathMock).toHaveBeenCalledWith("/discover");
  expect(revalidatePathMock).toHaveBeenCalledWith(
    "/photographers/sample-photographer",
  );
  expect(revalidatePathMock).toHaveBeenCalledWith("/works/action-saved-work");
});
