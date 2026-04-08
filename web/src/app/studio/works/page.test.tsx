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

import StudioWorksPage from "./page";

test("studio works page renders the signed-in creator work list", async () => {
  redirectMock.mockReset();
  getSessionRoleMock.mockResolvedValue("photographer");

  const page = await StudioWorksPage();

  render(page);

  expect(
    screen.getByRole("heading", {
      level: 1,
      name: /管理作品/,
    })
  ).toBeDefined();
  expect(screen.getByText(/霓虹人像研究/)).toBeDefined();
  expect(screen.getByText(/黑白街头片段/)).toBeDefined();
  expect(screen.getByRole("button", { name: /添加新作品/ })).toBeDefined();
});
