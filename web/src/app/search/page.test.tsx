import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";

const { searchCatalogMock } = vi.hoisted(() => ({
  searchCatalogMock: vi.fn(),
}));

vi.mock("@/features/search/search", () => ({
  searchCatalog: searchCatalogMock,
}));

import SearchPage from "./page";

afterEach(() => {
  cleanup();
  searchCatalogMock.mockReset();
});

test("search page renders suggested queries before input", async () => {
  searchCatalogMock.mockResolvedValue({
    query: "",
    works: [],
    profiles: [],
    opportunities: [],
    total: 0,
  });

  const page = await SearchPage({});
  render(page);

  expect(
    screen.getByRole("heading", {
      level: 1,
      name: /^搜索高匹配语境$/,
    }),
  ).toBeDefined();
  expect(screen.getByRole("link", { name: "夜色编辑人像" }).getAttribute("href")).toBe(
    "/search?q=%E5%A4%9C%E8%89%B2%E7%BC%96%E8%BE%91%E4%BA%BA%E5%83%8F",
  );
});

test("search page renders grouped results for a keyword", async () => {
  searchCatalogMock.mockResolvedValue({
    query: "上海",
    works: [
      {
        id: "work-1",
        href: "/works/work-1",
        kind: "work",
        badge: "编辑人像",
        title: "上海夜景人像",
        description: "一条作品命中。",
        meta: "Avery Vale · 摄影师",
      },
    ],
    profiles: [
      {
        id: "profile-1",
        href: "/photographers/avery",
        kind: "profile",
        badge: "摄影师",
        title: "Avery Vale",
        description: "一条创作者命中。",
        meta: "上海",
      },
    ],
    opportunities: [
      {
        id: "opportunity-1",
        href: "/opportunities/opportunity-1",
        kind: "opportunity",
        badge: "摄影师诉求",
        title: "上海夜景编辑拍摄招募",
        description: "一条合作内容命中。",
        meta: "Avery Vale",
        visualDescription: "上海 · 2026-04-20 晚间",
      },
    ],
    total: 3,
  });

  const page = await SearchPage({
    searchParams: Promise.resolve({ q: "上海" }),
  });
  render(page);

  expect(
    screen.getByRole("heading", { level: 1, name: /^上海$/ }),
  ).toBeDefined();
  expect(screen.getByRole("heading", { level: 2, name: "作品" })).toBeDefined();
  expect(screen.getByRole("heading", { level: 2, name: "创作者" })).toBeDefined();
  expect(screen.getByRole("heading", { level: 2, name: "合作线索" })).toBeDefined();
  expect(screen.getByRole("link", { name: /上海夜景人像/ }).getAttribute("href")).toBe(
    "/works/work-1",
  );
  expect(screen.getByText("摄影师诉求")).toBeDefined();
  expect(screen.getByText("上海 · 2026-04-20 晚间")).toBeDefined();
  expect(screen.getAllByText("Avery Vale").length).toBeGreaterThan(0);
  expect(screen.getByRole("link", { name: /上海夜景编辑拍摄招募/ }).getAttribute("href")).toBe(
    "/opportunities/opportunity-1",
  );
  const profileLink = screen
    .getAllByRole("link")
    .find((link) => link.getAttribute("href") === "/photographers/avery");

  expect(profileLink).toBeDefined();
});
