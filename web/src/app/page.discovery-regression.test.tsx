import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";

const { resolveHomeDiscoverySectionsMock } = vi.hoisted(() => ({
  resolveHomeDiscoverySectionsMock: vi.fn(),
}));

vi.mock("@/features/home-discovery/resolver", () => ({
  resolveHomeDiscoverySections: resolveHomeDiscoverySectionsMock,
}));

import Home from "./page";

afterEach(() => {
  cleanup();
  resolveHomeDiscoverySectionsMock.mockReset();
});

test.each([
  {
    emptyKind: "featured",
    emptyStateCopy: /精选内容整理中/i,
  },
  {
    emptyKind: "latest",
    emptyStateCopy: /最新内容整理中/i,
  },
  {
    emptyKind: "following",
    emptyStateCopy: /登录后查看关注中的创作者更新/i,
  },
])(
  "home page keeps the hero and empty discovery shell visible when $emptyKind section has no items",
  async ({ emptyKind, emptyStateCopy }) => {
    resolveHomeDiscoverySectionsMock.mockResolvedValue([
      {
        kind: "featured",
        title: "精选推荐",
        description: "优先展示社区精选作品与创作者。",
        emptyStateCopy: "精选内容整理中。",
        items:
          emptyKind === "featured"
            ? []
            : [
                {
                  id: "featured-work-1",
                  href: "/works/featured-work-1",
                  badge: "编辑人像",
                  title: "测试精选",
                  description: "一张用于回归验证的精选作品卡片。",
                },
              ],
      },
      {
        kind: "latest",
        title: "最新发布",
        description: "按最新公开发布时间浏览社区内容。",
        emptyStateCopy: "最新内容整理中。",
        items:
          emptyKind === "latest"
            ? []
            : [
                {
                  id: "latest-work-1",
                  href: "/works/latest-work-1",
                  badge: "街头摄影",
                  title: "测试最新",
                  description: "一个用于验证最新分区的公开作品。",
                },
              ],
      },
      {
        kind: "following",
        title: "关注中",
        description: "关注创作者后，这里会显示他们的最新公开内容。",
        emptyStateCopy: "登录后查看关注中的创作者更新。",
        items:
          emptyKind === "following"
            ? []
            : [
                {
                  id: "following-work-1",
                  href: "/works/following-work-1",
                  badge: "摄影师",
                  title: "关注中的更新",
                  description: "一条用于验证关注中分区的作品。",
                },
              ],
      },
    ]);

    const page = await Home();
    render(page);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /让相关的人继续发现你的作品/i,
      })
    ).toBeDefined();
    expect(screen.getByText(emptyStateCopy)).toBeDefined();

    if (emptyKind !== "featured") {
      expect(screen.getByText("测试精选").closest("a")?.getAttribute("href")).toBe(
        "/works/featured-work-1"
      );
    }

    if (emptyKind !== "latest") {
      expect(screen.getByText("测试最新").closest("a")?.getAttribute("href")).toBe(
        "/works/latest-work-1"
      );
    }

    if (emptyKind !== "following") {
      expect(screen.getByText("关注中的更新").closest("a")?.getAttribute("href")).toBe(
        "/works/following-work-1"
      );
    }
  }
);
