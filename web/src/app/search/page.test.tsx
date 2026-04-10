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
      name: /^搜索$/,
    }),
  ).toBeDefined();
  expect(screen.getByRole("link", { name: "上海" }).getAttribute("href")).toBe(
    "/search?q=%E4%B8%8A%E6%B5%B7",
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
    opportunities: [],
    total: 2,
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
  expect(screen.getByRole("link", { name: /上海夜景人像/ }).getAttribute("href")).toBe(
    "/works/work-1",
  );
  const profileLink = screen
    .getAllByRole("link")
    .find((link) => link.getAttribute("href") === "/photographers/avery");

  expect(profileLink).toBeDefined();
});
