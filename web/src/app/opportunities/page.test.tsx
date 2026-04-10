import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";

import { opportunityPosts } from "@/features/showcase/sample-data";

import OpportunitiesPage from "./page";

test("opportunities page renders the public list of active booking requests", () => {
  render(<OpportunitiesPage />);

  expect(
    screen.getByRole("heading", {
      level: 1,
      name: /^诉求$/,
    })
  ).toBeDefined();
  expect(screen.getByText(opportunityPosts[0].title)).toBeDefined();
  expect(screen.getAllByText(opportunityPosts[0].city).length).toBeGreaterThan(0);
  expect(screen.getByText(opportunityPosts[0].schedule)).toBeDefined();
  expect(screen.getAllByText(opportunityPosts[0].ownerName).length).toBeGreaterThan(0);
  expect(screen.getByRole("link", { name: new RegExp(opportunityPosts[0].title, "i") }).getAttribute("href")).toBe(
    `/opportunities/${opportunityPosts[0].id}`
  );
});
