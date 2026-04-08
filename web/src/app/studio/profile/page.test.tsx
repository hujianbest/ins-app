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

import StudioProfilePage from "./page";

test("studio profile page renders editable creator profile fields", async () => {
  redirectMock.mockReset();
  getSessionRoleMock.mockResolvedValue("photographer");

  const page = await StudioProfilePage();

  render(page);

  expect(
    screen.getByRole("heading", {
      level: 1,
      name: /编辑主页/,
    })
  ).toBeDefined();
  expect(screen.getByDisplayValue(/avery vale/i)).toBeDefined();
  expect(screen.getByDisplayValue(/^上海$/)).toBeDefined();
  expect(screen.getByDisplayValue(/电影感合作项目/)).toBeDefined();
  expect(screen.getByRole("button", { name: /保存主页更改/ })).toBeDefined();
});

test("studio profile page redirects unauthenticated visitors to login", async () => {
  redirectMock.mockReset();
  getSessionRoleMock.mockResolvedValue(null);

  await StudioProfilePage();

  expect(redirectMock).toHaveBeenCalledWith("/login");
});
