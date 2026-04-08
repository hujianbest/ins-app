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

import { photographerProfiles } from "@/features/showcase/sample-data";

import PhotographerPage from "./page";

test("photographer profile page renders the public showcase for a known slug", async () => {
  getSessionRoleMock.mockResolvedValue("model");
  isProfileFavoritedMock.mockResolvedValue(true);

  const page = await PhotographerPage({
    params: Promise.resolve({ slug: "sample-photographer" }),
  });

  render(page);

  expect(
    screen.getByRole("heading", {
      level: 1,
      name: photographerProfiles[0].name,
    })
  ).toBeDefined();
  expect(screen.getByText(photographerProfiles[0].bio)).toBeDefined();
  expect(screen.getByText(/featured frames/i)).toBeDefined();
  expect(screen.getByRole("button", { name: /saved to favorites/i })).toBeDefined();
  expect(screen.getByRole("button", { name: /send message about this profile/i })).toBeDefined();
  expect(
    screen.getByRole("link", { name: /neon portrait study/i }).getAttribute("href")
  ).toBe("/works/neon-portrait-study");
});
