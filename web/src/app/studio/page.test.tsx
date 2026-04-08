import { render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";

const { redirectMock, getSessionRoleMock } = vi.hoisted(() => ({
  redirectMock: vi.fn(),
  getSessionRoleMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

vi.mock("@/features/auth/session", () => ({
  getSessionRole: getSessionRoleMock,
}));

import StudioPage from "./page";

test("studio page renders the authenticated role landing view", async () => {
  redirectMock.mockReset();
  getSessionRoleMock.mockResolvedValue("photographer");

  const page = await StudioPage();

  render(page);

  expect(
    screen.getByRole("heading", {
      level: 1,
      name: /photographer studio/i,
    })
  ).toBeDefined();
  expect(screen.getByRole("link", { name: /open inbox/i }).getAttribute("href")).toBe("/inbox");
});

test("studio page redirects unauthenticated visitors to login", async () => {
  redirectMock.mockReset();
  getSessionRoleMock.mockResolvedValue(null);

  await StudioPage();

  expect(redirectMock).toHaveBeenCalledWith("/login");
});
