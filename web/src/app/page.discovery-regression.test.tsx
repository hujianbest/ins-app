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
    emptyKind: "works",
    emptyStateCopy: /更多作品精选即将上线/i,
  },
  {
    emptyKind: "profiles",
    emptyStateCopy: /更多主页精选即将上线/i,
  },
  {
    emptyKind: "opportunities",
    emptyStateCopy: /更多约拍诉求即将上线/i,
  },
])(
  "home page keeps the hero and empty discovery shell visible when $emptyKind section has no items",
  ({ emptyKind, emptyStateCopy }) => {
    resolveHomeDiscoverySectionsMock.mockReturnValue([
      {
        kind: "works",
        title: "精选作品",
        description: "从社区最新作品里挑出的优先浏览内容。",
        items:
          emptyKind === "works"
            ? []
            : [
                {
                  id: "work-1",
                  href: "/works/work-1",
                  badge: "编辑人像",
                  title: "测试作品",
                  description: "一张用于回归验证的精选作品卡片。",
                },
              ],
      },
      {
        kind: "profiles",
        title: "精选主页",
        description: "认识准备开启合作的摄影师与模特。",
        items:
          emptyKind === "profiles"
            ? []
            : [
                {
                  id: "profile-1",
                  href: "/photographers/test-profile",
                  badge: "摄影师",
                  title: "测试主页",
                  description: "一个用于验证首页跳转的创作者主页。",
                },
              ],
      },
      {
        kind: "opportunities",
        title: "精选诉求",
        description: "浏览最新发布的约拍诉求与合作请求。",
        items:
          emptyKind === "opportunities"
            ? []
            : [
                {
                  id: "post-1",
                  href: "/opportunities/post-1",
                  badge: "Shanghai",
                  title: "测试诉求",
                  description: "一条用于回归验证的在线约拍诉求。",
                },
              ],
      },
    ]);

    render(<Home />);

    expect(screen.getByRole("heading", { level: 1, name: /lens archive/i })).toBeDefined();
    expect(screen.getByText(emptyStateCopy)).toBeDefined();

    if (emptyKind !== "works") {
      expect(screen.getByText("测试作品").closest("a")?.getAttribute("href")).toBe("/works/work-1");
    }

    if (emptyKind !== "profiles") {
      expect(screen.getByText("测试主页").closest("a")?.getAttribute("href")).toBe(
        "/photographers/test-profile"
      );
    }

    if (emptyKind !== "opportunities") {
      expect(screen.getByText("测试诉求").closest("a")?.getAttribute("href")).toBe(
        "/opportunities/post-1"
      );
    }
  }
);
