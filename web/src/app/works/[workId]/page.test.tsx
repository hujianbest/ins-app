import { render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";

import type { PublicWork } from "@/features/showcase/types";

const {
  getSessionRoleMock,
  isWorkLikedMock,
  getWorkCommentsMock,
  notFoundMock,
  getPublicWorkPageModelMock,
  listPublicWorkPageParamsMock,
} = vi.hoisted(() => ({
  getSessionRoleMock: vi.fn(),
  isWorkLikedMock: vi.fn(),
  getWorkCommentsMock: vi.fn(),
  notFoundMock: vi.fn(),
  getPublicWorkPageModelMock: vi.fn(),
  listPublicWorkPageParamsMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  notFound: notFoundMock,
}));

vi.mock("@/features/auth/session", () => ({
  getSessionRole: getSessionRoleMock,
}));

vi.mock("@/features/engagement/state", () => ({
  isWorkLiked: isWorkLikedMock,
}));

vi.mock("@/features/community/public-read-model", () => ({
  getPublicWorkPageModel: getPublicWorkPageModelMock,
  listPublicWorkPageParams: listPublicWorkPageParamsMock,
}));

vi.mock("@/features/social/comments", () => ({
  getWorkComments: getWorkCommentsMock,
}));

import WorkDetailPage, { generateStaticParams } from "./page";

const publicWork: PublicWork = {
  id: "repo-work",
  ownerSlug: "repo-photographer",
  ownerRole: "photographer",
  ownerName: "Repo Avery",
  publishedAt: "2026-04-09T09:00:00Z",
  title: "Repo Work",
  category: "编辑人像",
  description: "Repository backed work description",
  detailNote: "Repository backed detail note",
  contactLabel: "联系摄影师",
};

test("work detail generateStaticParams uses published repository work params", async () => {
  listPublicWorkPageParamsMock.mockResolvedValue([{ workId: "repo-work" }]);

  await expect(generateStaticParams()).resolves.toEqual([{ workId: "repo-work" }]);
});

test("work detail page renders repository-backed work content and owner summary", async () => {
  getSessionRoleMock.mockResolvedValue("photographer");
  isWorkLikedMock.mockResolvedValue(true);
  getWorkCommentsMock.mockResolvedValue([
    {
      id: "comment-2",
      authorLabel: "摄影师",
      body: "最新评论",
      createdAt: "2026-04-09T10:00:00Z",
    },
    {
      id: "comment-1",
      authorLabel: "模特",
      body: "更早评论",
      createdAt: "2026-04-09T09:00:00Z",
    },
  ]);
  getPublicWorkPageModelMock.mockResolvedValue(publicWork);

  const page = await WorkDetailPage({
    params: Promise.resolve({ workId: "repo-work" }),
  });

  render(page);

  expect(
    screen.getByRole("heading", {
      level: 1,
      name: publicWork.title,
    })
  ).toBeDefined();
  expect(screen.getByText(publicWork.description)).toBeDefined();
  expect(screen.getByText(publicWork.ownerName)).toBeDefined();
  expect(screen.getByRole("button", { name: /已点赞/ })).toBeDefined();
  expect(screen.getByRole("button", { name: /发送关于这组作品的私信/ })).toBeDefined();
  expect(screen.getByRole("button", { name: /发表评论/ })).toBeDefined();
  expect(screen.getAllByText(/评论/).length).toBeGreaterThan(0);
  expect(screen.getByText("最新评论")).toBeDefined();
  expect(screen.getByRole("link", { name: /返回主页/ }).getAttribute("href")).toBe(
    "/photographers/repo-photographer"
  );
});

test("work detail page asks guests to log in before liking", async () => {
  getSessionRoleMock.mockResolvedValue(null);
  isWorkLikedMock.mockResolvedValue(false);
  getWorkCommentsMock.mockResolvedValue([]);
  getPublicWorkPageModelMock.mockResolvedValue(publicWork);

  const page = await WorkDetailPage({
    params: Promise.resolve({ workId: "repo-work" }),
  });

  render(page);

  expect(screen.getByRole("link", { name: /登录后点赞这组作品/ }).getAttribute("href")).toBe(
    "/login"
  );
  expect(screen.getByRole("link", { name: /登录后发表评论/ }).getAttribute("href")).toBe(
    "/login"
  );
});

test("work detail page uses notFound when the public read model hides a draft work", async () => {
  getSessionRoleMock.mockResolvedValue(null);
  isWorkLikedMock.mockResolvedValue(false);
  getWorkCommentsMock.mockResolvedValue([]);
  getPublicWorkPageModelMock.mockResolvedValue(null);
  notFoundMock.mockImplementation(() => {
    throw new Error("not-found");
  });

  await expect(
    WorkDetailPage({
      params: Promise.resolve({ workId: "draft-work" }),
    }),
  ).rejects.toThrow("not-found");

  expect(notFoundMock).toHaveBeenCalled();
});
