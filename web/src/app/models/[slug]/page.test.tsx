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
  expect(screen.getByText(/editorial highlights/i)).toBeDefined();
  expect(screen.getByRole("link", { name: /contact model/i })).toBeDefined();
  expect(screen.getByRole("link", { name: /log in to save this profile/i }).getAttribute("href")).toBe(
    "/login"
  );
  expect(screen.getByRole("link", { name: /soft light editorial/i }).getAttribute("href")).toBe(
    "/works/soft-light-editorial"
  );
});
