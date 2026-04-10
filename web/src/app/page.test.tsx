import { render, screen } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";

const { resolveHomeDiscoverySectionsMock } = vi.hoisted(() => ({
  resolveHomeDiscoverySectionsMock: vi.fn(),
}));

vi.mock("@/features/home-discovery/resolver", () => ({
  resolveHomeDiscoverySections: resolveHomeDiscoverySectionsMock,
}));

import Home from "./page";

afterEach(() => {
  resolveHomeDiscoverySectionsMock.mockReset();
});

test("home page prioritizes community discovery entry points instead of the old showcase-and-opportunity pitch", async () => {
  resolveHomeDiscoverySectionsMock.mockResolvedValue([
    {
      kind: "featured",
      title: "精选推荐",
      description: "优先展示社区精选作品与创作者。",
      emptyStateCopy: "精选内容整理中。",
      items: [
        {
          id: "featured-work",
          href: "/works/featured-work",
          contentKind: "work",
          badge: "编辑人像",
          title: "社区精选作品",
          description: "一条来自社区主线的精选内容。",
        },
      ],
    },
    {
      kind: "latest",
      title: "最新发布",
      description: "按最新公开发布时间浏览社区内容。",
      emptyStateCopy: "最新内容整理中。",
      items: [],
    },
  ]);

  const page = await Home();
  render(page);

  expect(
    screen.getByRole("heading", {
      level: 1,
      name: /从作品开始浏览/i,
    })
  ).toBeDefined();
  expect(screen.getByRole("link", { name: /发现/i }).getAttribute("href")).toBe(
    "/discover"
  );
  expect(
    screen.getByRole("heading", { level: 3, name: "社区精选作品" }).closest("a")?.getAttribute("href")
  ).toBe(
    "/works/featured-work"
  );
  expect(screen.getByRole("heading", { level: 2, name: /精选推荐/ })).toBeDefined();
  expect(screen.getByRole("heading", { level: 2, name: /最新发布/ })).toBeDefined();
  expect(screen.getAllByText(/诉求/).length).toBeGreaterThan(0);
  expect(screen.getByText(/测试环境使用已本地化的授权图片与虚构演示文案/i)).toBeDefined();
  expect(screen.getByText(/图片文件已本地化到仓库/i)).toBeDefined();
  expect(screen.queryByText(/作品展示与约拍平台/)).toBeNull();
  expect(screen.queryByRole("heading", { level: 2, name: /精选诉求/ })).toBeNull();
});
