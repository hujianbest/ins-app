import { expect, test, vi } from "vitest";

const {
  revalidatePathMock,
  redirectMock,
  getSessionContextMock,
  saveWorkCommentForViewerMock,
} = vi.hoisted(() => ({
  revalidatePathMock: vi.fn(),
  redirectMock: vi.fn(),
  getSessionContextMock: vi.fn(),
  saveWorkCommentForViewerMock: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: revalidatePathMock,
}));

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

vi.mock("@/features/auth/session", () => ({
  getSessionContext: getSessionContextMock,
}));

vi.mock("./comments", () => ({
  saveWorkCommentForViewer: saveWorkCommentForViewerMock,
}));

import { addWorkCommentAction } from "./comment-actions";

test("addWorkCommentAction redirects guests to login", async () => {
  getSessionContextMock.mockResolvedValue({
    status: "guest",
    isAuthenticated: false,
    accountId: null,
    primaryRole: null,
  });

  const formData = new FormData();
  formData.set("body", "guest comment");
  await addWorkCommentAction("repo-work", "/works/repo-work", formData);

  expect(redirectMock).toHaveBeenCalledWith("/login");
  expect(saveWorkCommentForViewerMock).not.toHaveBeenCalled();
});

test("addWorkCommentAction saves comment for authenticated members and revalidates work detail", async () => {
  redirectMock.mockReset();
  revalidatePathMock.mockReset();
  getSessionContextMock.mockResolvedValue({
    status: "authenticated",
    isAuthenticated: true,
    accountId: "demo-account:model",
    primaryRole: "model",
  });

  const formData = new FormData();
  formData.set("body", "new comment");
  await addWorkCommentAction("repo-work", "/works/repo-work", formData);

  expect(saveWorkCommentForViewerMock).toHaveBeenCalledWith(
    "demo-account:model",
    "repo-work",
    "new comment",
  );
  expect(revalidatePathMock).toHaveBeenCalledWith("/works/repo-work");
});
