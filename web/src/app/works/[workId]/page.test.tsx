import { render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";

const { getSessionRoleMock, isWorkLikedMock } = vi.hoisted(() => ({
  getSessionRoleMock: vi.fn(),
  isWorkLikedMock: vi.fn(),
}));

vi.mock("@/features/auth/session", () => ({
  getSessionRole: getSessionRoleMock,
}));

vi.mock("@/features/engagement/state", () => ({
  isWorkLiked: isWorkLikedMock,
}));

import { works } from "@/features/showcase/sample-data";

import WorkDetailPage from "./page";

test("work detail page renders the work content and owner summary", async () => {
  getSessionRoleMock.mockResolvedValue("photographer");
  isWorkLikedMock.mockResolvedValue(true);

  const page = await WorkDetailPage({
    params: Promise.resolve({ workId: "neon-portrait-study" }),
  });

  render(page);

  expect(
    screen.getByRole("heading", {
      level: 1,
      name: works[0].title,
    })
  ).toBeDefined();
  expect(screen.getByText(works[0].description)).toBeDefined();
  expect(screen.getByText(works[0].ownerName)).toBeDefined();
  expect(screen.getByRole("button", { name: /liked/i })).toBeDefined();
  expect(screen.getByRole("button", { name: /send message about this work/i })).toBeDefined();
  expect(screen.getByRole("link", { name: /back to profile/i }).getAttribute("href")).toBe(
    "/photographers/sample-photographer"
  );
});

test("work detail page asks guests to log in before liking", async () => {
  getSessionRoleMock.mockResolvedValue(null);
  isWorkLikedMock.mockResolvedValue(false);

  const page = await WorkDetailPage({
    params: Promise.resolve({ workId: "neon-portrait-study" }),
  });

  render(page);

  expect(screen.getByRole("link", { name: /log in to like this work/i }).getAttribute("href")).toBe(
    "/login"
  );
});
