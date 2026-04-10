import { render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";

import type { PublicProfile } from "@/features/showcase/types";

const {
  getSessionContextMock,
  isProfileFollowedByViewerMock,
  notFoundMock,
  getPublicProfilePageModelMock,
  listPublicProfilePageParamsMock,
} = vi.hoisted(() => ({
  getSessionContextMock: vi.fn(),
  isProfileFollowedByViewerMock: vi.fn(),
  notFoundMock: vi.fn(),
  getPublicProfilePageModelMock: vi.fn(),
  listPublicProfilePageParamsMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  notFound: notFoundMock,
}));

vi.mock("@/features/auth/session", () => ({
  getSessionContext: getSessionContextMock,
}));

vi.mock("@/features/social/follows", () => ({
  isProfileFollowedByViewer: isProfileFollowedByViewerMock,
}));

vi.mock("@/features/community/public-read-model", () => ({
  getPublicProfilePageModel: getPublicProfilePageModelMock,
  listPublicProfilePageParams: listPublicProfilePageParamsMock,
}));

import PhotographerPage, { generateStaticParams } from "./page";

const photographerProfile: PublicProfile = {
  slug: "repo-photographer",
  role: "photographer",
  name: "Repo Avery",
  city: "上海",
  publishedAt: "2026-04-09T09:00:00Z",
  tagline: "repository backed profile",
  bio: "Repo biography",
  contactLabel: "联系摄影师",
  sectionTitle: "精选画面",
  sectionDescription: "只展示已发布作品。",
  heroImageLabel: "摄影师封面视觉",
  showcaseItems: [
    {
      workId: "repo-work",
      title: "Repo Work",
      subtitle: "编辑人像",
      description: "published only",
    },
  ],
};

test("photographer page generateStaticParams uses community public profile params", async () => {
  listPublicProfilePageParamsMock.mockResolvedValue([{ slug: "repo-photographer" }]);

  await expect(generateStaticParams()).resolves.toEqual([
    { slug: "repo-photographer" },
  ]);
});

test("photographer profile page renders the public showcase from repository read model", async () => {
  getSessionContextMock.mockResolvedValue({
    status: "authenticated",
    isAuthenticated: true,
    accountId: "demo-account:model",
    primaryRole: "model",
  });
  isProfileFollowedByViewerMock.mockResolvedValue(true);
  getPublicProfilePageModelMock.mockResolvedValue(photographerProfile);

  const page = await PhotographerPage({
    params: Promise.resolve({ slug: "repo-photographer" }),
  });

  render(page);

  expect(
    screen.getByRole("heading", {
      level: 1,
      name: photographerProfile.name,
    })
  ).toBeDefined();
  expect(screen.getByText(photographerProfile.bio)).toBeDefined();
  expect(screen.getByText(photographerProfile.sectionTitle)).toBeDefined();
  expect(screen.getByRole("button", { name: /取消关注/ })).toBeDefined();
  expect(screen.getByRole("button", { name: /私信/ })).toBeDefined();
  expect(
    screen.getByRole("link", { name: /Repo Work/ }).getAttribute("href")
  ).toBe("/works/repo-work");
});

test("photographer profile page uses notFound when the public read model hides the slug", async () => {
  getSessionContextMock.mockResolvedValue({
    status: "guest",
    isAuthenticated: false,
    accountId: null,
    primaryRole: null,
  });
  isProfileFollowedByViewerMock.mockResolvedValue(false);
  getPublicProfilePageModelMock.mockResolvedValue(null);
  notFoundMock.mockImplementation(() => {
    throw new Error("not-found");
  });

  await expect(
    PhotographerPage({
      params: Promise.resolve({ slug: "repo-photographer" }),
    }),
  ).rejects.toThrow("not-found");

  expect(notFoundMock).toHaveBeenCalled();
});
