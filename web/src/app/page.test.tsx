import { readFileSync } from "node:fs";
import path from "node:path";

import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";

import {
  homePageFeaturedPaths,
  opportunityPosts,
  photographerProfiles,
  works,
} from "@/features/showcase/sample-data";

import Home from "./page";

test("home page renders the branded hero, feature entry points, and discovery sections", () => {
  render(<Home />);

  expect(
    screen.getByRole("heading", {
      level: 1,
      name: /lens archive/i,
    })
  ).toBeDefined();

  expect(screen.getByText(/featured pathways/i)).toBeDefined();
  expect(screen.getByText(homePageFeaturedPaths[0].title)).toBeDefined();
  expect(screen.getByText(homePageFeaturedPaths[1].title)).toBeDefined();
  expect(screen.getByRole("heading", { level: 2, name: /featured works/i })).toBeDefined();
  expect(screen.getByRole("heading", { level: 2, name: /featured profiles/i })).toBeDefined();
  expect(screen.getByRole("heading", { level: 2, name: /featured opportunities/i })).toBeDefined();
  expect(screen.getByText(works[0].title).closest("a")?.getAttribute("href")).toBe(
    `/works/${works[0].id}`
  );
  expect(screen.getByText(photographerProfiles[0].name).closest("a")?.getAttribute("href")).toBe(
    `/photographers/${photographerProfiles[0].slug}`
  );
  expect(screen.getByText(opportunityPosts[0].title).closest("a")?.getAttribute("href")).toBe(
    `/opportunities/${opportunityPosts[0].id}`
  );
  expect(screen.queryByText(/to get started, edit the page\.tsx file\./i)).toBeNull();
  expect(screen.queryByText(/deploy now/i)).toBeNull();
});

test("home page reads featured content from the shared sample data module", () => {
  const pageSource = readFileSync(path.join(process.cwd(), "src/app/page.tsx"), "utf8");

  expect(pageSource).not.toContain("const featuredPaths = [");
  expect(pageSource).toContain("homePageFeaturedPaths");
});
