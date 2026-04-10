import { render, screen } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";

const { getSessionContextMock, resolveHomeDiscoverySectionsMock } = vi.hoisted(() => ({
  getSessionContextMock: vi.fn(),
  resolveHomeDiscoverySectionsMock: vi.fn(),
}));

vi.mock("@/features/auth/session", () => ({
  getSessionContext: getSessionContextMock,
}));

vi.mock("@/features/home-discovery/resolver", () => ({
  resolveHomeDiscoverySections: resolveHomeDiscoverySectionsMock,
}));

import DiscoverPage from "./page";

afterEach(() => {
  getSessionContextMock.mockReset();
  resolveHomeDiscoverySectionsMock.mockReset();
});

test("discover page stays publicly accessible and keeps a stable following empty state for guests", async () => {
  getSessionContextMock.mockResolvedValue({
    status: "guest",
    isAuthenticated: false,
    accountId: null,
    primaryRole: null,
  });
  resolveHomeDiscoverySectionsMock.mockResolvedValue([
    {
      kind: "featured",
      title: "精选推荐",
      description: "社区精选内容。",
      emptyStateCopy: "精选内容整理中。",
      items: [],
    },
    {
      kind: "latest",
      title: "最新发布",
      description: "最新公开内容。",
      emptyStateCopy: "最新内容整理中。",
      items: [],
    },
    {
      kind: "following",
      title: "关注中",
      description: "关注创作者后，这里会显示他们的最新公开内容。",
      emptyStateCopy: "登录后查看关注中的创作者更新。",
      items: [],
    },
  ]);

  const page = await DiscoverPage();
  render(page);

  expect(
    screen.getByRole("heading", { level: 1, name: /继续发现作品与创作者/i })
  ).toBeDefined();
  expect(screen.getAllByText(/关注中/).length).toBeGreaterThan(0);
  expect(screen.getByText(/登录后查看关注中的创作者更新/)).toBeDefined();
});

test("discover page shows followed updates section for authenticated members", async () => {
  getSessionContextMock.mockResolvedValue({
    status: "authenticated",
    isAuthenticated: true,
    accountId: "demo-account:photographer",
    primaryRole: "photographer",
  });
  resolveHomeDiscoverySectionsMock.mockResolvedValue([
    {
      kind: "featured",
      title: "精选推荐",
      description: "社区精选内容。",
      emptyStateCopy: "精选内容整理中。",
      items: [],
    },
    {
      kind: "latest",
      title: "最新发布",
      description: "最新公开内容。",
      emptyStateCopy: "最新内容整理中。",
      items: [],
    },
    {
      kind: "following",
      title: "关注中",
      description: "关注创作者后，这里会显示他们的最新公开内容。",
      emptyStateCopy: "关注创作者后，这里会显示他们的最新公开内容。",
      items: [
        {
          id: "followed-work",
          href: "/works/followed-work",
          badge: "摄影师",
          title: "关注中的新作品",
          description: "来自已关注创作者的更新。",
        },
      ],
    },
  ]);

  const page = await DiscoverPage();
  render(page);

  expect(screen.getByText("关注中的新作品").closest("a")?.getAttribute("href")).toBe(
    "/works/followed-work"
  );
});
