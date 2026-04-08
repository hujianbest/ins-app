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

import StudioOpportunitiesPage from "./page";

test("studio opportunities page renders request management fields for the signed-in creator", async () => {
  redirectMock.mockReset();
  getSessionRoleMock.mockResolvedValue("photographer");

  const page = await StudioOpportunitiesPage();

  render(page);

  expect(
    screen.getByRole("heading", {
      level: 1,
      name: /manage opportunities/i,
    })
  ).toBeDefined();
  expect(screen.getByDisplayValue(/^Shanghai$/)).toBeDefined();
  expect(screen.getByDisplayValue(/^2026-04-20 evening$/)).toBeDefined();
  expect(screen.getByRole("button", { name: /publish request/i })).toBeDefined();
  expect(screen.getByText(/shanghai editorial casting/i)).toBeDefined();
});

test("studio opportunities page redirects unauthenticated visitors to login", async () => {
  redirectMock.mockReset();
  getSessionRoleMock.mockResolvedValue(null);

  await StudioOpportunitiesPage();

  expect(redirectMock).toHaveBeenCalledWith("/login");
});
