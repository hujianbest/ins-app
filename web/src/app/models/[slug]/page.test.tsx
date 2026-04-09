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

import ModelPage, { generateStaticParams } from "./page";

const modelProfile: PublicProfile = {
  slug: "repo-model",
  role: "model",
  name: "Repo Mika",
  city: "杭州",
  publishedAt: "2026-04-09T09:00:00Z",
  tagline: "repository backed model profile",
  bio: "Repo model biography",
  contactLabel: "联系模特",
  sectionTitle: "编辑精选",
  sectionDescription: "只展示已发布作品。",
  heroImageLabel: "模特封面视觉",
  showcaseItems: [
    {
      workId: "repo-model-work",
      title: "Repo Model Work",
      subtitle: "美妆片",
      description: "published only",
    },
  ],
};

test("model page generateStaticParams uses community public profile params", async () => {
  listPublicProfilePageParamsMock.mockResolvedValue([{ slug: "repo-model" }]);

  await expect(generateStaticParams()).resolves.toEqual([{ slug: "repo-model" }]);
});

test("model profile page renders the public showcase from repository read model", async () => {
  getSessionContextMock.mockResolvedValue({
    status: "guest",
    isAuthenticated: false,
    accountId: null,
    primaryRole: null,
  });
  isProfileFollowedByViewerMock.mockResolvedValue(false);
  getPublicProfilePageModelMock.mockResolvedValue(modelProfile);

  const page = await ModelPage({
    params: Promise.resolve({ slug: "repo-model" }),
  });

  render(page);

  expect(
    screen.getByRole("heading", {
      level: 1,
      name: modelProfile.name,
    })
  ).toBeDefined();
  expect(screen.getByText(modelProfile.bio)).toBeDefined();
  expect(screen.getByText(modelProfile.sectionTitle)).toBeDefined();
  expect(screen.getByRole("link", { name: /联系模特/ })).toBeDefined();
  expect(screen.getByRole("link", { name: /登录后关注这位创作者/ }).getAttribute("href")).toBe(
    "/login"
  );
  expect(screen.getByRole("link", { name: /Repo Model Work/ }).getAttribute("href")).toBe(
    "/works/repo-model-work"
  );
});

test("model profile page uses notFound when the public read model hides the slug", async () => {
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
    ModelPage({
      params: Promise.resolve({ slug: "repo-model" }),
    }),
  ).rejects.toThrow("not-found");

  expect(notFoundMock).toHaveBeenCalled();
});
