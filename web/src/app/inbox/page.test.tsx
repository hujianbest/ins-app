import { render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";

const { redirectMock, getSessionRoleMock, getInboxThreadsForRoleMock } = vi.hoisted(() => ({
  redirectMock: vi.fn(),
  getSessionRoleMock: vi.fn(),
  getInboxThreadsForRoleMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

vi.mock("@/features/auth/session", () => ({
  getSessionRole: getSessionRoleMock,
}));

vi.mock("@/features/contact/state", () => ({
  getInboxThreadsForRole: getInboxThreadsForRoleMock,
}));

import InboxPage from "./page";

test("inbox page renders contact threads for the signed-in role", async () => {
  redirectMock.mockReset();
  getSessionRoleMock.mockResolvedValue("photographer");
  getInboxThreadsForRoleMock.mockResolvedValue([
    {
      id: "model:photographer:work:neon-portrait-study",
      participantName: "Avery Vale",
      sourceLabel: "Work: Neon Portrait Study",
      preview: "New inquiry started from this work.",
      sourceHref: "/works/neon-portrait-study",
    },
  ]);

  const page = await InboxPage();

  render(page);

  expect(
    screen.getByRole("heading", {
      level: 1,
      name: /photographer messages/i,
    })
  ).toBeDefined();
  expect(screen.getByText(/new inquiry started from this work/i)).toBeDefined();
  expect(screen.getByRole("link", { name: /view source/i }).getAttribute("href")).toBe(
    "/works/neon-portrait-study"
  );
});

test("inbox page redirects unauthenticated visitors to login", async () => {
  redirectMock.mockReset();
  getSessionRoleMock.mockResolvedValue(null);

  await InboxPage();

  expect(redirectMock).toHaveBeenCalledWith("/login");
});
