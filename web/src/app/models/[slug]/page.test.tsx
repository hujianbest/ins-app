import { render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";

const { getSessionRoleMock, isProfileFavoritedMock } = vi.hoisted(() => ({
  getSessionRoleMock: vi.fn(),
  isProfileFavoritedMock: vi.fn(),
}));

vi.mock("@/features/auth/session", () => ({
  getSessionRole: getSessionRoleMock,
}));

vi.mock("@/features/engagement/state", () => ({
  isProfileFavorited: isProfileFavoritedMock,
}));

import { modelProfiles } from "@/features/showcase/sample-data";

import ModelPage from "./page";

test("model profile page renders the public showcase for a known slug", async () => {
  getSessionRoleMock.mockResolvedValue(null);
  isProfileFavoritedMock.mockResolvedValue(false);

  const page = await ModelPage({
    params: Promise.resolve({ slug: "sample-model" }),
  });

  render(page);

  expect(
    screen.getByRole("heading", {
      level: 1,
      name: modelProfiles[0].name,
    })
  ).toBeDefined();
  expect(screen.getByText(modelProfiles[0].bio)).toBeDefined();
  expect(screen.getByText(modelProfiles[0].sectionTitle)).toBeDefined();
  expect(screen.getByRole("link", { name: /联系模特/ })).toBeDefined();
  expect(screen.getByRole("link", { name: /登录后收藏这份主页/ }).getAttribute("href")).toBe(
    "/login"
  );
  expect(screen.getByRole("link", { name: /柔光编辑片/ }).getAttribute("href")).toBe(
    "/works/soft-light-editorial"
  );
});
