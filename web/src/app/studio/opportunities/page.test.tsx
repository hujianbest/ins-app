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
      name: /管理诉求/,
    })
  ).toBeDefined();
  expect(screen.getByDisplayValue(/^上海$/)).toBeDefined();
  expect(screen.getByDisplayValue(/^2026-04-20 晚间$/)).toBeDefined();
  expect(screen.getByRole("button", { name: /发布诉求/ })).toBeDefined();
  expect(screen.getByText(/上海编辑拍摄招募/)).toBeDefined();
});

test("studio opportunities page redirects unauthenticated visitors to login", async () => {
  redirectMock.mockReset();
  getSessionRoleMock.mockResolvedValue(null);

  await StudioOpportunitiesPage();

  expect(redirectMock).toHaveBeenCalledWith("/login");
});
