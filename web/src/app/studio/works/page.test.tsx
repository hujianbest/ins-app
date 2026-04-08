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
      name: /manage works/i,
    })
  ).toBeDefined();
  expect(screen.getByText(/neon portrait study/i)).toBeDefined();
  expect(screen.getByText(/monochrome street session/i)).toBeDefined();
  expect(screen.getByRole("button", { name: /add new work/i })).toBeDefined();
});
