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
      sourceLabel: "作品：霓虹人像研究",
      preview: "有新的咨询从这组作品发起。",
      sourceHref: "/works/neon-portrait-study",
    },
  ]);

  const page = await InboxPage();

  render(page);

  expect(
    screen.getByRole("heading", {
      level: 1,
      name: /摄影师消息/,
    })
  ).toBeDefined();
  expect(screen.getByText(/有新的咨询从这组作品发起/)).toBeDefined();
  expect(screen.getByRole("link", { name: /查看来源/ }).getAttribute("href")).toBe(
    "/works/neon-portrait-study"
  );
});

test("inbox page redirects unauthenticated visitors to login", async () => {
  redirectMock.mockReset();
  getSessionRoleMock.mockResolvedValue(null);

  await InboxPage();

  expect(redirectMock).toHaveBeenCalledWith("/login");
});
